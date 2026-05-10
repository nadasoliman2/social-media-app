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

class NotificationService{
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

async getNotifications(
  { page = 1, size = 20 },
  user: HydratedDocument<IUser>
) {

  const notifications = await this.notificationRepository.paginate({
    filter: {
      recipient: user._id
    },
    page,
    size,
    options: {
      sort: { createdAt: -1 },
      populate: [
      
        { path: "post" },
    
      ]
    }
  })

  const unreadCount = await this.notificationRepository.countDocuments({
    filter: {
      recipient: user._id,
      isRead: false
    }
  })

  return {
    ...notifications,
    unreadCount
  }
}
async getNotificationPost(notificationId: string, user: HydratedDocument<IUser>) {
  const notification = await this.notificationRepository.findOne({
    filter: {
      _id: toObjectId(notificationId),
      recipient: user._id
    },
    options: {
      populate: [{ path: "post" }]
    }
  })

  if (!notification) {
    throw new NotFoundException("Notification not found")
  }

  return notification.post
}
async markAsRead(notificationId: string, user: HydratedDocument<IUser>) {

  const notification = await this.notificationRepository.findOneAndUpdate({
    filter: {
      _id: toObjectId(notificationId),
      recipient: user._id
    },
    update: {
      isRead: true
    },
    options: {
      new: true
    }
  })

  if (!notification) {
    throw new NotFoundException("Notification not found")
  }

  return notification
}
}
export default new NotificationService()