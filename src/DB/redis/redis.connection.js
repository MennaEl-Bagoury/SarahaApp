import { createClient } from "redis"
import { REDIS_URL } from "../../../config/config.service.js";

export const redis_client = createClient({
  url: REDIS_URL
});

export const connectionRedis=async()=>{
    await redis_client.connect()
    .then(()=>console.log("redis connected"))
    .catch(()=>console.log(error,"redis connection error"))
    }