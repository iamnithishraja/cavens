import express from 'express';
import { onboarding, verifyOtp, completeProfile } from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

const userRoute = express.Router();

userRoute.post('/onboarding', onboarding);
userRoute.post('/verify-otp', verifyOtp);
userRoute.post('/completeProfile', isAuthenticated ,completeProfile);

export default userRoute;