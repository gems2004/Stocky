import { z } from "zod";

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
  description: z.string().optional(),
});

export type UpdateCategoryForm = z.infer<typeof UpdateCategorySchema>;