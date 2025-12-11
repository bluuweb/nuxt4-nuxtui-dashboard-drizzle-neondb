import { z } from "zod";

export const registerZodSchema = z
  .object({
    email: z.email("Email is required").trim().toLowerCase(),
    username: z
      .string("Username is required")
      .min(2, "Username must be at least 2 characters long")
      .max(100, "Username must be at most 100 characters long")
      .trim(),
    password: z
      .string("Password is required")
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be at most 100 characters long"),
    confirmPassword: z.string("Confirm Password is required").min(6).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterTypeZodSchema = z.infer<typeof registerZodSchema>;
