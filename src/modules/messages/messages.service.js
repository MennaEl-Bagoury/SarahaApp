import cloudinary from "../../common/utils/cloudinary.js";
import { success_response } from "../../common/utils/successRes.js";
import * as dbService from "../../DB/db.service.js"
import messageModel from "../../DB/models/message.model.js"
import userModel from "../../DB/models/user.model.js";


export const sendMessages = async (req,res,next)=>{
    const {userId , content , attachments} = req.body

    const user = await dbService.findById({
        model:userModel,
        id:userId
    });

    if(!user){throw new Error("User not found",{cause:400});}

    const attachments_paths=[]
    if(req.files.length){
        for (const file of req.files) {
        console.log("before sending messgaes_attachments to cloudinary");
            const {secure_url,public_id} = await cloudinary.uploader.upload(
                file.path,
                {
                    folder: `sarahaApp/messgesMedia/${user.email}`
                }
            )
            attachments_paths.push({secure_url,public_id})
        }
    }
        try{
            const message_details = await dbService.create({
                model:messageModel,
                data:{
                    userId,
                    content , 
                    attachments:attachments_paths
                }
            })
            return success_response({res,data:message_details})
        }
        catch(err){
            for (const file of attachments_paths) {
                await cloudinary.uploader.destroy(file.public_id);
            }
            throw new Error(err);
        }
}

export const getMessages = async (req,res,next)=>{
    const user_messages = await dbService.find({
        model:messageModel,
        filter:{
            userId:req.user.id
        }
    })
    
    const messages_details = []
    for (const message of user_messages) {
        const {content,attachments} = message;
        messages_details.push({content,attachments})
    }

    return success_response({res,data:messages_details})
}