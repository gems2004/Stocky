import { z } from "zod";

export const UpdateUserSchema = z.object({
  username: z
    .string("Username is required")
    .min(2, "Username must be at least 2 characters")
    .max(100, "Username must be at most 100 characters"),
  email: z
    .string("Email is required")
    .email("Invalid email address"),
  firstName: z
    .string("First name is required")
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string("Last name is required")
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  role: z.enum(["ADMIN", "CASHIER"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export type UpdateUserForm = z.infer<typeof UpdateUserSchema>;