import z from "zod";

export const LoginSchema = z.object({
  username: z
    .string("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(16, "Username must be at most 16 characters"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(32, "Password must be at most 32 characters"),
});

export type LoginForm = z.infer<typeof LoginSchema>;
