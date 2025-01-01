import { generateToken } from "../config/generateToken.js";
import User from "../models/User.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import cloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Avatar handling (ensure that req.file or req.files exists)
    const avatar = req.files ? req.files.avatar : req.file ? req.file.path : undefined;

    // Checking for blank fields
    if (!name || !email || !password) {
        throw new ApiError(400, "Please provide all fields");
    }

    // Checking if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User already exists");
    }


    // Creating the new user
    const newUser = new User({
        name,
        email,
        password,
        avatar,
    });

    // Saving the new user
    await newUser.save();

    // Generate token and set the cookie
    const token = await generateToken(newUser._id, res);

    // Send the success response
    res
        .status(200)
        .cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",

        })
        .json(new ApiResponse(200, newUser, "User Registered Successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Please provide email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }
    const token = await generateToken(user._id, res);

    res
        .status(202)
        .cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",

        })
        .json(
            new ApiResponse(200, user, "User logged in successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    res
        .cookie('jwt', "", {
            maxAge: 0
        })
        .status(200).json(new ApiResponse(200, null, "User logged out successfully"));
})

const updateProfile = asyncHandler(async (req, res) => {
    const { avatar } = req.body;
    const userId = req.user._id

    console.log(req)
    console.log(avatar)
    if (!avatar) {
        throw new ApiError(400, "Please provide profile image")
    }
    const uploadResponse = await cloudinary.uploader.upload(avatar)
    const updatedUser = await User.findByIdAndUpdate(userId,
        {
            avatar: uploadResponse.secure_url
        },{
            new: true
        })

        res.status(300).json(
            new ApiResponse(300, updatedUser, "Profile updated successfully")
        )

})

const checkAuth = asyncHandler(async(req, res, next)=>{
   try {
     res.status(200).json(req.user)
   } catch (error) {
    console.log("User is not login")
    res.status(401).json(new ApiResponse(401, null, "User is not logged in"))
   }
})



export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    checkAuth,
}