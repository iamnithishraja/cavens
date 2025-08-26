import express from 'express';
import { onboarding, verifyOtp, completeProfile, getUserProfile, switchToClub, getNearbyEvents } from '../controllers/userController';
import { isAuthenticated, isProfileCompleted } from '../middleware/auth';

const userRoute = express.Router();

userRoute.post('/onboarding', onboarding);
userRoute.post('/verify-otp', verifyOtp);
userRoute.post('/completeProfile', isAuthenticated ,completeProfile);
userRoute.get('/profile', isAuthenticated, isProfileCompleted, getUserProfile);
userRoute.post('/switch-to-club', isAuthenticated, isProfileCompleted, switchToClub);
userRoute.get('/getAllEvents', isAuthenticated, isProfileCompleted, getNearbyEvents);

export default userRoute;