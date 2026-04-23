import { DeleteObjectsCommand,DeleteObjectCommand,GetObjectCommand,ObjectCannedACL, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_EXPIRE_IN, APPLICATION_NAME, AWS_BUCKET_NAME, AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, AWS_REGION } from "../../config/config.service.js";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import {UploadApproachEnum, StorageApproachEnum } from "../enums/index.js";
import { BadRequestException } from "../exception/domain.exception.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CompleteMultipartUploadCommandOutput } from "@aws-sdk/client-s3";
export class S3Service {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });
  }

  async uploadAsset({
    storageApproach = StorageApproachEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    ContentType
  }: {
    storageApproach?: StorageApproachEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string | undefined;
  }) {

    if (!file) {
      throw new BadRequestException("No file provided");
    }

    const key = `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ACL,
      Body:
    //   file.buffer
        storageApproach === StorageApproachEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType
    });

    await this.client.send(command);

    return key;
  }
 async uploadLargeAsset({
    storageApproach = StorageApproachEnum.DISK,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    file,
    ACL = ObjectCannedACL.private,
    ContentType,
    partSize=5
  }: {
    storageApproach?: StorageApproachEnum;
    Bucket?: string;
    path?: string;
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    partSize?: number;
  }):Promise<CompleteMultipartUploadCommandOutput> {
    const key = `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`;

const uploadFile = new Upload({
client:this.client,
params:{
  Bucket,
      Key: key,
      ACL,
      Body:
    //   file.buffer
        storageApproach === StorageApproachEnum.MEMORY
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype || ContentType
},
partSize: partSize* 1024 * 1024 // 5MB
})
uploadFile.on("httpUploadProgress",(progress)=>{
  console.log(progress)
  if (progress.total) {
    console.log(`file upload is ${Math.round((progress.loaded / progress.total) * 100)}% done`)
  }
})
return  await uploadFile.done();
    
  }
 async uploadAssets({
      uploadApproach=UploadApproachEnum.SMALL,
    storageApproach = StorageApproachEnum.MEMORY,
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    files,
    ACL = ObjectCannedACL.private,
    ContentType
  }: {
    uploadApproach?: UploadApproachEnum;
    storageApproach?: StorageApproachEnum;
    Bucket?: string;
    path?: string;
    files: Express.Multer.File[];
    ACL?: ObjectCannedACL;
    ContentType?: string;
  }):Promise<string[]> {

   let  urls:string[]=[]
   if(uploadApproach === UploadApproachEnum.LARGE){
     urls= await Promise.all(
      files.map(file=>this.uploadLargeAsset(
        {    storageApproach ,
      Bucket,
      path ,
      file,
      ACL ,
      ContentType}
      ))
     )
   }
   else{
 urls=   await Promise.all(
    files.map(file=>{
return   this.uploadAsset(
      {    storageApproach ,
    Bucket,
    path ,
    file,
    ACL ,
    ContentType}

    )}
  )

   )}
return urls
}


async createPreSignedUploadLink({
  Bucket = AWS_BUCKET_NAME,
  path = "general",
  Originalname,
  ContentType,
  expiresIn = AWS_EXPIRE_IN
}: {
  expiresIn?: number;
  Bucket?: string;
  path?: string;
  Originalname: string;
  ContentType: string | undefined;
}): Promise<{ url: string; key: string }> {

  const key = `${APPLICATION_NAME}/${path}/${randomUUID()}__${Originalname}`;

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    ContentType
  });
if (!command.input.Key) {
      throw new BadRequestException("No file provided");
    }
  const url = await getSignedUrl(this.client, command, { expiresIn });

  return { url,key };
}
async createPreSignedFetchLink({
  Bucket = AWS_BUCKET_NAME,
  key,
 expiresIn = AWS_EXPIRE_IN,
fileName,
download
}: {
  expiresIn?: number;
  Bucket?: string;
 key:string;
    fileName?:string | undefined;
  download?:string | undefined;
}): Promise<string> {

  const command = new GetObjectCommand({
    Bucket,
    Key: key,
    ResponseContentDisposition: download === "true" ? `attachment; filename="${fileName || key.split("/").pop()}"` : undefined
  });

  const url = await getSignedUrl(this.client, command, { expiresIn });

  return url;
}
  async getAsset({
    Bucket = AWS_BUCKET_NAME,
   Key
  }: {
    
    Bucket?: string;
Key:string
  }) {

    const command = new GetObjectCommand({
      Bucket,
      Key
    });

  return  await this.client.send(command);

   
  }
  async deleteAsset({
    Bucket = AWS_BUCKET_NAME,
   Key
  }: {
    Bucket?: string;
Key:string
  }){
    
      const command = new DeleteObjectCommand({
      Bucket,
      Key
    });
    return await this.client.send(command);
  }
async deleteAssets({
  Bucket = AWS_BUCKET_NAME,
  Keys
}: {
  Bucket?: string;
  Keys: { Key: string }[]
}) {

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects: Keys,
      Quiet: false
    }
  });

  return await this.client.send(command);
}
}
export const s3service = new S3Service();
