import { GenderEnum,RoleEnum,ProviderEnum } from "../enums/user.enum.js";
import {Types} from "mongoose"
export interface IUser{
    firstName: string;
    lastName:string;
    username?:string;
    email:string;
    friends?:Types.ObjectId[] |string[];
    phone?:string;
    password?:string;
    profilepicture?:string;
    profilecoverpicture?:string[];
gender:GenderEnum;
role:RoleEnum;
provider:ProviderEnum

changeCredentialsTime?:Date;
DOB:Date;
confirmEmail?:Date;
createdAt:Date;
updatedAt:Date;
extra:{name:string};
deletedAt?:Date;
restoredAt:Date;
}