import joi from "joi";
import mongoose from "mongoose";

const validationObjectId = (value, helper) => {
    return mongoose.Types.ObjectId.isValid(value) ? true : helper.message("Invalid ObjectId");
}

export const general_rules = {
    id: joi.string().custom(validationObjectId),
    file: joi.object({
        size: joi.number().positive().required(),
        path: joi.string().required(),
        filename: joi.string().required(),
        destination: joi.string().required(),
        mimetype: joi.string().required(),
        encoding: joi.string().required(),
        originalname: joi.string().required(),
        fieldname: joi.string().required()
    })
};
