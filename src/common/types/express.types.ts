import { HydratedDocument } from "mongoose";
import {IUser} from "../../common/interfaces/user.interface.js";
import { JwtPayload } from "jsonwebtoken";

export {}
declare module "express-serve-static-core"{
    interface Request{
user:HydratedDocument<IUser>,
decoded:JwtPayload
    }
}