import User from "../models/userModel";
import { onbooardingSchema } from "../schemas/onboardingSchema";
import { generateOTP } from "../utils/otp";
import { sendSMS } from "../utils/sms";
import type { Response, Request } from "express";
import { generateToken } from "../utils/token";
import z from "zod";

async function onboarding(req: Request, res: Response) {
  const { phone } = onbooardingSchema.parse(req.body);
  try {
    const user = await User.findOne({ phone: phone });
    if (!user) {
      const newUser = await User.create({ phone });
      const otp = generateOTP();
      await sendSMS(
        phone,
        `Welcome to Cavens! Your account has been created successfully and your otp is ${otp}`
      );
      await newUser.updateOne({
        otp: otp,
        otpExpires: new Date(Date.now() + 15 * 60 * 1000), // OTP valid for 15 minutes
      }); 
       res.status(201).json({
        success: true,
        message: "User created successfully",
        user: newUser,
      });
      return;
    } else {
      const otp = generateOTP();
      await sendSMS(phone, `Welcome back to Cavens! Your OTP is ${otp}`);
      const userId = user?._id.toString();
      if (!userId) {
        console.log("some problem with userId");
      }
      const token = generateToken(userId);
      await user.updateOne({
        otp: otp,
        otpExpires: new Date(Date.now() + 15 * 60 * 1000),
      }); // OTP valid for 15 minutes
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        user: {
          _id: user._id,
          phone: user.phone,
          token: token,
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

export { onboarding };
