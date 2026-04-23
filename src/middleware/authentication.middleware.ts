import {TokenTypeEnum,RoleEnum} from '../common/enums/index.js'
import {decodeToken} from '../common/services/token.security.js'
import AuthenticationService from '../modules/auth/auth.service.js'
import {BadRequestException,UnauthorizedException} from '../common/exception/index.js'
import { NextFunction, Request, Response } from 'express'
import { HydratedDocument } from 'mongoose'
import {IUser} from '../common/interfaces/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<IUser>;
      decoded: any;
    }
  }
}

export const authentication =(tokenType=TokenTypeEnum.Access)=>{
return async (req:Request,res:Response,next:NextFunction):Promise<void>=>{

    const [schema , credentials] = req.headers?.authorization?.split(" ") || []
    console.log({authorization:req.headers?.authorization, schema,credentials})
   if(!schema || !credentials){
throw new UnauthorizedException("Missing authentication credentials")
   }
    switch(schema){
        case "Basic":
         const [email , password] = Buffer.from(credentials,'base64')?.toString()?.split(":") ||[]
await AuthenticationService.login(
  { 
    email: email as string, 
    password: password as string 
  },
  `${req.protocol}://${req.get("host")}`
)    
        break;
       
        default:
const {user , decoded}= await  decodeToken({token:credentials,tokenType})
          req.user = user as HydratedDocument<IUser>;
          req.decoded = decoded as any
            break;
    }
    next()
}
}
export const authorization = (accessRoles: RoleEnum[] = []) => {
  return async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
  if(!accessRoles.includes(req.user.role as any)){
   throw new BadRequestException("Not authorized account")
}
 next()
}

}