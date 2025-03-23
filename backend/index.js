import express from "express"
import { connectDB } from "./db/connectDB.js";
import dontenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
dontenv.config()
const app = express();
const PORT = process.env.PORT || 5000


app.use("/api/auth", authRoutes)
app.use(express.json()); // allows us to parse incming requste : req.body

app.listen(PORT,()=>{
    connectDB();
    console.log("Server is running on port 3000", PORT)
})


