import { z } from "zod";

export const ProductSchema = z.object({
  name: z
    .string("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters"),
  description: z.string().optional(),
  price: z.number("Price is required").min(1, "Price is required"),
  cost: z.number("Cost is required").min(1, "Cost is required"),
  categoryId: z.number("Category is required").min(1, "Category is required"),
  supplierId: z.number("Supplier is required").min(1, "Supplier is required"),
  barcode: z.string().max(50, "Barcode must be at most 50 characters").optional(),
  sku: z.string().max(50, "SKU must be at most 50 characters"),
  stockQuantity: z
    .number("Stock quantity is required")
    .min(0, "Stock quantity must be at least 0"),
  minStockLevel: z
    .number("Minimum stock level is required")
    .min(1, "Minimum stock level is required"),
});

export type ProductForm = z.infer<typeof ProductSchema>;
