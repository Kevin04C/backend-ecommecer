import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dcyv3nzsg",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

export const uploadPhoto = async (fileName) => {
  return await cloudinary.uploader.upload(fileName, {
    folder: "ecommerce/users",
    transformation: [
      { width: 500, height: 500, gravity: "face", crop: "thumb" },
    ],
  });
};

export const removePhoto = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};
