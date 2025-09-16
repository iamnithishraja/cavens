import type { Request, Response } from "express";
import z from "zod";
import Club from "../models/clubModel";
import User from "../models/userModel";
import { generateOTP } from "../utils/otp";
import { sendPhoneOtp } from "../utils/sms";
import { generateToken } from "../utils/token";
import { notificationService } from "../utils/notificationService";

export async function listPendingClubs(req: Request, res: Response) {
  try {
    const { page = "1", limit = "20", search = "", status = "pending", type = "", city = "" } = req.query as Record<string, string>;
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 20, 1);

    const filter: any = {};
    if (status === 'approved') filter.isApproved = true;
    else if (status === 'pending') filter.isApproved = false;
    if (type) filter.typeOfVenue = type;
    if (city) filter.city = city;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Club.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Club.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, items, total, page: pageNum, limit: pageSize });
  } catch (error) {
    console.error("Error listing clubs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function approveClub(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Club id is required" });
      return;
    }
    const updated = await Club.findByIdAndUpdate(
      id,
      { isApproved: true, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ success: false, message: "Club not found" });
      return;
    }

    // Also update the associated user's role to 'club'. Prefer explicit owner on club
    const owner = updated.owner
      ? await User.findById(updated.owner)
      : await User.findOne({ club: updated._id });
    if (owner && owner.role !== 'club') {
      owner.role = 'club';
      owner.club = updated._id;
      await owner.save();
    }

    // Send push notification to club owner about approval
    try {
      if (owner) {
        const notificationResult = await notificationService.sendClubApprovalNotification(
          updated._id.toString(),
          'approved'
        );
        
        if (notificationResult.success) {
          console.log(`✅ Club approval notification sent successfully to user ${owner._id}`);
        } else {
          console.warn(`⚠️ Failed to send club approval notification: ${notificationResult.error}`);
        }
      } else {
        console.warn(`⚠️ No club owner found for club ${updated._id}, skipping notification`);
      }
    } catch (notificationError) {
      console.error("❌ Error sending club approval notification:", notificationError);
      // Don't fail the approval process if notification fails
    }

    res.status(200).json({ 
      success: true, 
      club: updated, 
      userUpdated: owner ? owner._id : null,
      notificationSent: true
    });
  } catch (error) {
    console.error("Error approving club:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function rejectClub(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ success: false, message: "Club id is required" });
      return;
    }
    const updated = await Club.findByIdAndUpdate(
      id,
      { isApproved: false, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ success: false, message: "Club not found" });
      return;
    }
    // Send push notification to club owner about rejection
    try {
      if (updated.owner) {
        const notificationResult = await notificationService.sendClubApprovalNotification(
          updated._id.toString(),
          'rejected'
        );
        
        if (notificationResult.success) {
          console.log(`✅ Club rejection notification sent successfully to user ${updated.owner}`);
        } else {
          console.warn(`⚠️ Failed to send club rejection notification: ${notificationResult.error}`);
        }
      } else {
        console.warn(`⚠️ No club owner found for club ${updated._id}, skipping notification`);
      }
    } catch (notificationError) {
      console.error("❌ Error sending club rejection notification:", notificationError);
      // Don't fail the rejection process if notification fails
    }

    res.status(200).json({ 
      success: true, 
      club: updated,
      notificationSent: true
    });
  } catch (error) {
    console.error("Error rejecting club:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Admin auth schemas
const adminOnboardingSchema = z.object({
  dialCode: z.string().min(1),
  phone: z.string().min(5),
});

const adminVerifySchema = adminOnboardingSchema.extend({
  otp: z.string().length(4),
});

// Admin auth: onboarding with role check
export async function adminOnboarding(req: Request, res: Response) {
  try {
    const { dialCode, phone } = adminOnboardingSchema.parse(req.body);
    const normalizedPhone = `${dialCode}${phone}`;

    const user = await User.findOne({
      phone: { $in: [normalizedPhone, phone] },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        message: "Please register in the Cavens app first.",
        redirectUrl: "https://cavens.app/register?ref=admin",
      });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin only can access" });
      return;
    }

    const otp = generateOTP();
    // store OTP and expiry on user
    await user.updateOne({
      otp,
      otpExpiry: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Send OTP to normalized phone (with country code)
    await sendPhoneOtp(normalizedPhone, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return;
    }
    console.error("Admin onboarding error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Admin auth: verify OTP with role check
export async function adminVerifyOtp(req: Request, res: Response) {
  try {
    const { dialCode, phone, otp } = adminVerifySchema.parse(req.body);
    const normalizedPhone = `${dialCode}${phone}`;

    const user = await User.findOne({
      phone: { $in: [normalizedPhone, phone] },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role !== "admin") {
      res.status(403).json({ success: false, message: "Admin only can access" });
      return;
    }

    if (!user.otp) {
      res.status(400).json({ success: false, message: "Invalid OTP" });
      return;
    }
    if (user.otpExpiry && user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: "OTP expired" });
      return;
    }
    if (user.otp !== otp) {
      res.status(400).json({ success: false, message: "Incorrect OTP" });
      return;
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken(user._id.toString());
    res.status(200).json({
      success: true,
      message: "OTP verified",
      token,
      role: user.role,
      user: { _id: user._id, phone: user.phone, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Invalid input" });
      return;
    }
    console.error("Admin verify error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


