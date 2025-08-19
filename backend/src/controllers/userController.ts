import User from "../models/userModel";
import { onbooardingSchema, verifyOtpSchema } from "../schemas/onboardingSchema";
import { generateOTP } from "../utils/otp";
import { sendPhoneOtp  } from "../utils/sms";
import type { Response, Request } from "express";
import z from "zod";
import { generateToken } from "../utils/token";

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
        user: {
          _id: user._id,
          phone: user.phone,
        },
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

    // Find user by phone + OTP
    const user = await User.findOne({ phone, otp });
    if (!user) {
       res.status(400).json({
        success: false,
        message: "Invalid OTP or phone number",
      });
      return;
    }

    // Check OTP expiry
    if (user.otpExpiry && user.otpExpiry < new Date()) {
       res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
      return;
    }

    // Clear OTP
    await user.updateOne({ otp: null, otpExpiry: null, isPhoneVerified: true });

    // Generate JWT token
    const token = await generateToken(user._id.toString());

    // Check if user has email/name to distinguish registration vs login
    if (!user.email || !user.name) {
      // First-time user, needs to complete profile
       res.status(200).json({
        success: true,
        message: "OTP verified. Please complete your profile by adding name and email.",
        user: {
          _id: user._id,
          phone: user.phone,
        },
        token,
        isProfileComplete: false,
      });
      return;
    } else {
      // Existing user, login
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
        isProfileComplete: true,
      });
      return;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
       res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    console.error("Error during OTP verification:", error);
     res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}


export { onboarding, verifyOtp };
