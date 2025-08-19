import z from "zod";

export const onbooardingSchema = z.object({
    phone: z.string().min(10, "Phone number must be at least 10 characters long"),
});