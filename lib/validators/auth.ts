import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password can be at most 72 characters"),
  businessName: z.string().trim().min(1, "Business name is required").max(120, "Business name can be at most 120 characters"),
  businessType: z.string().max(40).optional(),
  fullName: z.string().trim().max(120, "Name can be at most 120 characters").optional(),
  acceptTerms: z.literal("yes", { error: "Please agree to the Terms of Service and Privacy Policy to create an account" }),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1, "Password is required"),
});
