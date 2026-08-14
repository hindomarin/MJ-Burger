import bcrypt from "bcryptjs";
import { prisma, pool } from "../src/db";

// This script fills the database with test data.
// Run it with: npm run db:seed
// It first deletes everything, so you can run it as often as you want.

// DEMO LOGINS - only for testing while building the app.
// Change these before the system is used in the real caravan.
const DEMO_USERS = [
  { username: "admin", password: "admin123", role: "ADMIN" as const },
  { username: "staff", password: "staff123", role: "STAFF" as const },
];

const CATEGORIES = [
  { name: "Burgers", sortOrder: 1 },
  { name: "Sides", sortOrder: 2 },
  { name: "Drinks", sortOrder: 3 },
  { name: "Sauces", sortOrder: 4 },
  { name: "Extras", sortOrder: 5 },
];

// Prices are in cents: 850 means EUR 8,50.
// All products use the same placeholder image for now.
const PLACEHOLDER_IMAGE = "/images/products/placeholder.svg";

type SeedProduct = {
  name: string;
  category: string;
  priceCents: number;
  description: string;
  available?: boolean; // when missing, the product is available
};

const PRODUCTS: SeedProduct[] = [
  // Burgers
  { name: "MJ Classic Burger", category: "Burgers", priceCents: 850, description: "Beef patty, lettuce, tomato, onion" },
  { name: "MJ Cheese Burger", category: "Burgers", priceCents: 950, description: "Classic burger with melted cheddar" },
  { name: "MJ Double Crown", category: "Burgers", priceCents: 1250, description: "Two beef patties, double cheese" },
  { name: "Crispy Chicken Burger", category: "Burgers", priceCents: 900, description: "Crispy chicken fillet with mayo" },
  { name: "Spicy Chili Burger", category: "Burgers", priceCents: 975, description: "Beef patty with jalapenos and chili sauce" },
  { name: "Veggie Burger", category: "Burgers", priceCents: 850, description: "Vegetarian patty with fresh salad" },

  // Sides
  { name: "Fries Small", category: "Sides", priceCents: 300, description: "" },
  { name: "Fries Large", category: "Sides", priceCents: 450, description: "" },
  { name: "Cheese Fries", category: "Sides", priceCents: 550, description: "Fries with melted cheese" },
  { name: "Onion Rings", category: "Sides", priceCents: 500, description: "" },
  { name: "Chicken Nuggets 6x", category: "Sides", priceCents: 550, description: "" },

  // Drinks
  { name: "Cola", category: "Drinks", priceCents: 250, description: "" },
  { name: "Fanta", category: "Drinks", priceCents: 250, description: "" },
  { name: "Ice Tea", category: "Drinks", priceCents: 250, description: "" },
  { name: "Water", category: "Drinks", priceCents: 200, description: "" },
  { name: "Vanilla Milkshake", category: "Drinks", priceCents: 450, description: "", available: false },

  // Sauces
  { name: "Mayonnaise", category: "Sauces", priceCents: 75, description: "" },
  { name: "Ketchup", category: "Sauces", priceCents: 75, description: "" },
  { name: "Garlic Sauce", category: "Sauces", priceCents: 100, description: "" },
  { name: "Samurai Sauce", category: "Sauces", priceCents: 100, description: "" },
  { name: "Andalouse Sauce", category: "Sauces", priceCents: 100, description: "" },

  // Extras
  { name: "Extra Cheese", category: "Extras", priceCents: 100, description: "" },
  { name: "Extra Bacon", category: "Extras", priceCents: 150, description: "" },
  { name: "Extra Patty", category: "Extras", priceCents: 350, description: "" },
  { name: "Jalapenos", category: "Extras", priceCents: 100, description: "" },
  { name: "Fried Egg", category: "Extras", priceCents: 125, description: "" },
];

const INVENTORY = [
  { name: "Burger meat", quantity: 12.5, unit: "kg", minQuantity: 5 },
  { name: "Buns", quantity: 80, unit: "pcs", minQuantity: 40 },
  { name: "Cheese slices", quantity: 35, unit: "pcs", minQuantity: 50 }, // low stock
  { name: "Fries", quantity: 20, unit: "kg", minQuantity: 8 },
  { name: "Bacon", quantity: 1.5, unit: "kg", minQuantity: 2 }, // low stock
  { name: "Cola bottles", quantity: 48, unit: "pcs", minQuantity: 24 },
  { name: "Mayonnaise", quantity: 4, unit: "L", minQuantity: 2 },
  { name: "Garlic sauce", quantity: 3, unit: "L", minQuantity: 2 },
];

