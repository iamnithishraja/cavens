import express from 'express';
import { onboarding, verifyOtp } from '../controllers/userController';

const userRoute = express.Router();

userRoute.post('/oboarding', onboarding);
userRoute.post('/verify-otp', verifyOtp);

export default userRoute;