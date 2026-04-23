import { type Response } from "express";

export const successResponse = <T>(
{res, data, message = "Done",
     status = 200}:{
        res: Response,
        data?: T,
        message?: string,
        status?: number
     } )=> {
        return res.status(status).json({
            message,
            data,
            status
        })
     }