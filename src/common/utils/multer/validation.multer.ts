import type {Request,Express} from 'express'
import { FileFilterCallback } from 'multer'
export const fileFieldValidation ={
Image:["image/jpeg","image/png","image/jpg"],
video:["video/mp4"],
}


export const fileFilter = (validation:string[]) => {
  return (req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {

    if (!validation.includes(file.mimetype)) {
      const error = new Error("invalid file type")
      error.cause = { status: 400 }
     
    }

    return cb(null, true)   // 👈 دي كانت ناقصة
  }
}