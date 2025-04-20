import { User } from '../models/user.model.js'
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';
import crypto from "crypto";
import bcryptjs from "bcryptjs"
import speakeasy from "speakeasy";
import qrcode from "qrcode";



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
        const now = new Date();

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

        user.twoFactorRequired = true;

        // if (user.twoFactorEnabled) {
        //     return res.status(200).json({
        //         success: true,
        //         message: "2FA code required",
        //         step: "2FA_REQUIRED",
        //         userId: user._id,
        //     });
        // }
        // //generateTokenAndSetCookie(res, user._id);

        // if (!user.twoFactorEnabled) {
        //     return res.status(200).json({
        //         success: true,
        //         message: "Please set up 2FA",
        //         twoFactorRequired: true,
        //         userId: user._id,
        //     });
        // }

        if (user.lastLogin && now - new Date(user.lastLogin) > TEN_HOURS) {
            res.clearCookie("token");
        }
        user.lastLogin = now
        await user.save();

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
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

        const userId = req.userId;
        const user = await User.findById(userId);

        if (user) {
            user.twoFactorEnabled = false;
            user.twoFactorRequired = false;
            await user.save();
        }

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

        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No user ID provided",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                password: undefined,
                twoFactorSecret: undefined
            },
        });

    } catch (error) {
        console.error("Error with reset auth:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
}

export const verifyTwoFactorCode = async (req, res) => {
    const { userId, token } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: "2FA is not set up for this user"
            });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,

        });

        if (verified) {
            user.twoFactorEnabled = true,
                generateTokenAndSetCookie(res, user._id);
        }

        if (!verified) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired 2FA token"
            });
        }


        return res.status(200).json({
            success: true,
            message: "2FA verified successfully",

        });

    } catch (error) {
        console.error("2FA verification error:", error);
        res.status(500).json({
            success: false,
            message: "Error verifying 2FA code"
        });
    }
};

export const setupTwoFactor = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No user ID provided",
            });
        }
        const user = await User.findById(userId);

     
        let secret;

        if (user.twoFactorRequired) {
            secret = speakeasy.generateSecret({
                name: "MyApp (2FA)",
            });
        
            user.twoFactorSecret = secret.base32;
            user.twoFactorEnabled = true;
            await user.save();
        }

        if (!user.twoFactorRequired) {
            return res.status(401).json({ success: false, message: "you have to login" });
        }
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Failed to generate QR code" });
            }

            res.status(200).json({
                success: true,
                message: "2FA setup complete",
                qrCode: data_url,
                secret: secret.base32,
            });
        });
    } catch (error) {
        console.error("2FA setup error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to set up 2FA"
        });
    }
};