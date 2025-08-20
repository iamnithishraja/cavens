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
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (!user.otp ) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpiry && user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isPhoneVerified = true;
    await user.save();

    const token = await generateToken(user._id.toString());

    if (!user.email || !user.name) {
      return res.status(200).json({
        success: true,
        message: "OTP verified. Please complete your profile.",
        user: { _id: user._id, phone: user.phone },
        token,
        isProfileComplete: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP verified. Logged in successfully.",
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone },
      token,
      isProfileComplete: true,
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export { onboarding, verifyOtp };
