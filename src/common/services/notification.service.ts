import admin from "firebase-admin"
import { readFileSync } from "fs"
import { resolve } from "path"
import {FIREBASE_PROJECT_ID,FIREBASE_PRIVATE_KEY,FIREBASE_CLIENT_EMAIL} from "../../config/config.service.js"
export class Notification{
    private client:admin.app.App
    constructor(){
// var serviceAccount =JSON.parse( readFileSync(resolve("./src/config/social-media-app-eae43-firebase-adminsdk-fbsvc-fbe43f9ba1.json"))as unknown as string);

this.client = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY
  })
})
    }
    async sendNotification({ token,
            data
              }:{
                     token:string,
            data:{title:string,body:string}
               
                }){
        const message = {
            token,
            notification: {
                title:data.title,
                body:data.body
        }
    }
    return await this.client.messaging().send(message)
}
 async sendNotifications({ tokens,
            data
              }:{
                     tokens:string[],
            data:{title:string,body:string}
               
                }){
     await Promise.allSettled(tokens.map(token=>{
        return this.sendNotification({ token, data })
     }))
}

}
export const notificationService = new Notification()