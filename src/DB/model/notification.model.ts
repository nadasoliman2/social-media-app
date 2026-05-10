import mongoose, { Types } from "mongoose";
const { Schema, model, models } = mongoose;
import {NotificationType} from '../../common/enums/index.js'


const NotificationSchema = new Schema({
  recipient: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  actor: {
    type: Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: Number,
enum: NotificationType  ,
 required: true
  },
comment: {
  type: Types.ObjectId,
  ref: "Comment"
},
  post: {
    type: Types.ObjectId,
    ref: "Post"
  },

  reactType: {
    type: Number
  },

  isRead: {
    type: Boolean,
    default: false,
    index: true
  }

}, {
  timestamps: true,
  collection: "SOCIAL_APP_Notifications"
});

export const NotificationModel =
  models.Notification || model("Notification", NotificationSchema);