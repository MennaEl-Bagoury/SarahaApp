import joi from "joi"
import { GenderEnum } from "../../common/enum/user.enum.js"


export const signUpSchema = {
    body: joi.object({
        userName: joi.string().min(2).max(50),
        email: joi.string().email({ tlds: { allow: false, deny: ['yahoo'] } }),
        password: joi.string().min(8),
        cPassword: joi.string().valid(joi.ref("password")).messages({
            "any.required": "password is required"
        }),
        phone: joi.string(),
        gender: joi.string().valid(...Object.values(GenderEnum)).default("male")
    }).options({ presence: "required" }).messages({
        "any.required": "body is required"
    }),

    query: joi.object({
        flag: joi.boolean().truthy("yes", "y", "1").falsy("no", "n", "0")
    })
}
    
export const signInSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().required(),
    })
}

export const forgetPasswordSchema = {
    body: joi.object({
        email: joi.string().email().required(),
    })
}

export const resetPasswordSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        code: joi.string().length(6).required(),
        password: joi.string().min(8).required(),
        cPassword: joi.string().valid(joi.ref("password")).required(),
    })
}