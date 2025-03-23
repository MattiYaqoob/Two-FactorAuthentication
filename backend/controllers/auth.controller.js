import bcryptjs from 'bcryptjs';
import {User} from '../models/user.model.js'
import { generateVerificationCode } from '../utils/generateVerificationCode.js';

export const signup = async(req, res)=>{
    const {email, password, name} = req.body;
    
        try{
            if(!email|| !password || !name){
                throw new Error("All fields are required");
            }
            const userAlraedyExists = await User.findOne({email});

            if(userAlraedyExists){
                return res.status(400).json({success:false, message: " User alrady exists"});
            }
            const hashedPassword = await bcryptjs.hash(password, 10);
            const verificationToken =  Math.floor(100000 + Math.random() * 900000).toString();
            const user = new user ({
                email,
                password: hashedPassword,
                name,
                verificationToken, 
                verificationTokenExpiresAt: Date.now() + 24 * 60 * 100 // 24hours
            })

        }catch(error){
            res.status(400).json({success: false, message: error.message})
        }
    
}
export const login = async(req, res)=>{
    res.send("login route")
}
export const logout = async(req, res)=>{
    res.send("logout route")
}