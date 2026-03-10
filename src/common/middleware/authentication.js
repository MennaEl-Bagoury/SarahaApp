import * as authService from "../utils/auth.service.js"
import {findById} from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";
import { model } from "mongoose";
import revokeTokenModel from "./revokeTokenModel.js";
const authentication = async (req, res, next) => {
    const {authorization} = req.headers

    if(!authorization){
        throw new Error("token is required from the headers");
    }

    const [prefix , token] = authorization.split(" ");
    if(prefix !== "Bearer"){
        throw new Error("invalid token prefix");
    }
    const decoded = authService.verifyToken({token:token,secret_key:"menna123"})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");

    }
    const user = await dbService.findOne({
        model:userModel,
        id:decoded.id
    })
    if (!user){
            throw new Error ("user not exist",{cause:400});
        }
    if (user?.changecredential?.getTime()>decoded.iat*1000){
            throw new Error ("user not exist");
        }
    const revoked=await dbService.findOne({
        model:revokeTokenModel,
        filter:{tokenId:decoded.jti}
    })
    if (revoked){
        throw new Error("invalid this token")
    }

    // const user = await findById({
    //     model:userModel,
    //     id:decoded.id
    // })
  

    req.user = user
    req.decoded=decoded

    next()
};

export default authentication;