import express from 'express';
import {commentRouter,postRouter,authRouter,userRouter,notificationRouter,schema} from './modules/index.js';
import {globalErrorHandler} from './middleware/index.js';
import { connectDB , redisconnection} from './DB/index.js';
import { UserModel } from './DB/model/user.model.js';
import { GenderEnum} from './common/enums/index.js';
import cors from 'cors'
import {Types} from "mongoose"
import { s3service } from './common/services/s3.services.js'
import { notificationService } from './common/services/notification.service.js';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'
import{UserRepository} from './DB/repository/user.repository.js';
import { successResponse } from './common/response/success.response.js';
import { createHandler } from "graphql-http/lib/use/express";
import { authentication,authorization } from "./middleware/authentication.middleware.js"

const s3WriteStream = promisify(pipeline)
    const app: express.Express = express();

    app.use(cors());
    app.use(express.json());
  
    app.all("/graphql",authentication(),createHandler({schema:schema ,context:(req)=>({
user:req.raw.user,
decoded:req.raw.decoded
    })}))
    app.use('/auth', authRouter);
app.use('/post',postRouter)
app.use('/comment',commentRouter)
 app.use('/user', userRouter);
  app.use('/notification', notificationRouter);
// app.use('/sayHi',(req: express.Request, res: express.Response, next: express.NextFunction)=>{
// return successResponse({res,data:{message:"hello world"}})
// })
app.get('/uploads/*path',async(req: express.Request, res: express.Response, next: express.NextFunction):Promise<express.Response> => {
  const {download,fileName}= req.query as {download?:string,fileName?:string}
  const {path}=req.params as {path:string[]}
  const link =path.join("/")
  const {Body,ContentType}= await s3service.getAsset({Key:link})
  console.log({Body,ContentType})

  res.setHeader("Content-Type", ContentType || "application/octet-stream")
  res.set("Cross-Origin-Resource-Policy","cross-origin")

  if(download==="true"){
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="${fileName || link.split("/").pop()}"`
  )
  }
      return await s3WriteStream(Body as NodeJS.ReadableStream,res)
    })
    app.get('/pre-signed/*path',async(req: express.Request, res: express.Response, next: express.NextFunction):Promise<express.Response> => {
  const {download,fileName}= req.query as {download?:string,fileName?:string}
  const {path}=req.params as {path:string[]}
  const link =path.join("/")
const data= await s3service.createPreSignedFetchLink({key:link, download, fileName})
console.log(data)
return res.status(200).json(data)
    });

    app.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    return    res.status(200).json({message:"done"});
    });
//      app.post('/send-notification', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//       console.log({token:req.body.token})
//       try {
//   const data=    await notificationService.sendNotification({
        
//         token: req.body.token,
//         data: {
//           title: "first time",
//           body: "hello world"
//         }
//       })
//  console.log(data)   }
//       catch(err){
//         console.log(err)
//       }
//     return    res.status(200).json({message:"done"});
//     });
    app.get('/*dummy', (req: express.Request, res: express.Response, next: express.NextFunction) => {
      return  res.status(404).json({message:"Invalid application routing"});
    });
 
app.use(globalErrorHandler);
const userrepo = new UserRepository()
//  const user= await userrepo.deleteOne(
//   {filter:{
//   _id:Types.ObjectId.createFromHexString("69e2a8e5ed2dcc1720709c32"),
//   force:true}
// })
//  console.log(user)
    // app.listen(3000,()=>{
    //     console.log("Application is listening on port 3000");
    // })
    // console.log("Bootstrapping the application...");


export default app;