import {asyncHandler} from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
    } catch (error) {
        throw new apiError(400,"Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user exists or not:username,email
    // check for images,check for avatar 
    // upload them to cloudinary,avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res
    const {fullname,email,username,password} = req.body;
    if([fullname,email,username,password].some((fields)=>
    fields?.trim()==="")
    ){
        throw new apiError(400,"All fields are compulsory")
    }
    const existedUser = await User.findOne({
        $or:[{ username },{ email }]
    })
    if(existedUser){
        throw new apiError(409,"User with email or username already exists")
    }
    const avatarLocalPath =   req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if(req.files&& Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new apiError(400,"Avatar file Path is required");
    }
    const avatar =  await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new apiError(400,"Avatar file is required");
    }
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
    )
    console.log(createdUser)
    if(!createdUser){
        throw new apiError(500,"Something went wrong while registering the user");
    }
    return res.status(201).json(
        new apiResponse(200,createdUser,"User registered successfully")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
    // req body ->data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies
    const {email,password,username} = req.body;
    if(!username&&!email){
        throw new apiError(400,"username or email is required");
    }
    const user = await User.findOne({
        $or:[{username},{email}],
    })
    if(!user){
        throw new apiError(404,"User doesn't exists");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new apiError(400,"Invalid user credientials")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const logginedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(
            200,
            {
                user:logginedInUser,accessToken,refreshToken
            },
            "User Logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new apiError(401,"Unauthorized request");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        const user =await User.findById(decodedToken?._id);
        if(!user){
            throw new apiError(401,"Invalid access Token")
        }
        if(incomingRefreshToken!== user?.refreshToken){
            throw new apiError(401,"Refresh token is expired or used");
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,newRefreshToken},
                "access Token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message||"invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

