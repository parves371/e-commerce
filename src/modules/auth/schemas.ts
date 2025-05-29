import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z
    .string()
    .min(3, "username must be a least 3 characters")
    .max(63, "username must be less than 63 characters ")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "username must start and end with a lowercase letter or number, and can only contain lowercase letters or numbers"
    )
    .refine(
      (val) => !val.includes("--"),
      "username cannot contain consecutive dashes"
    )
    .transform((val) => val.toLowerCase()),
});
