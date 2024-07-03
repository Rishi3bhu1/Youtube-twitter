import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_url:process.env.CLOUDINARY_URL
});

const uploadOnCloudinary = async(localFilePath)=>{
    try {
        //check if localFilePath not there
        if(!localFilePath) return null
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"});
        //file upload successfully
        // console.log("File has been uploaded successfully",response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)//remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}