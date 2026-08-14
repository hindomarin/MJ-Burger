// The shapes of the data that the backend sends us.
// These match the tables in prisma/schema.prisma.

export type Role = "ADMIN" | "STAFF";

export type OrderStatus =
  | "NEW"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type User = {
  id: number;
  username: string;
  role: Role;
};

export type Category = {
  id: number;
  name: string;
  sortOrder: number;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  available: boolean;
  categoryId: number;
};

export type OrderItem = {
  id: number;
  quantity: number;
  productName: string;
  unitPriceCents: number;
  note: string;
  orderId: number;
  productId: number;
};

export type Order = {
  id: number;
  orderNumber: number;
  status: OrderStatus;
  totalCents: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  items: OrderItem[];
};

export type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
};

export type Dashboard = {
  todayTotalCents: number;
  todayOrderCount: number;
  averageOrderCents: number;
  bestSellers: { productName: string; quantity: number }[];
  last7Days: { date: string; totalCents: number; orders: number }[];
};

// One line in the shopping cart on the POS screen.
export type CartLine = {
  product: Product;
  quantity: number;
  note: string;
};
