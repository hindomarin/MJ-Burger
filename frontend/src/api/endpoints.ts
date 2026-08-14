import { request } from "./client";
import type {
  Category,
  Dashboard,
  InventoryItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Product,
  User,
} from "../types";

// One function per thing the app can ask the backend to do.
// The components call these instead of using fetch themselves.

// ----- Login -----

export function login(username: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function getCurrentUser() {
  return request<{ user: User }>("/auth/me");
}

// ----- Menu -----

export function getCategories() {
  return request<Category[]>("/categories");
}

export function createCategory(data: { name: string; sortOrder: number }) {
  return request<Category>("/categories", { method: "POST", body: data });
}

export function updateCategory(
  id: number,
  data: { name: string; sortOrder: number },
) {
  return request<Category>(`/categories/${id}`, { method: "PUT", body: data });
}

export function deleteCategory(id: number) {
  return request<void>(`/categories/${id}`, { method: "DELETE" });
}

export type ProductInput = {
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  available: boolean;
  categoryId: number;
};

export function getProducts() {
  return request<Product[]>("/products");
}

export function createProduct(data: ProductInput) {
  return request<Product>("/products", { method: "POST", body: data });
}

export function updateProduct(id: number, data: ProductInput) {
  return request<Product>(`/products/${id}`, { method: "PUT", body: data });
}

export function deleteProduct(id: number) {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

// ----- Orders -----

export function getActiveOrders() {
  return request<Order[]>("/orders?view=active");
}

export function getOrderHistory(filters: {
  search?: string;
  date?: string;
  status?: string;
}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.date) params.set("date", filters.date);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();
  return request<Order[]>(query ? `/orders?${query}` : "/orders");
}

export type NewOrder = {
  note: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: { productId: number; quantity: number; note: string }[];
};

export function createOrder(order: NewOrder) {
  return request<Order>("/orders", { method: "POST", body: order });
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return request<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

// Used when a card payment is confirmed or retried afterwards.
export function updatePaymentStatus(id: number, paymentStatus: PaymentStatus) {
  return request<Order>(`/orders/${id}/payment`, {
    method: "PATCH",
    body: { paymentStatus },
  });
}

// ----- Inventory -----

export type InventoryInput = {
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
};

export function getInventory() {
  return request<InventoryItem[]>("/inventory");
}

export function createInventoryItem(data: InventoryInput) {
  return request<InventoryItem>("/inventory", { method: "POST", body: data });
}

export function updateInventoryItem(id: number, data: InventoryInput) {
  return request<InventoryItem>(`/inventory/${id}`, { method: "PUT", body: data });
}

export function deleteInventoryItem(id: number) {
  return request<void>(`/inventory/${id}`, { method: "DELETE" });
}

// ----- Sales -----

export function getDashboard() {
  return request<Dashboard>("/stats/dashboard");
}
