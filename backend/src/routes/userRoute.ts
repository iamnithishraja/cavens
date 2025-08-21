import express from 'express';
import { onboarding, verifyOtp, completeProfile } from '../controllers/userController';


const userRoute = express.Router();

userRoute.post('/onboarding', onboarding);
userRoute.post('/verify-otp', verifyOtp);
userRoute.post('/completeProfile', completeProfile);

export default userRoute;