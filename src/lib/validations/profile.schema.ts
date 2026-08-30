import { z } from "zod";
import { usernameRegex } from "./auth.schema";

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
      usernameRegex,
      "Username can only contain letters, numbers, and underscores"
    )
    .toLowerCase(),
  bio: z
    .string()
    .trim()
    .max(160, "Bio cannot exceed 160 characters")
    .optional()
    .nullable(),
  website: z
    .string()
    .trim()
    .max(100, "Website URL cannot exceed 100 characters")
    .refine(
      (val) => {
        if (!val || val === "") return true;
        try {
          const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Please enter a valid website URL" }
    )
    .optional()
    .nullable(),
  avatarUrl: z
    .string()
    .trim()
    .url("Please provide a valid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
