import express from "express"
import { connectDB } from "./db/connectDB.js";
import dontenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser";

dontenv.config()
const app = express();
const PORT = process.env.PORT || 5001

app.use(express.json()); // allows us to parse incming requste : req.body
app.use(cookieParser()); // allows us to parse incming cookies
app.use("/api/auth", authRoutes)


app.listen(PORT, () => {
    connectDB();
})


