import { GenderEnum, ProviderEnum, RoleEnum } from '../../common/enums/index.js';
import { IUser } from '../../common/interfaces/index.js';
import mongoose, { HydratedDocument } from "mongoose";
import {generateHash ,encrypt}from '../../common/utils/security/index.js'

const { Schema, model, models } = mongoose;
const userSchema = new Schema<IUser>({
 firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    
    email: { type: String, required: true, unique: true },
    phone: { type: String  },
    password: { type: String ,required: function(this){
        return this.provider === ProviderEnum.SYSTEM
    } }
,
    profilepicture:{ type: String },
    profilecoverpicture:{ type: [String] },
gender:{ type: Number, enum: GenderEnum ,default:GenderEnum.MALE },
role:{ type: Number, enum: RoleEnum,default: RoleEnum.USER},
provider:{ type: Number, enum: ProviderEnum,default: ProviderEnum.SYSTEM},

changeCredentialsTime:{ type:Date },
DOB:{ type:Date },
confirmEmail:{ type:Date },
extra:{name:String},
deletedAt:{type:Date},
restoredAt:{type: Date}

},{
    timestamps:true,
    toObject:{virtuals:true},
    toJSON:{virtuals:true},
    strict:true,
    strictQuery:true,
    optimisticConcurrency:true
    ,collection:"SOCAIL_APP_USERS"
}) 
userSchema.virtual('username').set(function(value:string){
    const [firstName, lastName] = value.split(' ')  || []
    this.firstName = firstName as string;
    this.lastName = lastName as string;
}).get(function(){
    return `${this.firstName} ${this.lastName}`
});
userSchema.pre('save',async function(){


    if(this.isModified('password')&&this.password){
        this.password = await generateHash({plaintext:this.password})
    }
    if(this.phone && this.isModified('phone')){
        this.phone = await encrypt(this.phone)
    }
})
userSchema.pre(['findOne','find'],function(){
    console.log(this.getFilter())
    const query = this.getQuery()
    if(query.paranoid === false){
        this.setQuery({...query})
    }
    else{

        this.setQuery({...query,deletedAt:null})
    }
        
})
userSchema.pre(['updateOne','findOneAndUpdate'],function(){
const update = this.getUpdate() as HydratedDocument<IUser>
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
userSchema.pre(['deleteOne','findOneAndDelete'],function(){

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
export const UserModel =
  (models.User as mongoose.Model<IUser>) ||
  model<IUser>('User', userSchema)