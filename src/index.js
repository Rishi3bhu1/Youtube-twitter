// require('dotenv').config({path:'./env'});
import dotenv from "dotenv";
import mongoose from "mongoose";
import {DB_NAME} from "./contants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./env"
})

connectDB();
// import express from "express"
// const app =express();
// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR: ",error)
//             throw err
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log("The server has started")
//         })
//     }catch(error){
//         console.error("ERROR:",error)
//         throw err
//     }
// })()