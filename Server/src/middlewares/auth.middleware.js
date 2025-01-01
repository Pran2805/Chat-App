import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const protectRoute = asyncHandler(async (req, res, next) => {
   try {
     const token = req.cookies.jwt
     if (!token) {
         throw new ApiError(401, "Unauthorized - No Token Provided")
     }
 
     const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
     if (!decodedToken) {
         throw new ApiError(401, "Invalid Token")
     }

     const user = await User.findById(decodedToken.id).select("-password")
     if (!user) {
         throw new ApiError(404, "User Not Found")
     }
 
     req.user = user;
     next()
   } catch (error) {
       console.log(error.message);
    throw new ApiError(500, error.message)
    
   }


})