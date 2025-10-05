import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
  description: z.string().optional(),
});

export type CreateCategoryForm = z.infer<typeof CreateCategorySchema>;
