import { HydratedDocument } from "mongoose";
import {IUser} from "../../common/interfaces/user.interface.js";
import RedisService from "../../common/services/redis.service.js";
import {createloginCredentials} from '../../common/services/token.security.js'
import {LogoutEnum,StorageApproachEnum} from '../../common/enums/index.js'
import {ConfilctException} from '../../common/exception/index.js'
import { Types } from "mongoose";
import {access_token_expires_in,refresh_token_expires_in} from '../../config/config.service.js'
import { s3service } from '../../common/services/s3.services.js'
import { url } from "inspector";
import { ListObjectVersionsCommand } from "@aws-sdk/client-s3";
class UserService{
  private readonly redis: typeof RedisService
  private readonly s3:s3service
    constructor() {
      this.redis = RedisService;
      this.s3 = s3service;
    }
  async  profile(user:HydratedDocument<IUser>):Promise<IUser>{
return user.toJSON()
    }

async rotateToken(user: HydratedDocument<IUser>, {sub,jti,iat}:{jti:string,iat:number,sub:string}, issuer:string) {
    if((iat + access_token_expires_in ) * 1000 >= Date.now() + (30000) ){
      throw new  ConfilctException("Current access token still valid")
    }
    await this.redis.set({
      key: this.redis.revokeTokenKey({ userId: sub, jti }),
      value: jti,
      ttl: iat + refresh_token_expires_in
    })
    return await createloginCredentials(user,issuer)
}


async logout({flag} :{flag:LogoutEnum}, user:HydratedDocument<IUser> , {jti, iat, sub}:{jti:string, iat:number, sub:string}):Promise<number> {
    let status = 200
    switch(flag){
        case LogoutEnum.ALL:
              user.changeCredentialsTime = new Date(Date.now());
    await user.save();
    await  this.redis.deleteKey(await this.redis.keys(this.redis.baseRevokeTokenKey(sub)) || [])
            break;
            default:
                // await 
                //   tokenModel.create({
                    
                //         userId: user._id,
                //         jti,
                //           expiresIn: new Date((iat + refresh_token_expires_in) *1000)
                    
                // })
                // status=201
await this.redis.set({
  key: this.redis.revokeTokenKey({ userId: sub, jti }),
  value: jti,
  ttl: iat + refresh_token_expires_in
})
                status=201
                break;
    }
  
    return status
}
async profileImage({ContentType,Originalname}:{ContentType:string,Originalname:string},user: HydratedDocument<IUser>){
  const oldPic= user.profilepicture
  const {key,url}= await this.s3.createPreSignedUploadLink(
    {path:`Users.${user._id}/profile`,
    ContentType,Originalname
}
  )
  console.log(key)
 user.profilepicture = key as string
//  console.log(user)
await user.save()
console.log("Saved user:", user.profilepicture)

if(oldPic){
 const deletion = await this.s3.deleteAsset({Key:oldPic})
 console.log(deletion)
}
return {user,url}
}

async profilecoverImages(files: Express.Multer.File[],user: HydratedDocument<IUser>){
  const oldUrls = user.profilecoverpicture as string[]
  const urls = await this.s3.uploadAssets(
    {files,path:`Users.${user._id}/profile/cover`,
storageApproach: StorageApproachEnum.DISK}
  )
console.log("OLD URLs:", oldUrls)
if(oldUrls && oldUrls.length > 0){
const deletion = await this.s3.deleteAssets({
  Keys: oldUrls.map(ele => ({ Key: ele }))
})
}

user.profilecoverpicture = urls
await user.save()
return user.toJSON()
}
}
export default new UserService()