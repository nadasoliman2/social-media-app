import { HydratedDocument, Model } from "mongoose";
import { ConfilctException,NotFoundException, ApplicationException, ForbiddenException, BadRequestException } from "../../common/exception/index.js";
import { ILoginDto, ISignupDto ,IConfirmEmailDto,IResendConfirmEmailDto,IResetForgotPasswordDto } from "./auth.dto.js";
import { IUser } from "../../common/interfaces/index.js";
import { UserRepository, DatabaseRepository } from "../../DB/repository/index.js";
import { generateHash, encrypt,compareHash } from "../../common/utils/security/index.js";
import { SecurityServices } from "../../common/services/security.service.js";
import { sendEmail, emailTemplete, createNumberOtp } from "../../common/utils/index.js";
import { RoleEnum,ProviderEnum,EmailEnum } from "../../common/enums/index.js";
import redis from "../../common/services/redis.service.js";
import { emailEvent } from '../../common/utils/email/event.email.js';
import {createloginCredentials} from "../../common/services/token.security.js";
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { CLIENT_IDS } from "../../config/config.service.js";
interface ISendEmailOtpDto {
  email: string
  subject: string
  title: string
}


class AuthenticationService {
  private readonly userRepository: UserRepository;
  private readonly SecurityServices: SecurityServices;
private readonly redis: typeof redis;
  constructor() {
    this.userRepository = new UserRepository();
    this.SecurityServices = new SecurityServices();
this.redis = redis;
  }
 private  SendEmailOtp = async ({
  email,
  subject,
  title
}: ISendEmailOtpDto): Promise<void> => {

  const otpKeyValue = this.redis.otpKey({ email, subject });
  const trialKeyValue = this.redis.maxAttemptOtpKey({ email, subject });
  const blockKeyValue = this.redis.blockOtpKey({ email, subject });

  const isBlocked: number | null = await  redis.ttl(blockKeyValue);
 if (isBlocked !== null && isBlocked > 0) {
  throw new BadRequestException(`You are blocked. Try again after ${isBlocked}s`);
}
  const remainingOtpTTL: number | null= await redis.ttl(otpKeyValue);
  if (remainingOtpTTL !== null && remainingOtpTTL > 0) {
    throw new BadRequestException(`Sorry, current OTP still active. Try again after ${remainingOtpTTL}s`);
  }

  const maxTrial: number = Number(await redis.get(trialKeyValue)) || 0;
  if (maxTrial >= 3) {
    await redis.set({ key: blockKeyValue, value: 1, ttl: 7 * 60 });
    throw new BadRequestException(`You are blocked for 7 minutes`);
  }

  const code: number= await createNumberOtp();

  await redis.set({
    key: otpKeyValue,
    value: await generateHash({ plaintext: `${code}` }),
    ttl: 120
  });

  emailEvent.emit("sendEmail", async () => {
    await sendEmail({
      to: email,
      subject,
      html: emailTemplete({ otp: code, title })
    });

    await redis.incr(trialKeyValue);
  });
};

  public login = async (data: ILoginDto ,issuer: string): Promise<{ access_token: string; refresh_token: string }> => {
    const { email, password } = data;
    const Existcheckuser: HydratedDocument<IUser> | null = await this.userRepository.findOne({ 
    filter:{email , provider:ProviderEnum.SYSTEM , confirmEmail:{$exists:true}},},)
if(!Existcheckuser){ 
 throw new NotFoundException(" Invalid login credentials")
}
const match = await compareHash({ plaintext:password ,cypherText:Existcheckuser.password as string})
if(!match){
    throw new  NotFoundException(" Invalid login credentials")}
return createloginCredentials(Existcheckuser,issuer as string)
  };

