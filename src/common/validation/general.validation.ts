import { Query } from 'mongoose';
import {z} from 'zod';
export const generalValidation = {

    otp: z.string().regex(/^\d{6}$/),

 email:z.email({error:"invalid email format"}),
phone: z
  .string()
  .regex(/^01[0125][0-9]{8}$/, "invalid phone number format"),
   password:z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {error:"password must be at least 8 characters long and contain at least one letter and one number"}),

 username:z.string({error:"username is mandatory"}).min(2,{error:"username must be at least 2 characters long"}).max(25,{error:"username must be at most 25 characters long"}),
    confirmPassword:z.string(),
    role:z.enum(["user","admin"],{error:"role must be either User or Admin"})
        }
    