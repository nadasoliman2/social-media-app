import {  AvailabilityEnum } from '../../common/enums/index.js';
import { IComment } from '../../common/interfaces/index.js';
import mongoose, { HydratedDocument, Types } from "mongoose";

const { Schema, model, models } = mongoose;
const CommentSchema = new Schema<IComment>({

content:{type:String,required:function(this){
    return !this.attachments.length 
}},
attachments:{type:[String]},
postId:{type:Types.ObjectId,ref:"Post",required:true},
commentId:{type:Types.ObjectId,ref:"Comment"},
likes:[{react:{type:Number},createdby:{type:Types.ObjectId,ref:'User'}}],
tags:[{type:Types.ObjectId,ref:'User'}],
createdBy:{type:Types.ObjectId,ref:'User',required:true},
updatedBy:{type:Types.ObjectId,ref:'User'},
deletedAt:{type:Date},
restoredAt:{type:Date}
},{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true
    ,collection:"SOCAIL_APP_CommentS"
}) 

CommentSchema.virtual("replies",{
    localField:"_id",
    foreignField:"commentId",
    ref:"Comment"
})
CommentSchema.pre(['findOne','find', 'countDocuments'],function(){
    console.log(this.getFilter())
    const query = this.getQuery()
    if(query.paranoid === false){
        this.setQuery({...query})
    }
    else{

        this.setQuery({...query,deletedAt:null})
    }
        
})
CommentSchema.pre(['deleteOne','findOneAndDelete','deleteMany'], function () {
const query = this.getQuery()
    console.log(query.force)
    if(query.force === true){
        this.setQuery({...query})
    }
    else{

        this.setQuery({...query,deletedAt:{$exists: true}})
        
    }                                     
        console.log(this.getQuery())
})

export const CommentModel =
  (models.Comment as mongoose.Model<IComment>) ||
  model<IComment>('Comment', CommentSchema)
  CommentModel.syncIndexes()