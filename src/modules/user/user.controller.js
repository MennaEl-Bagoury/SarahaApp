import { Router } from "express";
import authentication from "../../common/middleware/authentication.js";
// import { RoleEnum } from "../../common/user.enum.js";
import * as US from "./user.service.js";
// import { authorization } from "../../common/middleware/authorization.js";
import validation from "../../common/middleware/validation.js";
import { multer_local } from "../../common/middleware/multer.js";
import { forgetPasswordSchema, resetPasswordSchema, signUpSchema } from "./user.validation.js";
import { MimeEnum } from "../../common/enum/MimeEnum.js";

const userRouter = Router();

userRouter.post("/signup",
    multer_local({ file_type: MimeEnum.images }).single("attachment"),
    validation(signUpSchema),
    US.signUp
);

userRouter.post("/signupotp",
    multer_local({ file_type: MimeEnum.images }).single("attachment"),
    validation(signUpSchema),
    US.sendEmailOtp
);

userRouter.post("/signin/gmail", US.signUpWithGmail);

userRouter.post("/signin", US.signIn);
userRouter.post("/resend-otp", US.resendOtp);
userRouter.patch("/confirm-email", US.confirmedEmail);
userRouter.get("/profile", authentication, US.getProfile);

// userRouter.get("/share-profile/:id", validation(shareProfileSchema), US.shareProfile);

// userRouter.get("/refresh-token", US.refreshToken);

// userRouter.patch("/update-profile",
//     validation(shareProfileSchema),
//     authentication,
//     US.updateProfile
// );

userRouter.post("/logout", authentication, US.logout);
userRouter.post("/forget-password", validation(forgetPasswordSchema), US.forgetPassword);
userRouter.patch("/reset-password", validation(resetPasswordSchema), US.resetPassword);

export default userRouter;