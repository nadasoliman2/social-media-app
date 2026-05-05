import {IPost} from "../../common/interfaces/post.interface.js";
import {INotification} from "../../common/interfaces/notification.interface.js";
import {IUser,IPaginate} from "../../common/interfaces/index.js";
import { HydratedDocument, Types } from 'mongoose';
import {createPostBodyDto, ReactPostParamsDto,ReactPostQueryDto,UpdatePostParamsDto,UpdatePostBodyDto}from './post.dto.js';
import {UserRepository, PostRepository,CommentRepository,NotificationRepository } from '../../DB/repository/index.js';
import redis from "../../common/services/redis.service.js";
import {notificationService} from "../../common/services/notification.service.js";
import {s3service} from "../../common/services/s3.services.js";
import {AvailabilityEnum,NotificationType} from "../../common/enums/index.js";
import { Filter } from "firebase-admin/firestore";
import { BadRequestException, NotFoundException } from "../../common/exception/index.js";
import { randomUUID } from "crypto";
import { paginateDto } from "../../common/validation/general.validation.js"
import {getAvailability}from "../../common/utils/post.js";
import {toObjectId}from "../../common/utils/objectId.js";

class PostService{
            private readonly commentRepository:CommentRepository;
                private readonly notificationRepository:NotificationRepository;

