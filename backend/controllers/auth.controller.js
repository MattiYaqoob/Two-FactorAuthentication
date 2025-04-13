import { User } from '../models/user.model.js'
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';
import crypto from "crypto";
import bcryptjs from "bcryptjs"



export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {

        if (!email || !password || !name) {
            //throw new Error("All fields are required");
        }
        const userAlraedyExists = await User.findOne({ email });


        if (userAlraedyExists) {
            return res.status(400).json({ success: false, message: " User alrady exists" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 1000 // 24hours
        })
        

        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })


    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }

}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;

    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code",
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong during verification",
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const TEN_HOURS = 10 * 60 * 60 * 1000;
        console.log(TEN_HOURS)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: false, message: "Invalid credentials"
            });
        }
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false, message: "invaid credentials"
            });
        }
       

        generateTokenAndSetCookie(res, user._id);
        const now = new Date();
       
        if(user.lastLogin && now - new Date(user.lastLogin) > TEN_HOURS){
            res.clearCookie("token");
        }
        user.lastLogin = now
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined
            },
        })
        
    } catch (error) {
        console.log("Error in login", error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during logout"
        });
    }
};

export const frogotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "No account found with that email.",
            });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetLink);

        res.status(200).json({
            success: true,
            message: "Password reset link has been sent to your email.",
        });
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            });
        }
        await sendResetSuccessEmail(user.email);
        // update password
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("Error with reset password:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        console.log("test2")
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        
        res.status(200).json({
            success: true, user: {
                ...user._doc,
                password: undefined
            }
        });

    } catch (error) {
        console.error("Error with reset auth:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

