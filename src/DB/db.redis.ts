import { createClient } from "redis"
import {REDIS_URI} from "../config/config.service.js"
import {RedisClientType} from '@redis/client'
 export const redisclient: RedisClientType = createClient({
  url: REDIS_URI as string
});
export const redisconnection = async () => {
    try{
 

redisclient.on("error", function(err) {
  throw err;
});
await redisclient.connect()
await redisclient.set('foo','bar');
console.log('redis connected successfully')
    }catch(err){
        console.log(err)
    }
}