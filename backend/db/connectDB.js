import mongoose from "mongoose";

export const connectDB = async()=>{

    try{
        console.log("mongo_uro:", process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }catch(err){
        console.log("Error code",err.message)
        process.exit(1)
    }
}