  public signup = async ({ email, password, username, phone, role }: ISignupDto): Promise<IUser> => {
    const checkUser = await this.userRepository.findOne({
      filter: { email },
      options: { lean: true }
    });

    if (checkUser) {
      throw new ConfilctException("User with this email already exists");
    }

    const user = await this.userRepository.createOne({
      data: {
        email,
        password,
        username,
        phone:phone as string,
        role: role === "admin" ? RoleEnum.ADMIN : RoleEnum.USER
      }
    });

    if (!user) {
      throw new BadRequestException("Failed to create user");
    }

    const code = await createNumberOtp()
await redis.set({key:redis.otpKey({email})
   , value:await generateHash({plaintext:`${code}`}),
  ttl:120})
await  sendEmail({to:email,subject:"Confirm-Email",
  html:emailTemplete({otp:code,title:"Confirm-Email"}),

})
await this.redis.set({ key:this.redis.maxAttemptOtpKey({email}),
value:1,
ttl:360
})

    return user.toJSON();
  };
  public confirmEmail = async ({  email,otp }: IConfirmEmailDto) => {
  

  const account: HydratedDocument<IUser> | null = await this.userRepository.findOne({
    
    filter: { email ,confirmEmail:{$exists:false},provider:ProviderEnum.SYSTEM }
  });

  if (!account) throw new NotFoundException( "fail to find matching account" );
const hashOtp = await this.redis.get(this.redis.otpKey({email}))
if(!hashOtp){
  throw new NotFoundException("Expired otp")
}
if(!await compareHash({plaintext:otp, cypherText: hashOtp as string})){
throw new ConfilctException( "Invalid otp")
}
account.confirmEmail = new Date();
await account.save();
await this.redis.deleteKey([this.redis.otpKey({ email })]);  
return ;
};
public resendConfirmEmail = async ({email}: IResendConfirmEmailDto) => {


  const account: HydratedDocument<IUser> | null = await this.userRepository.findOne({
    
    filter: { email ,confirmEmail:{$exists:false},provider:ProviderEnum.SYSTEM }
  });


  if (!account) throw new NotFoundException( "fail to find matching account" );
  await this.SendEmailOtp({email, subject: EmailEnum.ConfirmEmail as string, title: "Verify Email"})
  return ;
};
public requestForgotPasswordOtp = async ({email}: IResendConfirmEmailDto) => {
  

  const account = await this.userRepository.findOne({
    filter: { email ,confirmEmail:{$exists:true},provider:ProviderEnum.SYSTEM }
  });

  if (!account) throw new NotFoundException("fail to find matching account");
  await this.SendEmailOtp({email, subject:EmailEnum.ForgotPassword as string, title: "Reset Code"})
  return ;
};
public resetforgotPassword = async ({ email, otp, password }: IResetForgotPasswordDto) => {

  await this.verifyForgotPassword({ email, otp });

  const user = await this.userRepository.findOne({
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM
    }
  });

  if (!user) {
    throw new NotFoundException("account not exist");
  }

  user.password = await generateHash({ plaintext: password });
  user.changeCredentialsTime = new Date();

  await user.save();

  await this.redis.deleteKey([this.redis.otpKey({ email, subject: EmailEnum.ForgotPassword })]);
};
public verifyForgotPassword = async ({  email,otp }:  IConfirmEmailDto) => {
const hashOtp = await this.redis.get(this.redis.otpKey({email , subject:EmailEnum.ForgotPassword}))
if(!hashOtp){
  throw new NotFoundException("Expired otp")
}
if(!await compareHash({plaintext:otp, cypherText: hashOtp as string})){
throw new ConfilctException("Invalid otp")
}
await this.redis.deleteKey([this.redis.otpKey({email ,subject:EmailEnum.ForgotPassword})])
  return ;
}
private  async verifyGoogleAccount  (idToken:string): Promise<TokenPayload>{
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_IDS,  // Specify the WEB_CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  if( !payload?.email_verified){
    throw new  BadRequestException("unverified email")
  }
return payload
}
   async   loginwithgmail (idToken: string, issuer: string) {
const payload = await this.verifyGoogleAccount(idToken);
console.log(payload)
if(!payload?.email){
  throw new BadRequestException("Email not found in token")
}
const user= await this.userRepository.findOne({
  filter:{email:payload.email as string,
    provider:ProviderEnum.GOOGLE}})
if(!user){
throw new NotFoundException("no registered account ")
}
return await  createloginCredentials(user,issuer)
  }
async  signupwithgmail (idToken: string, issuer: string)  { 
const payload = await this.verifyGoogleAccount(idToken);
console.log(payload)
if(!payload?.email){
  throw new BadRequestException("Email not found in token")
}
const checkuserExist = await this.userRepository.findOne({filter:{email:payload.email}})
if(checkuserExist){
  if(checkuserExist.provider != ProviderEnum.GOOGLE){
throw new ConfilctException("email exist with different provider")
}
return{ status:200, Credential: await this.loginwithgmail(idToken,issuer)  };
  }

  const user = await this.userRepository.createOne({data:{
    firstName:payload.given_name,
    lastName:payload.family_name,
    email:payload.email,
    provider:ProviderEnum.GOOGLE,
    confirmEmail:new Date(),
  }})
  return {status:201, Credential: await this.loginwithgmail(idToken,issuer)}
}


}

export default new AuthenticationService();