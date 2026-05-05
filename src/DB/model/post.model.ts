import {  AvailabilityEnum ,React} from '../../common/enums/index.js';
import { IPost } from '../../common/interfaces/index.js';
import mongoose, { HydratedDocument, Types } from "mongoose";

const { Schema, model, models } = mongoose;
const PostSchema = new Schema<IPost>({

folderId:{type:String,required:true},
content:{type:String,required:function(this){
    return !this.attachments.length 
}},
attachments:{type:[String]},
availability:{type:Number,enum:AvailabilityEnum,default:AvailabilityEnum.PUBLIC},
likes:[{react:{type:Number ,enum:React },createdby:{type:Types.ObjectId,ref:'User'}}],
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
    ,collection:"SOCAIL_APP_POSTS"
}) 

PostSchema.virtual("comments",{
    localField:"_id",
    foreignField:"postId",
    ref:"Comment"
})
PostSchema.pre(['findOne','find', 'countDocuments'],function(){
    console.log(this.getFilter())
    const query = this.getQuery()
    if(query.paranoid === false){
        this.setQuery({...query})
    }
    else{

        this.setQuery({...query,deletedAt:null})
    }
        
})
PostSchema.pre(['updateOne','findOneAndUpdate'],function(){
const update = this.getUpdate() as HydratedDocument<IPost>
console.log(update)

if(update.restoredAt){
    this.setUpdate({...update,$unset:{deletedAt:1}})
        this.setQuery({...this.getQuery(),deletedAt:{$exists:true}})

}
if(update.deletedAt){
    this.setUpdate({...update,$unset:{restoredAt:1}})
}
    const query = this.getQuery()
    if(query.paranoid === false){
        this.setQuery({...query})
    }
    else{

        this.setQuery({...query,deletedAt:{$exists: false}})
    }
        console.log(this.getQuery())
})
PostSchema.pre(['deleteOne','findOneAndDelete'],function(){

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
export const PostModel =
  (models.Post as mongoose.Model<IPost>) ||
  model<IPost>('Post', PostSchema)
  PostModel.syncIndexes()