import type { Request, Response } from "express";
import { notificationService } from "../utils/notificationService.js";
import type { CustomRequest } from "../types/index.js";
import z from "zod";

// Schema for FCM token update
const updateFCMTokenSchema = z.object({
  fcmToken: z.string().min(1, "FCM token is required"),
});

/**
 * Update user's FCM token
 */
export const updateFCMToken = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const { fcmToken } = updateFCMTokenSchema.parse(req.body);

    const result = await notificationService.updateUserFCMToken(req.user._id.toString(), fcmToken);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "FCM token updated successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error || "Failed to update FCM token",
      });
    }
  } catch (error) {
    console.error("Error updating FCM token:", error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors: error.issues,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user's current FCM token status
 */
export const getFCMTokenStatus = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const user = req.user;
    const hasToken = !!user.fcmToken;

    res.status(200).json({
      success: true,
      data: {
        hasFCMToken: hasToken,
        fcmTokenSet: hasToken,
      },
    });
  } catch (error) {
    console.error("Error getting FCM token status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

