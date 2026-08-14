import { Request, Response } from "express";
import { prisma } from "../db";

// Cancelled orders should not count as sales.
const SOLD = { status: { not: "CANCELLED" as const } };

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10); // "2026-08-14"
}

// GET /api/stats/dashboard
export async function getDashboard(_req: Request, res: Response) {
  const today = startOfToday();

  // 1. Today: how much did we sell and how many orders were there?
  const todayOrders = await prisma.order.findMany({
    where: { ...SOLD, createdAt: { gte: today } },
    select: { totalCents: true },
  });

  const todayTotalCents = todayOrders.reduce((sum, o) => sum + o.totalCents, 0);
  const todayOrderCount = todayOrders.length;
  const averageOrderCents =
    todayOrderCount > 0 ? Math.round(todayTotalCents / todayOrderCount) : 0;

  // 2. Best selling products, counted over all orders.
  const bestSellers = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // 3. Sales per day for the last 7 days (today included).
  const weekStart = startOfToday();
  weekStart.setDate(weekStart.getDate() - 6);

  const weekOrders = await prisma.order.findMany({
    where: { ...SOLD, createdAt: { gte: weekStart } },
    select: { totalCents: true, createdAt: true },
  });

  // Start with 7 empty days, then add every order to the right day.
  const days: { date: string; totalCents: number; orders: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push({ date: toDateKey(day), totalCents: 0, orders: 0 });
  }

  for (const order of weekOrders) {
    const day = days.find((d) => d.date === toDateKey(order.createdAt));
    if (day) {
      day.totalCents += order.totalCents;
      day.orders += 1;
    }
  }

  res.json({
    todayTotalCents,
    todayOrderCount,
    averageOrderCents,
    bestSellers: bestSellers.map((item) => ({
      productName: item.productName,
      quantity: item._sum.quantity ?? 0,
    })),
    last7Days: days,
  });
}
