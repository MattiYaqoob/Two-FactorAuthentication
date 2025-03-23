import express from "express"
import { connectDB } from "./db/connectDB.js";
import dontenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
dontenv.config()
const app = express();

app.get("/", (req, res)=>{
    res.send("Hellow world!")
})

app.use("/api/auth", authRoutes)


app.listen(3000,()=>{
    connectDB();
    console.log("Server is running on port 3000")
})


