import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
});

export type CreateCategoryForm = z.infer<typeof CreateCategorySchema>;

export type UpdateCategoryForm = z.infer<typeof UpdateCategorySchema>;
