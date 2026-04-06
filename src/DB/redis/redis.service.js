import { redis_client } from "./redis.connection.js"


export const set = async ({key,value,ttl}) => {
    try{
        const data=typeof value=="string"? value:JSON.stringfy(value)
        return ttl? await redis_client.set(key,data,{EX:ttl}):await redis_client.set(key,data)
    }
    catch(error){
        throw new Error("redis error on set cash operation ",{cause:500})
    }
}

export const update= async({key,value,ttl}) => {
    try{
        if(!redis_client.exists(key)) return 0
            return await set({key,value,ttl})
        }
        
    catch(error){
        throw new Error("redis error on update cash operation ",{cause:500})
    }
}

export const get = async(key)=>{
    try{
        try{
            return JSON.parse(await redis_client.get(key))
        }catch(error){
            return await redis_client.get(key)
        }

    }
    catch (error){
        console.log(error,"error not get cash operation ")
    }
}

export const ttl =async(key)=>{
    try{
        return await redis_client.ttl(key)
    }
    catch(error){
        console.log(error,"error not ttl operation ")
    }
}

export const exists=async(key)=>{
    try{
        return await redis_client.exists(key)
    }
    catch(error){
        console.log(error,"error in user exists operation");
        
    }
}
export  const expire=async(key,ttl)=>{
    try{
        return await redis_client.expire(key,ttl)
    }
    catch(error){
        console.log(error,"error in user expire operation");
        
    }
}

export const incr = async (key) => {
    try {
        return await redis_client.incr(key)
    }
    catch (error) {
        console.log(error, "error in incr operation");
    }
}

export const deleteKey=async(key)=>{
    try{
        if (!key.length)return 0
        return await redis_client.del(key)

    }
    catch(error){
        console.log(error,"error in user delete operation");
        
    }
}

export const keys=async(pattern)=>{
    try{
        return await redis_client.keys(`${pattern}*`)
    }
    catch(error){
        console.log(error,"error in user keys operation");
        
    }
}


export const max_otp_key = ({ email, subject = "confirmEmail" }) => {
  return `${otp_key({ email, subject })}:max`;
};

export const blocked_otp_key = ({ email, subject = "confirmEmail" }) => {
  return `${otp_key({ email, subject })}:blocked`;
};


export const otp_key = ({ email, subject = "confirmEmail" }) => {
  return `otp:${subject}:${email}`;
};
