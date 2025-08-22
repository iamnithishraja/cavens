import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";
import { listPendingClubs, approveClub, rejectClub, adminOnboarding, adminVerifyOtp } from "../controllers/adminController";

const adminRoute = express.Router();

// Public admin auth endpoints (role checked in controllers)
adminRoute.post("/auth/onboarding", adminOnboarding);
adminRoute.post("/auth/verify-otp", adminVerifyOtp);

// Protected admin routes
adminRoute.use(isAuthenticated, isAdmin);

// Clubs management
adminRoute.get("/clubs/pending", listPendingClubs);
adminRoute.post("/clubs/:id/approve", approveClub);
adminRoute.post("/clubs/:id/reject", rejectClub);

export default adminRoute;


