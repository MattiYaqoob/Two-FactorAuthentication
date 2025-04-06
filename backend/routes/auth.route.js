import express from "express"
import { login, signup, logout, verifyEmail, frogotPassword, resetPassword } from '../controllers/auth.controller.js';


const router = express.Router();

router.post("/signup", signup)

router.post("/login", login)

router.post("/logout", logout)

router.post("/verify-email", verifyEmail)

router.post("/frogot-password", frogotPassword)

router.post("/reset-password/:token", resetPassword)



export default router;