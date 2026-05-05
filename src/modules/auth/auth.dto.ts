import {z} from 'zod';
import { loginschema, signupschema ,confirmEmail,resendconfirmEmail,resetforgotpassord} from './auth.validation.js';
export type ILoginDto = z.infer<typeof loginschema.body>
export type ISignupDto = z.infer<typeof signupschema.body>
export type IConfirmEmailDto = z.infer<typeof confirmEmail.body>
export type IResendConfirmEmailDto = z.infer<typeof resendconfirmEmail.body>
  export type IResetForgotPasswordDto = z.infer<typeof resetforgotpassord.body>