import { Query } from 'mongoose';
import {z} from 'zod';
import { generalValidation } from '../../common/validation/general.validation.js';
export const loginschema = {
    body:z.object(
        {
            email:generalValidation.email,
            password:generalValidation.password
        }
    )
}
export const signupschema  = {
    body:loginschema.body.safeExtend(
        {
            username:generalValidation.username,
 phone:generalValidation.phone.optional(),
            confirmPassword:generalValidation.confirmPassword,
            role:generalValidation.role.optional()
        }
    ).superRefine((data,ctx)=>{
        if(data.password !== data.confirmPassword){
            ctx.addIssue({
                path:["confirmPassword"],
                message:"passwords do not match",
                code:"custom"
            });
        }
        }),
        params:z.object({
            id:z.string().optional()
        })

}
 export const confirmEmail={
 body: z.object({
 email: generalValidation.email,
  
   otp:generalValidation.otp
})
 }
  export const resendconfirmEmail={
 body: z.object({
 email: generalValidation.email})
 }
  export const resetforgotpassord={
 body: z.object({
     password:generalValidation.password,
     confirm_password:generalValidation.confirmPassword,
     email: generalValidation.email,
  
   otp:generalValidation.otp
}).superRefine((data,ctx)=>{
        if(data.password !== data.confirm_password){
            ctx.addIssue({
                path:["confirmPassword"],
                message:"passwords do not match",
                code:"custom"
            });
        }
        })
 }
 