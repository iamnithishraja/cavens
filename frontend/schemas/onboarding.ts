import { use } from "react";
import z from "zod";

export const onboardingResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: z.object({
    _id: z.string(),
    phone: z.string(),
    otp: z.string().optional(),
    otpExpiry: z.string().optional(),
    role: z.string().optional(), 
  }),
});

export type OnboardingResponse = z.infer<typeof onboardingResponseSchema>;