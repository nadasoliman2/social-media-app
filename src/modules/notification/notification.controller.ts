import {Router} from "express"
import { authentication ,validation} from "../../middleware/index.js"
import {cloudFileUpload,fileFieldValidation} from '../../common/utils/index.js'
import { successResponse } from "../../common/response/success.response.js"
import * as validators from "./post.validation.js"
import NotificationService from "./notification.service.js"
import { paginateDto} from "../../common/validation/general.validation.js"
import {createPostBodyDto,ReactPostParamsDto,ReactPostQueryDto,UpdatePostBodyDto,UpdatePostParamsDto} from './post.dto.js'
import {createPost,updatePost} from './post.validation.js'
import {IUser} from '../../common/interfaces/user.interface.js'
import {HydratedDocument} from "mongoose"
const router = Router()

router.get('/',
    authentication(),

   
    async(req,res,next)=>{
    
const data =await NotificationService.getNotifications( req.query,req.user as  HydratedDocument<IUser>)
        return successResponse({res,status:200,data})
}

)
router.get(
  '/:id/post',
  authentication(),
  async (req, res) => {
    const data = await NotificationService.getNotificationPost(
      req.params.id,
      req.user as HydratedDocument<IUser>
    )
    return successResponse({ res, status: 200, data })
  }
)
router.patch(
  '/:id/read',
  authentication(),
  async (req, res) => {
    const data = await NotificationService.markAsRead(
      req.params.id,
      req.user as HydratedDocument<IUser>
    )

    return successResponse({ res, status: 200, data })
  }
)

export default router