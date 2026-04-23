import { GenderEnum,RoleEnum,ProviderEnum } from "../enums/user.enum.js";
export interface IUser{
    firstName: string;
    lastName:string;
    username?:string;
    email:string;
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
creadtedAt:Date;
updatedAt:Date;
extra:{name:string};
deletedAt?:Date;
restoredAt:Date;
}