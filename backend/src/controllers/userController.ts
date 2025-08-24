import User from "../models/userModel";
import {
  onbooardingSchema,
  verifyOtpSchema,
} from "../schemas/onboardingSchema";
import { generateOTP } from "../utils/otp";
import { sendPhoneOtp } from "../utils/sms";
import type { Response, Request } from "express";
import z from "zod";
import { generateToken } from "../utils/token";
import { completeProfileSchema } from "../schemas/onboardingSchema";
import type { CustomRequest } from "../types";
import Club from "../models/clubModel";

async function onboarding(req: Request, res: Response) {
  try {
    const { phone } = onbooardingSchema.parse(req.body);
    const user = await User.findOne({ phone: phone });
    if (!user) {
      const newUser = await User.create({ phone });
      const otp = generateOTP();
      await sendPhoneOtp(phone, otp);
      await newUser.updateOne({
        otp: otp,
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      });
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
      return;
    } else {
      const otp = generateOTP();
      await sendPhoneOtp(phone, otp);
      const userId = user?._id.toString();
      if (!userId) {
        console.log("some problem with userId");
      }
      await user.updateOne({
        otp: otp,
        otpExpiry: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      });
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        user: user,
      });
      return;
    }
  } catch (error) {
    console.error("Error during onboarding:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);

    const user = await User.findOne({ phone: phone.trim() });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
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

    // Verify submitted OTP matches stored OTP
    if (user.otp !== otp) {
      res.status(400).json({ success: false, message: "Incorrect OTP" });
      return;
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isPhoneVerified = true;
    await user.save();

    const token = await generateToken(user._id.toString());

    if (!user.email || !user.name) {
      res.status(200).json({
        success: true,
        message: "OTP verified. Please complete your profile.",
        user: { _id: user._id, phone: user.phone },
        token,
        role: user.role,
        isProfileComplete: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. Logged in successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      token,
      role: user.role,
      isProfileComplete: true,
    });
    return;
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function completeProfile(req: CustomRequest, res: Response) {
  try {
    const { name, email } = completeProfileSchema.parse(req.body);
    const user = req.user;
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
      return;
    }
    await User.findByIdAndUpdate(
      user._id,
      {
        name: name,
        email: email,
      },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: name,
        email: email,
      },
    });
    return;
  } catch (error) {
    console.error("Error during profile completion:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
    return;
  }
}

export const getUserProfile = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).populate('club');
    
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user has an associated club
    let clubData = null;
    let clubStatus = null;

    if (user.club) {
      const club = await Club.findById(user.club);
      if (club) {
        const status = club.isApproved ? 'approved' : 'pending';
        clubData = {
          id: club._id,
          name: club.name,
          status: status
        };
        clubStatus = status;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isPhoneVerified: user.isPhoneVerified,
        },
        club: clubData,
        clubStatus: clubStatus
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const switchToClub = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "User not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).populate('club');
    
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Check if user has an associated club
    if (!user.club) {
      res.status(400).json({ success: false, message: "No club associated with user" });
      return;
    }

    const club = await Club.findById(user.club);
    if (!club) {
      res.status(404).json({ success: false, message: "Associated club not found" });
      return;
    }

    // Check if club is approved
    if (!club.isApproved) {
      res.status(400).json({ 
        success: false, 
        message: "Club is not yet approved by admin",
        clubStatus: 'pending'
      });
      return;
    }

    // Update user role to club
    user.role = 'club';
    await user.save();

    res.status(200).json({
      success: true,
      message: "Successfully switched to club role",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        club: {
          id: club._id,
          name: club.name,
          status: club.isApproved ? 'approved' : 'pending'
        }
      }
    });
  } catch (error) {
    console.error("Error switching to club role:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export { onboarding, verifyOtp, completeProfile };
