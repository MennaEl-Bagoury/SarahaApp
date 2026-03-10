import mongoose from "mongoose";
import { DB_URL } from "../../config/config.service.js";


const checkConnection = async () => {
    return await mongoose.connect(DB_URL)
.then(()=>{
        console.log("DB connecting successfully");
    })
    .catch(()=>{
        console.log("DB connecting Failed");
    })    
}

export default checkConnection;