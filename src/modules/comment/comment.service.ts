import {IPost} from "../../common/interfaces/post.interface.js";
import {IUser} from "../../common/interfaces/user.interface.js";
import { HydratedDocument, Types } from 'mongoose';
import {DeleteCommentParamsDto,createCommentBodyDto,createCommentParamsDto,ReplyCommentParamsDto,ReplyCommentBodyDto, UpdateCommentBodyDto,UpdateCommentParamsDto} from './comment.dto.js'
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
import {ReactPostQueryDto} from "../post/post.dto.js"
class CommentService{
      private readonly userRepository: UserRepository;
  private readonly s3: typeof s3service;
    private readonly redis: typeof redis;
    private readonly notification : typeof notificationService
    private readonly postRepository:PostRepository;
        private readonly commentRepository:CommentRepository;
private readonly notificationRepository: NotificationRepository;

    constructor(){
        this.notificationRepository= new NotificationRepository();

                    this.userRepository = new UserRepository();
this.commentRepository = new CommentRepository()
            this.userRepository = new UserRepository();
        this.s3 = s3service;
        this.postRepository = new PostRepository();
this.redis = redis;
this.notification= notificationService
    }

async createComment(
  { postId }: createCommentParamsDto,
  postData: createCommentBodyDto,
  user: HydratedDocument<IUser>
) {

  const post = await this.postRepository.findOne({
    filter: {
      _id: postId,
      $or: getAvailability(user)
    }
  })

  if (!post) {
    throw new NotFoundException('fail to match this post')
  }

  const mentions: Types.ObjectId[] = []
  let mentionAccounts: HydratedDocument<IUser>[] = []

  if (postData.tags?.length) {

    mentionAccounts = await this.userRepository.find({
      filter: { _id: { $in: postData.tags } }
    })

    if (mentionAccounts.length !== postData.tags.length) {
      throw new NotFoundException('fail to find some or all mentioned accounts')
    }

    mentions.push(...postData.tags.map(id => Types.ObjectId.createFromHexString(id)))
  }

  const folderId = post.folderId
  let attachments: string[] = []

  if (postData.files?.length) {
    attachments = await this.s3.uploadAssets({
      files: postData.files as Express.Multer.File[],
      path: `posts/${user._id}/${folderId}/comment`
    })
  }

  const comment = await this.commentRepository.createOne({
    data: {
      content: postData.content,
      postId: post._id,
      attachments,
      createdBy: user._id,
      tags: mentions
    }
  })

  if (!comment) {
    throw new BadRequestException("Failed to create comment")
  }

  // 🔔 Notify Post Owner
  if (post.createdBy.toString() !== user._id.toString()) {

    await this.notificationRepository.createOne({
      data: {
        recipient: post.createdBy,
        actor: user._id,
        type: "COMMENT_POST",
        post: post._id,
        comment: comment._id,
        isRead: false
      }
    })

    const tokens = await this.redis.getFCMs(post.createdBy.toString()) || []

    if (tokens.length) {
      await this.notification.sendNotifications({
        tokens,
        data: {
          title: "New Comment",
          body: JSON.stringify({
            message: `${user.firstName} commented on your post`,
            postId: post._id,
            commentId: comment._id
          })
        }
      })
    }
  }

  // 🔔 Mention Notifications
  await Promise.all(
    mentionAccounts
      .filter(acc => acc._id.toString() !== user._id.toString())
      .map(acc =>
        this.notificationRepository.createOne({
          data: {
            recipient: acc._id,
            actor: user._id,
            type: "MENTION_COMMENT",
            post: post._id,
            comment: comment._id,
            isRead: false
          }
        })
      )
  )

  return comment.toJSON()
}
async replyOnComment(
  { postId, commentId }: ReplyCommentParamsDto,
  postData: ReplyCommentBodyDto,
  user: HydratedDocument<IUser>
) {

  const comment = await this.commentRepository.findOne({
    filter: { _id: commentId, postId },
  })

  if (!comment) {
    throw new NotFoundException('fail to match this comment')
  }

  const post = await this.postRepository.findOne({
    filter: { _id: postId, $or: getAvailability(user) }
  })

  if (!post) {
    throw new NotFoundException('fail to match this post')
  }

  const mentions: Types.ObjectId[] = []
  let mentionAccounts: HydratedDocument<IUser>[] = []

  if (postData.tags?.length) {

    mentionAccounts = await this.userRepository.find({
      filter: { _id: { $in: postData.tags } }
    })

    mentions.push(...postData.tags.map(id => Types.ObjectId.createFromHexString(id)))
  }

  const folderId = post.folderId
  let attachments: string[] = []

  if (postData.files?.length) {
    attachments = await this.s3.uploadAssets({
      files: postData.files as Express.Multer.File[],
      path: `posts/${user._id}/${folderId}/comment/${commentId}`
    })
  }

  const reply = await this.commentRepository.createOne({
    data: {
      content: postData.content,
      postId,
      commentId,
      attachments,
      createdBy: user._id,
      tags: mentions
    }
  })

  if (!reply) {
    throw new BadRequestException("Failed to create reply")
  }

  // 🔔 Notify Comment Owner
  if (comment?.createdBy.toString() !== user._id.toString()) {

    await this.notificationRepository.createOne({
      data: {
        recipient: comment.createdBy,
        actor: user._id,
        type: NotificationType.REPLY_COMMENT,
        post: postId,
        comment: commentId,
        reply: reply._id,
        isRead: false
      }
    })

    const tokens = await this.redis.getFCMs(comment?.createdBy.toString()) || []

    if (tokens.length) {
      await this.notification.sendNotifications({
        tokens,
        data: {
          title: "New Reply",
          body: JSON.stringify({
            message: `${user.firstName} replied to your comment`,
            postId,
            commentId,
            replyId: reply._id
          })
        }
      })
    }
  }

  // 🔔 Mention Notifications
  await Promise.all(
    mentionAccounts
      .filter(acc => acc._id.toString() !== user._id.toString())
      .map(acc =>
        this.notificationRepository.createOne({
          data: {
            recipient: acc._id,
            actor: user._id,
            type: "MENTION_COMMENT",
            post: postId,
            comment: commentId,
            reply: reply._id,
            isRead: false
          }
        })
      )
  )

  return reply.toJSON()
}
async UpdateComment({commentId,postId}:UpdateCommentParamsDto,postData:UpdateCommentBodyDto, user: HydratedDocument<IUser>) {
  
    let mentionAccounts: HydratedDocument<IUser>[] = []
console.log(postData)
   const comment = await this.commentRepository.findOne(
    {filter:{
        _id:commentId,
        postId:postId,
    },
    options:{
        populate:[
            {
                path:"postId",
                match:{
          $or:getAvailability(user)          
                }
            }
        ]
    }
}
)
if(!comment.content && !postData.content && !postData.files?.length && comment.attachments?.length == postData?.removeFiles?.length)

{
    throw new BadRequestException("we cannot leave empty comment")
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
    let attachments: string[] = []
const post = comment.postId as IPost
const folderId = post.folderId
console.log({comment})
console.log({post})
console.log(folderId)
    if (postData.files?.length) {
        attachments = await this.s3.uploadAssets({
            files: postData.files as Express.Multer.File[],
            path: `posts/${user._id}/${folderId}/comment/${commentId}`
        })
    }
       const updateComment = await this.commentRepository.findOneAndUpdate({
        filter:{
_id: commentId,
            createdBy:user._id
        },
      update: [
    {
      $set: {
        content: postData.content ?? comment.content,
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

    if (!updateComment) {
        if(attachments.length){
            await this.s3.deleteAssets(
                {
                    Keys: attachments.map(ele => ({ Key: ele }))
                }
            )
        }
        throw new BadRequestException("Failed to update comment")
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
            postId: postId,
            commentId:commentId
        })
    }
    })
}
    return updateComment.toJSON()
}
async DeleteComment({commentId}:DeleteCommentParamsDto, user: HydratedDocument<IUser>) {
    const id = toObjectId(commentId)
 const comment = await this.commentRepository.findOne({
  filter: {
    _id:id,
    createdBy:user._id
  },

})
console.log({comment})
// replies
const replies = await this.commentRepository.find({
  filter: {
    commentId: commentId
  }
})

// collect files
const commentFiles = comment?.attachments || []
const replyFiles = replies.flatMap(r => r.attachments || [])

const allFiles = [...commentFiles, ...replyFiles]

// delete from S3
if(allFiles.length){
  await this.s3.deleteAssets({
    Keys: allFiles.map(file => ({ Key: file }))
  })
}

// delete from DB
const deleteComment=  await this.commentRepository.deleteMany({
  filter: {
    $or: [
      { _id: commentId },
      { commentId: commentId }
    ],force:true
  }
})
if(!deleteComment?.deletedCount >0 ){
    
      
        throw new BadRequestException("Failed to delete comment")
}
console.log({deleteComment})
   

    return deleteComment
}
async reactComment(
  { commentId }: DeleteCommentParamsDto,
  { react }: ReactPostQueryDto,
  user: HydratedDocument<IUser>
) {

  const comment = await this.commentRepository.findOne({
    filter: {
      _id: commentId,
      $or: getAvailability(user)
    }
  })

  if (!comment) {
    throw new NotFoundException("Fail to find matching comment")
  }

  const userId = user._id.toString()

  const existingIndex = comment.likes?.findIndex(
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

  const updatedComment = await this.commentRepository.findOneAndUpdate({
    filter: {
      _id: commentId,
      $or: getAvailability(user)
    },
    update
  })

  // 🔔 Notification
  if (comment.createdBy.toString() !== userId && Number(react) > 0) {

    await this.notificationRepository.createOne({
      data: {
        recipient: comment.createdBy,
        actor: user._id,
        type: NotificationType.REACT_COMMENT,
        comment: comment._id,
        isRead: false
      }
    })

    const tokens = await this.redis.getFCMs(comment.createdBy.toString()) || []

    if (tokens.length) {
      await this.notification.sendNotifications({
        tokens,
        data: {
          title: "New Reaction",
          body: JSON.stringify({
            message: `${user.firstName} reacted to your comment`,
            commentId: comment._id
          })
        }
      })
    }
  }

  return updatedComment
}
}
export default new CommentService()