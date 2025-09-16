import { Router } from "express";
import { updateFCMToken, getFCMTokenStatus } from "../controllers/notificationController.js";
import { isAuthenticated } from "../middleware/auth.js";

const notificationRoute = Router();

// All notification routes require authentication
notificationRoute.use(isAuthenticated);

// FCM Token Management
notificationRoute.post("/fcm-token", updateFCMToken);
notificationRoute.get("/fcm-token/status", getFCMTokenStatus);

export default notificationRoute;
