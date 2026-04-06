import joi from "joi"
import { general_rules } from "../../common/utils/general.rules.js"

export const sendMessage_schema = {
    body:joi.object({
            content:joi.string().required(),
            userId:general_rules.id.required(),
        }).options({presence:"required"}).messages({
            "any.required":"body  is required"
        }),

    files:joi.array().max(3).items(general_rules.file).required(), 
}