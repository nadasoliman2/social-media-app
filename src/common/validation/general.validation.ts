import { Query } from 'mongoose';
import {z} from 'zod';
import {Types} from "mongoose"
export const generalValidation = {
id:z.string().refine(value=>{return  Types.ObjectId.isValid(value)},"Invalid ObjectId")
    otp: z.string().regex(/^\d{6}$/),

 email:z.email({error:"invalid email format"}),
phone: z
  .string()
  .regex(/^01[0125][0-9]{8}$/, "invalid phone number format"),
   password:z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {error:"password must be at least 8 characters long and contain at least one letter and one number"}),

 username:z.string({error:"username is mandatory"}).min(2,{error:"username must be at least 2 characters long"}).max(25,{error:"username must be at most 25 characters long"}),
    confirmPassword:z.string(),
    role:z.enum(["user","admin"],{error:"role must be either User or Admin"}),
    file:function(mimetype:string[]){
      return z.strictObject({
        fieldname:z.string(),
        originalname:z.string(),
        encoding:z.string(),
        mimetype:z.enum(mimetype),
        size:z.number(),
        buffer:z.any().optional(),
        path:z.string().optional()
      }).superRefine((data,ctx)=>{
        if(!data?.path && !data.buffer){
ctx.addIssue({code:"custom",
  message:"buffer is required",path:['buffer']
})
        }
      })
    }
        }
    export const paginationValidationSchema ={
      query:z.strictObject({
page:z.coerce.number().optional(),
size:z.coerce.number().optional(),
search:z.coerce.number().optional()
      })



    }
    export type paginateDto = z.infer<typeof paginationValidationSchema.query>