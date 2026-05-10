import {Router} from "express"
import { authentication ,validation} from "../../middleware/index.js"
import {cloudFileUpload,fileFieldValidation} from '../../common/utils/index.js'
import { successResponse } from "../../common/response/success.response.js"
import * as validators from "./comment.validation.js"
// import PostService from "./post.service.js"
import CommentService from "./comment.service.js"

import { paginateDto} from "../../common/validation/general.validation.js"
import {createCommentBodyDto,createCommentParamsDto,UpdateCommentParamsDto ,DeleteCommentParamsDto ,ReplyCommentParamsDto,ReactPostParamsDto,ReactPostQueryDto} from './comment.dto.js'
const router = Router()
router.patch('/:commentId/post/:postId',
    authentication(),
     cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

    validation(validators.updateComment),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await CommentService.UpdateComment(req.params as UpdateCommentParamsDto,req.body,req.user)
        return successResponse({res,status:201,message:"comment update successfully",data})
}
)
router.delete('/:commentId',
    authentication(),

    validation(validators.deleteComment),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await CommentService.DeleteComment(req.params as DeleteCommentParamsDto,req.user)
        return successResponse({res,status:201,message:"comment delete successfully"})
}
)
router.post('/:postId',
    authentication(),
     cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

    validation(validators.createComment),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await CommentService.createComment(req.params as createCommentParamsDto  ,req.body,req.user)
        return successResponse({res,status:201,message:" comment created successfully",data})
}

)
// router.get('/',
//     authentication(),

   
//     async(req,res,next)=>{
    
// const data =await PostService.postList(req.query as paginateDto, req.user)
//         return successResponse({res,status:200,message:"Post created successfully",data})
// }

// )
// router.patch('/:postId/react',
//     authentication(),
//     validation(validators.reactPost),
   
//     async(req,res,next)=>{
        
// const data =await PostService.reactPost(req.params as ReactPostParamsDto,req.query as unknown as ReactPostQueryDto ,req.user)
//         return successResponse({res,status:200,message:"Post created successfully",data})
// })
// router.patch('/:postId',
//     authentication(),
//      cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

//     validation(validators.updatePost),
   
//     async(req,res,next)=>{
        
// const data =await PostService.UpdatePost(req.params as  UpdatePostParamsDto,req.body as  UpdatePostBodyDto ,req.user)
//         return successResponse({res,status:200,message:"Post created successfully",data})
// } 
router.post('/:commentId/post/:postId',
    authentication(),
     cloudFileUpload({validation:fileFieldValidation.Image}).array("attachments",2),

    validation(validators.replyComment),
   
    async(req,res,next)=>{
        console.log(req.user)
        console.log(req.body)
const data =await CommentService.replyOnComment(req.params  as ReplyCommentParamsDto ,req.body,req.user )
        return successResponse({res,status:201,message:"reply created successfully",data})
}
)
router.patch('/:commentId/react',
    authentication(),
    validation(validators.reactPost),
   
    async(req,res,next)=>{
        
const data =await CommentService.reactComment(req.params as ReactPostParamsDto,req.query as unknown as ReactPostQueryDto ,req.user)
        return successResponse({res,status:200,message:"react created successfully",data})
})
export default router