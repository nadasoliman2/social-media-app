
import {Types} from 'mongoose'
import { IUser } from "../../common/interfaces/user.interface.js";
import {AvailabilityEnum} from "../../common/enums/index.js";
import { HydratedDocument } from "mongoose";
export const getAvailability =(user: HydratedDocument<IUser>)=>{
    return [
                    {
                        availability:AvailabilityEnum.PUBLIC
                    },  {
                        availability:AvailabilityEnum.FRIENDS_ONLY
                    },
                    {
                        availability:AvailabilityEnum.PRIVATE,
                        createdBy: user._id
                    },
                    {
                        availability:AvailabilityEnum.FRIENDS_ONLY,
                        createdBy: { $in: [user._id,...user.friends||[]] }
                    },
                    {
                        tags:{$in:[user._id]}
                    }
                ]
}