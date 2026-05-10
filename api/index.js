import app from "../src/app.js";
import { connectDB, redisconnection } from "../src/DB/index.js";

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    await connectDB();
    await redisconnection();
    isConnected = true;
  }

  return app(req, res);
}