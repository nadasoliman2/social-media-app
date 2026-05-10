import app from "../src/app.bootstrap.js";
import { connectDB, redisconnection } from "../src/DB/index.js"; // تأكدي من المسار

export default async function handler(req, res) {
    try {
        // تأكدي إن connectDB جواها check لو فيه connection فعلاً
        await connectDB();
        await redisconnection();
        
        return app(req, res);
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
}