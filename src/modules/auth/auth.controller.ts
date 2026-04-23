import { Router, Request, NextFunction, Response, response } from 'express';
import authService from './auth.service.js';
import { successResponse } from '../../common/response/success.response.js';
import { ILoginResponse, ISignupResponse } from './auth.entity.js';
import { BadRequestException } from '../../common/exception/index.js';
import * as validators from './auth.validation.js'
import { validation } from '../../middleware/index.js';
const router: Router = Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        const result = await authService.login(req.body,`${req.protocol}://${req.host}`);
        return successResponse<ILoginResponse | any >({ res: res, status: 200, data: {token:result} });
  
});

router.post('/signup',
     validation(validators.signupschema),
     async (req: Request, res: Response, next: NextFunction): Promise<any> => {


        const result = await authService.signup(req.body);
        return successResponse<ISignupResponse | any >({ res: res, status: 201, data: result, message: "check your email" });
  
});
router.patch("/resend-confrim-email",
    validation(validators.resendconfirmEmail),
async (req, res, next) => {

     const account = await  authService.resendConfirmEmail(req.body)

    return successResponse<any>({res})


})
router.post("/request-forgot-password",
    validation(validators.resendconfirmEmail),
async (req, res, next) => {

     const account = await  authService.requestForgotPasswordOtp(req.body)

    return successResponse({res})


})
router.patch("/verify-forgot-password",validation(validators.confirmEmail),
async (req, res, next) => {

     const account = await authService.verifyForgotPassword(req.body)

    return successResponse<any>({res})


})
router.patch("/reset-forgot-Password",validation(validators.resetforgotpassord),
async (req, res, next) => {

     const account = await authService.resetforgotPassword(req.body)

    return successResponse({res})


})
router.patch("/confrim-email",validation(validators.confirmEmail),
async (req, res, next) => {

     const account = await  authService.confirmEmail(req.body)

    return successResponse({res})


})
router.post("/signup/gmail", async (req, res, next) => {
    const {status, Credential} = await authService.signupwithgmail(req.body.idToken,`${req.protocol}://${req.host}`)
    
    return successResponse({res,status: status,data:{...Credential}})
})

export default router;