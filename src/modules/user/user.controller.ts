import {Router,Request,Response,NextFunction} from "express"
import userService from './user.service.js'
import {successResponse} from '../../common/response/index.js'
import { authentication,authorization } from "../../middleware/authentication.middleware.js"
import { HydratedDocument } from "mongoose";
import {IUser} from "../../common/interfaces/user.interface.js";
import {endpoint} from './user.authorization.js'
import { TokenTypeEnum ,StorageApproachEnum} from "../../common/enums/index.js";
import { JwtPayload } from "jsonwebtoken";
import {cloudFileUpload,fileFieldValidation} from '../../common/utils/index.js'
import { Express } from "express";


const router = Router()
router.get('/',
    authentication(),
    authorization(endpoint.profile)
,
    async(req:Request,res:Response,next:NextFunction)=>{
const data = await userService.profile(req.user)
return successResponse({res,data:{data}})
})
router.patch('/profile-image',
    authentication(),
    authorization(endpoint.profile),
//     cloudFileUpload({storageApproach: StorageApproachEnum.DISK,
// validation:fileFieldValidation.Image
//     }).single('attachment')

    async(req:Request,res:Response,next:NextFunction)=>{
const data = await userService.profileImage(req.body,req.user)
return successResponse({res,data:{data}})
})
router.patch('/profile-cover-images',
    authentication(),
    authorization(endpoint.profile),
    cloudFileUpload({storageApproach: StorageApproachEnum.DISK,
validation:fileFieldValidation.Image
    }).array('attachment',2)
,
    async(req:Request,res:Response,next:NextFunction)=>{
const data = await userService.profilecoverImages(req.files as Express.Multer.File[],req.user)
return successResponse({res,data:{data}})
})
router.post('/logout',authentication(),async(req,res,next)=>{
    const status = await userService.logout(req.body, req.user,req.decoded as {jti:string,sub:string,iat:number}  )
    return successResponse({res,data:status})

})
router.post("/rotate-token" ,
    authentication(TokenTypeEnum.Refresh),
    async (req,res,next)=>{
    const credentials = await userService.rotateToken(req.user ,req.decoded as {jti:string,sub:string,iat:number} ,`${req.protocol}://${req.host}`)
    return successResponse({res,status:201, data:{...credentials}})
})


export default router