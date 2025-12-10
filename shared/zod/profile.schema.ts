import { z } from "zod";

export const profileZodSchema = z.object({
  name: z.preprocess((val) => {
    if (typeof val === "string") {
      const t = val.trim();
      return t === "" ? undefined : t;
    }
    return val;
  }, z.string().min(2, "Too short").optional()),
  email: z.email("Invalid email").trim().toLowerCase(),
  username: z.string().min(2, "Too short"),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

export type ProfileTypeZodSchema = z.output<typeof profileZodSchema>;