// Example orders so Active Orders, Order History and the dashboard
// already have something to show. `hoursAgo` decides how old the order is.
const ORDERS = [
  {
    orderNumber: 101,
    status: "COMPLETED" as const,
    hoursAgo: 72,
    note: "",
    items: [
      { product: "MJ Classic Burger", quantity: 2 },
      { product: "Fries Large", quantity: 1 },
      { product: "Cola", quantity: 2 },
    ],
  },
  {
    orderNumber: 102,
    status: "COMPLETED" as const,
    hoursAgo: 48,
    note: "",
    items: [
      { product: "MJ Double Crown", quantity: 1 },
      { product: "Cheese Fries", quantity: 1 },
      { product: "Garlic Sauce", quantity: 1 },
    ],
  },
  {
    orderNumber: 103,
    status: "CANCELLED" as const,
    hoursAgo: 26,
    note: "Customer left",
    items: [{ product: "Crispy Chicken Burger", quantity: 1 }],
  },
  {
    orderNumber: 104,
    status: "COMPLETED" as const,
    hoursAgo: 3,
    note: "",
    items: [
      { product: "MJ Cheese Burger", quantity: 1 },
      { product: "Extra Bacon", quantity: 1 },
      { product: "Fries Small", quantity: 1 },
      { product: "Ice Tea", quantity: 1 },
    ],
  },
  {
    orderNumber: 105,
    status: "PREPARING" as const,
    hoursAgo: 1,
    note: "No onions please",
    items: [
      { product: "Spicy Chili Burger", quantity: 2 },
      { product: "Onion Rings", quantity: 1 },
    ],
  },
  {
    orderNumber: 106,
    status: "NEW" as const,
    hoursAgo: 0,
    note: "",
    items: [
      { product: "Veggie Burger", quantity: 1 },
      { product: "Samurai Sauce", quantity: 2 },
    ],
  },
];

function hoursAgoToDate(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding database...");

  // 1. Empty the tables. Order matters: rows that point to other rows go first.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.inventory.deleteMany();

  // 2. Users. The password is hashed with bcrypt, never saved as text.
  for (const user of DEMO_USERS) {
    await prisma.user.create({
      data: {
        username: user.username,
        passwordHash: await bcrypt.hash(user.password, 10),
        role: user.role,
      },
    });
  }
  console.log(`- ${DEMO_USERS.length} users`);

  // 3. Categories. We keep the new ids so the products can point to them.
  const categoryIdByName = new Map<string, number>();
  for (const category of CATEGORIES) {
    const created = await prisma.category.create({ data: category });
    categoryIdByName.set(created.name, created.id);
  }
  console.log(`- ${CATEGORIES.length} categories`);

  // 4. Products.
  for (const product of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        imageUrl: PLACEHOLDER_IMAGE,
        available: product.available ?? true,
        categoryId: categoryIdByName.get(product.category)!,
      },
    });
  }
  console.log(`- ${PRODUCTS.length} products`);

  // 5. Inventory.
  await prisma.inventory.createMany({ data: INVENTORY });
  console.log(`- ${INVENTORY.length} inventory items`);

  // 6. Example orders.
  const staff = await prisma.user.findUniqueOrThrow({ where: { username: "staff" } });
  const allProducts = await prisma.product.findMany();

  for (const order of ORDERS) {
    // Look up the real product of every line and copy its name and price.
    const lines = order.items.map((item) => {
      const product = allProducts.find((p) => p.name === item.product)!;
      return {
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
      };
    });

    // The total is calculated, never typed in by hand.
    const totalCents = lines.reduce(
      (sum, line) => sum + line.unitPriceCents * line.quantity,
      0,
    );

    const createdAt = hoursAgoToDate(order.hoursAgo);

    await prisma.order.create({
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        note: order.note,
        totalCents,
        createdAt,
        updatedAt: createdAt,
        userId: staff.id,
        items: { create: lines },
      },
    });
  }
  console.log(`- ${ORDERS.length} orders`);

  console.log("Seeding finished.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
