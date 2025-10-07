import { z } from "zod";
import {
  Currency,
  BusinessType,
  DatabaseType,
} from "@/app/(auth)/setup/schema";

// Define form schemas
export const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
});

export const shopInfoSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  shopAddress: z.string().optional(),
  phone: z.string().optional(),
  shopEmail: z.string().email("Invalid email address").optional(),
  taxRate: z.number().min(0).max(100).optional(),
  currency: z.enum([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "SAR",
    "SYP",
    ""
  ]),
  businessType: z.enum([
    "technology",
    "food",
    "clothing",
    "general_retail",
    ""
  ]),
  website: z.string().optional(), // Not in the form but in the DTO
});

export const databaseConfigSchema = z.object({
  databaseType: z.enum(["postgres", "mysql", "sqlite", ""]),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  databaseName: z.string().min(1, "Database name is required"),
  tablePrefix: z.string().optional(),
  dbUsername: z.string().min(1, "Username is required"),
  dbPassword: z.string().optional(),
  sslEnabled: z.enum(["enabled", "disabled"]),
});
