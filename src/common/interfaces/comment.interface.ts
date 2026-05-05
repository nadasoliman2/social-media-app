import { Types } from "mongoose";
import { IUser ,IPost } from "./index.js";
import { AvailabilityEnum } from "../enums/post.enum.js";
export interface IComment {

content?:string;
attachments?:string[];

likes?:Types.ObjectId[] | IUser[];
tags?:Types.ObjectId[] | IUser[];

postId:Types.ObjectId | IPost;
commentId:Types.ObjectId | IComment;
createdBy?:Types.ObjectId[] |IUser;
updatedBy?:Types.ObjectId[] |IUser;

createdAt?:Date;
updatedAt?:Date;
restoredAt?:Date;
deletedAt?:Date;
}