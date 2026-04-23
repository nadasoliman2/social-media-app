import mongoose from 'mongoose';
import {DB_URL} from '../config/config.service.js'
export const connectDB = async () => {

    try{
        const databaseConnectionResult = await mongoose.connect(DB_URL,{serverSelectionTimeoutMS:30000}) as unknown as {connection: mongoose.Connection};
        // await UserModel.syncIndexes()
        console.log(`DB connected success`)

    }catch(error){
console.log(`fail to connect ${error}`)
    }
}
