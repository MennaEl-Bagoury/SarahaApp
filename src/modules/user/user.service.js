import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/db.service.js"
import * as success from "../../common/utils/successRes.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js"
import { v4 as uuidv4 } from 'uuid';
import * as authService from "../../common/utils/auth.service.js"
import {OAuth2Client} from'google-auth-library';
import { ProviderEnum } from "../../common/enum/user.enum.js"
import { SECRET_KEY } from "../../../config/config.service.js"
import revokeTokenModel from "../../common/middleware/revokeTokenModel.js"

export const signUp = async (req,res) => {
        const {userName,email,password,gender,phone} = req.body
        if(!await dbService.findOne({model:userModel,filter:{email}})){
            const user = await dbService.create({
                model:userModel,
                data:{
                    userName,
                    email,
                    password:Hash({plainText:password,saltRounds:12}),
                    phone:encrypt(phone),
                    gender
                }
            });
            return success.success_response({res,status:201,data:user})
            // return res.status(201).json({message:"done" , user})
        }
        throw new Error("email aready exist",{cause:400});
        // return res.status(409).json({message:"email aready exist"})
}

export const signUpWithGmail = async (req,res) => {
    const {idToken} = req.body
    console.log(idToken);
    
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: "746397644004-0lrjg9attdmq6bfpeo5nmcpfjij20s0m.apps.googleusercontent.com",  
    });
    const payload = ticket.getPayload();
    const {email,name,picture,email_verified} = payload;

    let user = await dbService.findOne({model:userModel , filter:{email}})
    
    if (!user){
        user = await dbService.create({
            model:userModel ,
            data:{
                email,
                userName:name,
                profilePic:picture,
                confirmed:email_verified,
                provider:ProviderEnum.google
            }
        })
    }

    if (user && user.provider ==  ProviderEnum.system ){
        throw new Error("please logIn using the system form");
    }

    const access_token = authService.generateToken(
            //payload (data will be encrypted into the token)
            {
                payload:{
                id:user._id,
                email:user.email
            },

            secret_key:SECRET_KEY,

            options:{
                expiresIn: "1day",
            }
        })
        success.success_response({res,message:"logged in successfully",data:{access_token}})

}

export const signIn = async (req,res) => {
        const { email, password } = req.body;
        const user = await dbService.findOne({
        model: userModel,
        filter: { email }
    });

    if (!user) {
        throw new Error("email not exist you need to create an account", { cause: 404 });
    }

    if (!Compare({ plainText: password, cipherText: user.password })) {
        throw new Error("Invalid password", { cause: 400 });
    }

    const access_token = authService.generateToken({
        payload: {
            id: user._id,
            email: user.email
        },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1h",       
            // noTimeStamp: true,     
            // notBefore: 60*60    
            jwtid: uuidv4()      
        }
    });

    const refresh_token = authService.generateToken({
        payload: {
            id: user._id,
            email: user.email
        },
        secret_key: SECRET_KEY,
        options: {
            expiresIn: "1y"      
        }
    });

    success.success_response({
        res,
        message: "logged in successfully",
        data: { access_token, refresh_token }
    });
};
export const logout=async(req,res,next)=>{
    const {flag}=req.query
    if(flag=="all"){
        req.user.changecredential=new Date()
        await req.user.save()
        await dbService.deleteMany({
            model:revokeTokenModel,
            filter:{userId:req.user._id}
        })
    }
    else{
        await dbService.create({
            model:revokeTokenModel,
            data:{
                tokenId:req.decoded.jti,
                userId:req.user._id,
                expiredAt:new Date(req.decoded.exp*1000) 
            }
        })
    }
    success.success_response({res})
}


export const getProfile = async (req,res) => {
        const user = await dbService.findOneAndUpdate({
                model: userModel,
                filter: { _id: req.user._id },
                update: { $inc: { visitsCount: 1 } },
                options: { new: true }
    });
        return success.success_response({res,message:"done",data:{...req.user._doc,phone:decrypt(req.user.phone)}})
}
