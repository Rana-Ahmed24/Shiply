import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const loginSchema = z.object({
  email,
  password,
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  email,
  password,
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  preferredMode: z.enum(["customer", "traveler"], {
    message: "Choose how you want to start on Shiply",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
