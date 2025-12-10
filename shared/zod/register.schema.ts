import { z } from "zod";

export const registerZodSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(6),
  username: z.string().min(2).max(100).trim(),
});

export type RegisterTypeZodSchema = z.infer<typeof registerZodSchema>;
