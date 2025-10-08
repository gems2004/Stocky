import { z } from "zod";

export const CreateSupplierSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
  contact_person: z.string().min(1, { message: "Contact person is required" }).max(255),
  phone: z.string().min(1, { message: "Phone is required" }).max(20),
  email: z.string().email({ message: "Please enter a valid email" }).max(255),
  address: z.string().min(1, { message: "Address is required" }).max(500),
});

export const UpdateSupplierSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(255),
  contact_person: z.string().min(1, { message: "Contact person is required" }).max(255),
  phone: z.string().min(1, { message: "Phone is required" }).max(20),
  email: z.string().email({ message: "Please enter a valid email" }).max(255),
  address: z.string().min(1, { message: "Address is required" }).max(500),
});

export type CreateSupplierForm = z.infer<typeof CreateSupplierSchema>;

export type UpdateSupplierForm = z.infer<typeof UpdateSupplierSchema>;