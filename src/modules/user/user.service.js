import userModel from "../../DB/models/user.model.js"
import * as dbService from "../../DB/db.service.js"
import * as success from "../../common/utils/successRes.js"
import { Compare, Hash } from "../../common/utils/security/hash.security.js"
import { decrypt, encrypt } from "../../common/utils/security/encrypt.security.js"
import { v4 as uuidv4 } from 'uuid';
import * as authService from "../../common/utils/auth.service.js"
import {OAuth2Client} from'google-auth-library';
import { EmailSubjectEnum, ProviderEnum } from "../../common/enum/user.enum.js"
import { SECRET_KEY } from "../../../config/config.service.js"
import revokeTokenModel from "../../common/middleware/revokeTokenModel.js"
import { generatOTP, sendEmail } from "../../common/utils/email/email.js"
import { eventEmitter } from "../../common/utils/email/sendEmailService.js";
import { emailTemplate } from "../../common/utils/email/emailTemplete.js";
import { set, get, ttl, deleteKey, blocked_otp_key, otp_key, max_otp_key } from "../../DB/redis/redis.service.js";
import { incr } from "../../DB/redis/redis.service.js";


const sendOtpHelper = async ({ email, subject = EmailSubjectEnum.confirmEmail }) => {
  const isBlocked = await ttl(blocked_otp_key({ email, subject }));
  if (isBlocked > 0) {
    throw new Error(`You are blocked, please try again after ${isBlocked} seconds`, { cause: 429 });
  }

  const ttlOtp = await ttl(otp_key({ email, subject }));
  if (ttlOtp > 0) {
    throw new Error(`You already have an OTP that hasn't expired yet, please try again after ${ttlOtp} seconds`, { cause: 429 });
  }

  if (await get(max_otp_key({ email, subject })) >= 5) {
    await set({ key: blocked_otp_key({ email, subject }), value: 1, ttl: 15 * 60 });
    throw new Error(`You have exceeded the maximum number of trials. Please try again after 15 minutes.`, { cause: 429 });
  }

  const otp = await generatOTP();
  eventEmitter.emit("confirmEmail", async () => {
    await sendEmail({
      to: email,
      subject: `Saraha App - ${subject}`,
      html: emailTemplate(otp)
    });
    await set({ 
        key: otp_key({ email, subject }), 
        value: Hash({ plainText: `${otp}` }), 
        ttl: 60 * 5 
    });
    await incr(max_otp_key({ email, subject }));
  });
};

export const sendEmailOtp = async (req, res, next) => {
  const { email } = req.body;
  await sendOtpHelper({ email, subject: EmailSubjectEnum.confirmEmail });
  success.success_response({ res, status: 200, message: "OTP sent successfully" });
};
export const resendOtp = async (req, res, next) => {
    const { email } = req.body
    const user = await dbService.findOne({
        model: userModel,
        filter: { email, confirmed: { $exists: false }, provider: ProviderEnum.system }
    })
    if (!user) {
        throw new Error("user not exist or already confirmed", { cause: 404 })
    }

    await sendOtpHelper({ email, subject: EmailSubjectEnum.confirmEmail });
    success.success_response({ res, message: "OTP resent successfully" })
};
export const signUp = async (req, res) => {
    const { userName, email, password, gender, phone } = req.body;
    if (!email) {
        throw new Error("email is required", { cause: 400 });
    }
    const userExists = await dbService.findOne({ model: userModel, filter: { email } });
    if (!userExists) {
        const user = await dbService.create({
            model: userModel,
            data: {
                userName,
                email,
                password: Hash({ plainText: password, saltRounds: 12 }),
                phone: encrypt(phone),
                gender
            }
        });
        return success.success_response({ res, status: 201, data: user });
    }
    throw new Error("email already exists", { cause: 400 });
}
export const confirmedEmail=async(req,res,next)=>{
    const{email,code}=req.body
    const otpValue=await get(otp_key({ email, subject: EmailSubjectEnum.confirmEmail }))
    if(!otpValue){
        throw new Error("otp Expired", { cause: 400 })
    }
    if (!Compare({plainText:code,cipherText:otpValue})){
        throw new Error("Invalid otp", { cause: 400 })
    }

    const user=await dbService.findOneAndUpdate({
        model:userModel,
        filter:{email,confirmed:{$exists:false},provider:ProviderEnum.system},
        update:{confirmed:true}
    })
    if(!user){
        throw new Error("user not exist or already confirmed", { cause: 404 })

    }
    await deleteKey(otp_key({ email, subject: EmailSubjectEnum.confirmEmail }))
    success.success_response({res,message:"email confirmed successfully"})

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
        throw new Error("please logIn using the system form", { cause: 400 });
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
                //expiredAt:new Date(req.decoded.int*1000+ 1*60*60*1000)      1h

            }
        })
    }
    success.success_response({res})
}

export const updatePassword = async (req, res, next) => {
    let { newPassword, oldPassword } = req.body;
    if (!Compare({ plainText: oldPassword, cipherText: req.user.password })) {
        throw new Error("invalid old password", { cause: 400 });
    }
    const hash = Hash({ plainText: newPassword });
    req.user.password = hash;
    req.user.changeCredential = new Date();
    await req.user.save();
    success.success_response({ res });
}

export const getProfile = async (req,res) => {
    const user = await dbService.findOneAndUpdate({
        model: userModel,
        filter: { _id: req.user._id },
        update: { $inc: { visitsCount: 1 } },
        options: { new: true }
    });
    return success.success_response({res,message:"done",data:{...user._doc,phone:decrypt(user.phone)}})
}

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.system,
      confirmed: true
    }
  });

  if (!user) {
    throw new Error("user not exist or invalid provider", { cause: 404 });
  }

  await sendOtpHelper({ email, subject: EmailSubjectEnum.forgetPassword });
  success.success_response({res,message:"otp sent successfully"});
};

export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const otpValue = await get(otp_key({ email, subject: EmailSubjectEnum.forgetPassword }));

  if (!otpValue) {
    throw new Error("otp expired", { cause: 400 });
  }

  if (!Compare({ plainText: code, cipherText: otpValue })) {
    throw new Error("invalid otp", { cause: 400 });
  }

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.system,
      confirmed: true
    },
    update: {
      password: Hash({ plainText: password }),
      changeCredential: new Date()
    }
  });

  if (!user) {
    throw new Error("user not exist or invalid provider", { cause: 404 });
  }
  await deleteKey(otp_key({ email, subject: EmailSubjectEnum.forgetPassword }))
  success.success_response({res,message:"password reset successfully"})
};