// require('dotenv').config({path:'./env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error;
    })
    app.listen(process.env.PORT||8080,()=>{
        console.log(`The server has started at port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.error("MONGODB connection failed!!: ",err)
})