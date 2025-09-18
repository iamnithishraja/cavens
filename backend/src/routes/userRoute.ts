import express from 'express';
import { onboarding, verifyOtp, completeProfile, getUserProfile, switchToClub, getNearbyEvents, getPublicEventDetails, purchaseTicket , getBookings, updateCityLocation} from '../controllers/userController';
import { isAuthenticated, isProfileCompleted } from '../middleware/auth';

const userRoute = express.Router();

userRoute.post('/onboarding', onboarding);
userRoute.post('/verify-otp', verifyOtp);
userRoute.post('/completeProfile', isAuthenticated ,completeProfile);
userRoute.get('/profile', isAuthenticated, isProfileCompleted, getUserProfile);
userRoute.post('/switch-to-club', isAuthenticated, isProfileCompleted, switchToClub);
userRoute.get('/getAllEvents', isAuthenticated, isProfileCompleted, getNearbyEvents);

// Public route for users to get event details by eventId
userRoute.get('/event/:eventId', isAuthenticated, isProfileCompleted, getPublicEventDetails);

// Route for users to purchase tickets
userRoute.post('/purchase-ticket', isAuthenticated, isProfileCompleted, purchaseTicket);

userRoute.get('/bookings/:status', isAuthenticated, isProfileCompleted, getBookings);

// Route for geofencing city updates
userRoute.post('/city-update', isAuthenticated, updateCityLocation);

export default userRoute;