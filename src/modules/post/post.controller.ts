import {Router} from "express"
import { authentication ,validation} from "../../middleware/index.js"
import {cloudFileUpload,fileFieldValidation} from '../../common/utils/index.js'
import { successResponse } from "../../common/response/success.response.js"
import * as validators from "./post.validation.js"
import PostService from "./post.service.js"
import { paginateDto} from "../../common/validation/general.validation.js"
import {createPostBodyDto,ReactPostParamsDto,ReactPostQueryDto,UpdatePostBodyDto,UpdatePostParamsDto} from './post.dto.js'
import {createPost,updatePost} from './post.validation.js'
import {IUser} from '../../common/interfaces/user.interface.js'
import {HydratedDocument} from "mongoose"
const router = Router()
router.post('/',
    authentication(),
     cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

    validation(validators.createPost),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await PostService.createPost(req.body,req.user as HydratedDocument<IUser>)
        return successResponse({res,status:201,message:"Post created successfully",data})
}

)
router.get('/',
    authentication(),

   
    async(req,res,next)=>{
    
const data =await PostService.postList(req.query as paginateDto, req.user)
        return successResponse({res,status:200,message:"Post created successfully",data})
}

)
router.patch('/:postId/react',
    authentication(),
    validation(validators.reactPost),
   
    async(req,res,next)=>{
        
const data =await PostService.reactPost(req.params as ReactPostParamsDto,req.query as unknown as ReactPostQueryDto ,req.user)
        return successResponse({res,status:200,message:"Post created successfully",data})
})
router.patch('/:postId',
    authentication(),
     cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

    validation(validators.updatePost),
   
    async(req,res,next)=>{
        
const data =await PostService.UpdatePost(req.params as  UpdatePostParamsDto,req.body as  UpdatePostBodyDto ,req.user)
        return successResponse({res,status:200,message:"Post created successfully",data})
} 

)
router.delete('/:postId',
    authentication(),

    validation(validators.deletePost),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await PostService.DeletePost(req.params as DeletepostParamsDto,req.user)
        return successResponse({res,status:201,message:"post delete successfully"})
}
)
export default router