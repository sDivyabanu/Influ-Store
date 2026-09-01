import { z } from "zod";

export const usernameRegex = /^[a-zA-Z0-9_]+$/;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(50, "Name cannot exceed 50 characters"),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        usernameRegex,
        "Username can only contain letters, numbers, and underscores"
      )
      .toLowerCase(),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    accountType: z.enum(["CUSTOMER", "INFLUENCER"]).default("CUSTOMER"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Please enter your email or username"),
  password: z.string().min(1, "Please enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