      private readonly userRepository: UserRepository;
  private readonly s3: typeof s3service;
    private readonly redis: typeof redis;
    private readonly notification : typeof notificationService
    private readonly postRepository:PostRepository;
    constructor(){
        this.commentRepository = new CommentRepository()
        this.notificationRepository= new NotificationRepository()
            this.userRepository = new UserRepository();
        this.s3 = s3service;
        this.postRepository = new PostRepository();
this.redis = redis;
this.notification= notificationService
    }

async createPost(postData: createPostBodyDto, user: HydratedDocument<IUser>) {

  const mentions: Types.ObjectId[] = []
  const FCM_Tokens: string[] = []
  let mentionAccounts: HydratedDocument<IUser>[] = []

  if (postData.tags?.length) {

    mentionAccounts = await this.userRepository.find({
      filter: { _id: { $in: postData.tags } }
    })

    if (mentionAccounts.length !== postData.tags.length) {
      throw new NotFoundException('fail to find some or all mentioned accounts')
    }

    for (const tag of postData.tags) {
      mentions.push(Types.ObjectId.createFromHexString(tag))

      const tokens = await this.redis.getFCMs(tag) || []
      tokens.forEach(token => FCM_Tokens.push(token))
    }
  }

  const folderId = randomUUID()
  let attachments: string[] = []

  if (postData.files?.length) {
    attachments = await this.s3.uploadAssets({
      files: postData.files as Express.Multer.File[],
      path: `posts/${user._id}/${folderId}`
    })
  }

  // 🔹 Create Post
  const post = await this.postRepository.createOne({
    data: {
      folderId,
      content: postData.content,
      availability: postData.availability,
      attachments,
      createdBy: user._id,
      tags: mentions
    }
  })

  if (!post) {
    if (attachments.length) {
      await this.s3.deleteAssets({
        Keys: attachments.map(ele => ({ Key: ele }))
      })
    }
    throw new BadRequestException("Failed to create post")
  }

  if (mentionAccounts.length) {
    await Promise.all(
      mentionAccounts
        .filter(acc => acc._id.toString() !== user._id.toString())
        .map(acc =>
          this.notificationRepository.createOne({
            data: {
              recipient: acc._id,
              actor: user._id,
              type: NotificationType.MENTION_POST,
              post: post._id,
              isRead: false
            }
          })
        )
    )
  }

  if (FCM_Tokens.length) {
    await this.notification.sendNotifications({
      tokens: FCM_Tokens,
      data: {
        title: "Post mention",
        body: JSON.stringify({
          message: `${user.firstName}_${user.lastName} mentioned you in a post`,
          postId: post._id
        })
      }
    })
  }

  return post.toJSON()
}
async postList({page , search, size}:paginateDto,user:HydratedDocument<IUser>):Promise<IPaginate<IPost>>{
  const filter: any = {
  $or: [
    { availability: AvailabilityEnum.PUBLIC },
    { availability: AvailabilityEnum.PRIVATE, createdBy: user._id },
    {
      availability: AvailabilityEnum.FRIENDS_ONLY,
      createdBy: { $in: [user._id, ...(user.friends || [])] }
    },
    { tags: { $in: [user._id] } }
  ]
}

if (search) {
  filter.content = { $regex: search, $options: 'i' }
}

const posts = this.postRepository.paginate({
  filter,
  page,
  size,
  options:{
    populate:[
      {
        path:"comments",
        match:{ commentId: null }, 
        populate:{
          path:"replies" 
        }
      }
    ]
  }
})

return posts
}

async reactPost(
  { postId }: ReactPostParamsDto,
  { react }: ReactPostQueryDto,
  user: HydratedDocument<IUser>
) {

  const post = await this.postRepository.findOne({
    filter: {
      _id: toObjectId(postId),
      $or: getAvailability(user)
    }
  })

  if (!post) {
    throw new NotFoundException("Fail to find matching post")
  }

  const userId = user._id.toString()

  const existingIndex = post.likes?.findIndex(
    (l) => l.createdby.toString() === userId
  )

  let update

  if (Number(react) > 0) {

    if (existingIndex !== -1) {
      update = {
        $set: {
          [`likes.${existingIndex}.react`]: Number(react)
        }
      }
    } else {
      update = {
        $push: {
          likes: {
            react: Number(react),
            createdby: user._id
          }
        }
      }
    }

  } else {
    update = {
      $pull: {
        likes: { createdby: user._id }
      }
    }
  }

  const updatedPost = await this.postRepository.findOneAndUpdate({
    filter: {
      _id: toObjectId(postId),
      $or: getAvailability(user)
    },
    update
  })

  // 🔔 Notification (only once)
  if (post.createdBy.toString() !== userId && Number(react) > 0) {

    await this.notificationRepository.createOne({
      data: {
        recipient: post.createdBy,
        actor: user._id,
        type: NotificationType.REACT_POST,
        post: post._id,
        isRead: false
      }
    })

    const tokens = await this.redis.getFCMs(post.createdBy.toString()) || []

    if (tokens.length) {
      await this.notification.sendNotifications({
        tokens,
        data: {
          title: "New Reaction",
          body: JSON.stringify({
            message: `${user.firstName} reacted to your post`,
            postId: post._id
          })
        }
      })
    }
  }

  return updatedPost
}

async UpdatePost({postId}:UpdatePostParamsDto,postData:UpdatePostBodyDto, user: HydratedDocument<IUser>) {
  
    let mentionAccounts: HydratedDocument<IUser>[] = []
console.log(postData)
    const post= await this.postRepository.findOne(
{filter:{_id:postId,createdBy:user._id}}
    )
    if(!post){
        throw new NotFoundException("Fail to find matching post")
    }
if(!post.content && !postData.content && !postData.files?.length && post.attachments?.length == postData?.removeFiles?.length)

{
    throw new BadRequestException("we cannot leave empty post")
}
const mentions: Types.ObjectId[] = []
    const FCM_Tokens: string[] = []
     if (postData.tags?.length) {

        mentionAccounts = await this.userRepository.find({
            filter: {
                _id: { $in: postData.tags }
            }
        })

        if (mentionAccounts.length !== postData.tags.length) {
            throw new NotFoundException('fail to find some or all mentioned accounts')
        }

        for (const tag of postData.tags) {
            mentions.push(Types.ObjectId.createFromHexString(tag))

            const tokens = await this.redis.getFCMs(tag) || []
            tokens.forEach(token => FCM_Tokens.push(token))
        }
    }
const folderId = post.folderId

    let attachments: string[] = []

    if (postData.files?.length) {
        attachments = await this.s3.uploadAssets({
            files: postData.files as Express.Multer.File[],
            path: `posts/${user._id}/${folderId}`
        })
    }
       const updatepost = await this.postRepository.findOneAndUpdate({
        filter:{
            _id:postId,
            createdBy:user._id
        },
      update: [
    {
      $set: {
        content: postData.content ?? post.content,
        availability: postData.availability ?? post.availability,
        attachments: {
          $setUnion: [
            {
              $setDifference: [
                "$attachments",
                postData.removeFiles || []
              ]
            },
            attachments // اللي اترفعت جديد
          ]
        },
      tags: {
  $setUnion: [
    {
      $setDifference: [
        { $ifNull: ["$tags", []] },
        postData.removeTags || []
      ]
    },
    mentions
  ]
}
      }
    }
  ],
        
    })

    if (!updatepost) {
        if(attachments.length){
            await this.s3.deleteAssets(
                {
                    Keys: attachments.map(ele => ({ Key: ele }))
                }
            )
        }
        throw new BadRequestException("Failed to create post")
    }
    if(postData?.removeFiles?.length ){
 await this.s3.deleteAssets(
                {
                    Keys: postData?.removeFiles.map(ele => ({ Key: ele }))
                }
            )
    }
if(FCM_Tokens.length){
    await this.notification.sendNotifications({
        tokens: FCM_Tokens,data:{
        title:"Post mention",
        body:JSON.stringify({
            message : `${user.username} mentioned you in a post`,
            postId: post._id
        })
    }
    })
}
    return updatepost.toJSON()
}
async DeletePost({ postId }: UpdatePostParamsDto, user: HydratedDocument<IUser>) {

  const id = toObjectId(postId)

  const post = await this.postRepository.findOne({
    filter: {
      _id: id,
      createdBy: user._id
    }
  })

  if (!post) {
    throw new NotFoundException("Post not found")
  }


  await this.s3.deleteFolderByPrefix({
    prefix: `posts/${user._id}/${post.folderId}`
  })

  await this.commentRepository.deleteMany({
    filter: { postId: id, force: true }
  })

  const deletedPost = await this.postRepository.deleteOne({
    filter: { _id: id, force: true }
  })

  if (!deletedPost?.deletedCount) {
    throw new BadRequestException("Failed to delete post")
  }

  return deletedPost
}
}
export default new PostService()