import z from "zod";

export const onbooardingSchema = z.object({
    phone: z.string().min(10, "Phone number must be at least 10 characters long"),
});
export const verifyOtpSchema = z.object({
    phone: z.string().min(10, "Phone number must be at least 10 characters long"),
    otp: z.string().length(4, "OTP must be exactly 4 characters long"),
});