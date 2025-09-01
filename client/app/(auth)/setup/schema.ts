import { z } from "zod";

export enum BusinessType {
  TECHNOLOGY = "technology",
  FOOD = "food",
  CLOTHING = "clothing",
  GENERAL_RETAIL = "general_retail",
}
export enum Currency {
  USD = "USD", // US Dollar
  EUR = "EUR", // Euro
  GBP = "GBP", // British Pound
  JPY = "JPY", // Japanese Yen
  CAD = "CAD", // Canadian Dollar
  AUD = "AUD", // Australian Dollar
  SAR = "SAR", // Saudi Riyal
  SYP = "SYP", // Syrian Pound
}
export enum DatabaseType {
  POSTGRES = "postgres",
  MYSQL = "mysql",
  SQLITE = "sqlite",
}

const usernameSchema = z
  .string("Username is required")
  .min(3, "Username must be at least 3 characters")
  .max(16, "Username must be at most 16 characters");

const passwordSchema = z
  .string("Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(32, "Password must be at most 32 characters");

export const ShopInfoSchema = z.object({
  type: z.enum(BusinessType, "Business type must be selected"),
  name: z
    .string("Shop name is required")
    .min(4, "Shop name must be at least 4 characters")
    .max(32, "Shop name must be at least 4 characters"),
  address: z.string("Invalid address"),
  phone: z
    .string("Phone number must be entered")
    .regex(/^\+\d{11,15}$/, "Invalid phone number"),
  email: z.email("Invalid Email Address"),
  website: z.url("Must be a valid URL").optional().or(z.literal("")),
  currency: z.enum(Currency, "Currency must be selected"),
});

export const DatabaseConfigSchema = z.object({
  type: z.enum(DatabaseType),
  database: z
    .string("Database name is required")
    .min(3, "Database name must be at least 3 characters")
    .max(16, "Database name must be at most 16 characters"),
  host: z.string("Host is required"),
  port: z
    .string("Port is required")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535"),
  username: usernameSchema,
  password: passwordSchema,
  ssl: z.boolean().default(true),
  table_prefix: z.string().optional(),
});

export const AdminUserSchema = z.object({
  username: usernameSchema,
  email: z.email("Invalid Email Address"),
  password: passwordSchema,
  firstName: z
    .string("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(16, "First name must be at most 16 characters"),
  lastName: z.string().optional(),
});

export const SetupDataSchema = z.object({
  ...ShopInfoSchema.shape,
  ...DatabaseConfigSchema.shape,
  ...AdminUserSchema.shape,
});

export type ShopInfoForm = z.infer<typeof ShopInfoSchema>;
export type DatabaseConfigForm = z.infer<typeof DatabaseConfigSchema>;
export type AdminUserForm = z.infer<typeof AdminUserSchema>;

export type SetupDataForm = z.infer<typeof SetupDataSchema>;
