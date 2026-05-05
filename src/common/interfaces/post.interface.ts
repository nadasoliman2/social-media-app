import { Types } from "mongoose";
import { IUser } from "./index.js";
import { AvailabilityEnum } from "../enums/post.enum.js";
export interface IPost {
folderId:string;
content?:string;
attachments?:string[];

likes?:Types.ObjectId[] | IUser[];
tags?:Types.ObjectId[] | IUser[];
availability:AvailabilityEnum;

createdBy?:Types.ObjectId[] |IUser;
updatedBy?:Types.ObjectId[] |IUser;

createdAt?:Date;
updatedAt?:Date;
restoredAt?:Date;
deletedAt?:Date;
}