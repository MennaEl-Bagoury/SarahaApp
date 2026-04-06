import * as authService from "../utils/auth.service.js"
import * as dbService from "../../DB/db.service.js"
import userModel from "../../DB/models/user.model.js";
import { SECRET_KEY } from "../../../config/config.service.js";
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
    const decoded = authService.verifyToken({token:token,secret_key:SECRET_KEY})

    if (!decoded || !decoded?.id){
        throw new Error("invalid token");

    }
    const user = await dbService.findById({
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