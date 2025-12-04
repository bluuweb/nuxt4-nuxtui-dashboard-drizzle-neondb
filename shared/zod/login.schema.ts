import { z } from "zod";

export const loginZodSchema = z.object({
  email: z.email("Invalid email"),
  password: z
    .string("Password is required")
    .min(6, "Must be at least 6 characters"),
});

export type LoginTypeZodSchema = z.output<typeof loginZodSchema>;
