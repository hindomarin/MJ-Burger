import { z } from "zod";

// All rules for data coming from the frontend live here.
// The frontend also checks its forms, but the backend must check again,
// because anybody can send a request straight to the API.

// `error` is shown when the field is missing or has the wrong type,
// `min`/`max` when the value itself is not allowed.
export const loginSchema = z.object({
  username: z
    .string({ error: "Please fill in a username" })
    .trim()
    .min(1, "Please fill in a username"),
  password: z
    .string({ error: "Please fill in a password" })
    .min(1, "Please fill in a password"),
});

export const categorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(1, "Category name is required")
    .max(30, "Category name is too long"),
  sortOrder: z.number().int().min(0).default(0),
});

export const productSchema = z.object({
  name: z
    .string({ error: "Product name is required" })
    .trim()
    .min(1, "Product name is required")
    .max(60, "Product name is too long"),
  description: z.string().trim().max(200).default(""),
  priceCents: z
    .number({ error: "Please fill in a price" })
    .int("Price must be a whole number of cents")
    .min(1, "Price must be higher than 0"),
  imageUrl: z.string().trim().max(300).default(""),
  available: z.boolean().default(true),
  categoryId: z.number().int().positive("Please choose a category"),
});

export const orderSchema = z.object({
  note: z.string().trim().max(200).default(""),
  // The cashier must always choose how the customer pays.
  paymentMethod: z.enum(["CASH", "CARD"], {
    message: "Please choose cash or card",
  }),
  paymentStatus: z
    .enum(["PAID", "PENDING", "FAILED"], { message: "Unknown payment status" })
    .default("PENDING"),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1")
          .max(99, "Quantity is too high"),
        note: z.string().trim().max(100).default(""),
      }),
    )
    .min(1, "An order must contain at least one product"),
});

export const orderStatusSchema = z.object({
  status: z.enum(["NEW", "PREPARING", "READY", "COMPLETED", "CANCELLED"], {
    message: "Unknown order status",
  }),
});

export const paymentStatusSchema = z.object({
  paymentStatus: z.enum(["PAID", "PENDING", "FAILED"], {
    message: "Unknown payment status",
  }),
});

export const inventorySchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(40, "Name is too long"),
  quantity: z
    .number({ error: "Please fill in a quantity" })
    .min(0, "Quantity cannot be negative"),
  unit: z
    .string({ error: "Unit is required" })
    .trim()
    .min(1, "Unit is required")
    .max(10, "Unit is too long"),
  minQuantity: z
    .number({ error: "Please fill in a minimum stock level" })
    .min(0, "Minimum stock cannot be negative"),
});

// Reads an id from the address bar and makes sure it is a number.
export function parseId(value: unknown) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new z.ZodError([
      { code: "custom", message: "Invalid id", path: ["id"], input: value },
    ]);
  }
  return id;
}
