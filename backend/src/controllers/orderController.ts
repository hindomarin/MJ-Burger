import { Request, Response } from "express";
import { prisma } from "../db";
import { HttpError } from "../middleware/errorHandler";
import {
  orderSchema,
  orderStatusSchema,
  parseId,
  paymentStatusSchema,
} from "../validation/schemas";

// Orders with these statuses are still busy and belong on the Active Orders screen.
const ACTIVE_STATUSES = ["NEW", "PREPARING", "READY"] as const;

// Always send the order together with its lines.
const withItems = { items: true };

// GET /api/orders
// ?view=active            -> only orders that are still busy
// ?status=COMPLETED       -> filter history by status
// ?date=2026-08-14        -> filter history by day
// ?search=104 or "burger" -> search by order number or product name
export async function listOrders(req: Request, res: Response) {
  const view = String(req.query.view ?? "");
  const status = String(req.query.status ?? "");
  const date = String(req.query.date ?? "");
  const search = String(req.query.search ?? "").trim();

  const filters: Record<string, unknown>[] = [];

  if (view === "active") {
    filters.push({ status: { in: ACTIVE_STATUSES } });
  } else if (status) {
    filters.push({ status });
  }

  if (date) {
    const dayStart = new Date(`${date}T00:00:00`);
    if (!Number.isNaN(dayStart.getTime())) {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filters.push({ createdAt: { gte: dayStart, lt: dayEnd } });
    }
  }

  if (search) {
    const searchAsNumber = Number(search);
    if (Number.isInteger(searchAsNumber)) {
      filters.push({ orderNumber: searchAsNumber });
    } else {
      filters.push({
        items: { some: { productName: { contains: search, mode: "insensitive" } } },
      });
    }
  }

  const orders = await prisma.order.findMany({
    where: filters.length > 0 ? { AND: filters } : {},
    include: withItems,
    // Active orders: oldest first, so the longest waiting customer is on top.
    // History: newest first.
    orderBy: { createdAt: view === "active" ? "asc" : "desc" },
    take: view === "active" ? undefined : 100,
  });

  res.json(orders);
}

// GET /api/orders/:id
export async function getOrder(req: Request, res: Response) {
  const id = parseId(req.params.id);

  const order = await prisma.order.findUnique({ where: { id }, include: withItems });
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  res.json(order);
}

// POST /api/orders
export async function createOrder(req: Request, res: Response) {
  const data = orderSchema.parse(req.body);
  const userId = req.user!.id;

  // Everything happens in one transaction: either the whole order is
  // saved, or nothing at all. This also prevents two orders getting
  // the same order number.
  const order = await prisma.$transaction(async (tx) => {
    const productIds = data.items.map((item) => item.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });

    const lines = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new HttpError(400, "One of the products no longer exists");
      }
      if (!product.available) {
        throw new HttpError(400, `${product.name} is not available right now`);
      }

      // We copy the name and price into the order line. The prices come
      // from the database, never from the frontend.
      return {
        productId: product.id,
        productName: product.name,
        unitPriceCents: product.priceCents,
        quantity: item.quantity,
        note: item.note,
      };
    });

    const totalCents = lines.reduce(
      (sum, line) => sum + line.unitPriceCents * line.quantity,
      0,
    );

    // The customer facing number starts at 101 and counts up.
    const lastOrder = await tx.order.findFirst({
      orderBy: { orderNumber: "desc" },
      select: { orderNumber: true },
    });
    const orderNumber = lastOrder ? lastOrder.orderNumber + 1 : 101;

    return tx.order.create({
      data: {
        orderNumber,
        totalCents,
        note: data.note,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        userId,
        items: { create: lines },
      },
      include: withItems,
    });
  });

  res.status(201).json(order);
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const { status } = orderStatusSchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  // A finished or cancelled order stays as it is, so the history is reliable.
  if (order.status === "COMPLETED" || order.status === "CANCELLED") {
    throw new HttpError(409, "This order is already finished and cannot be changed");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
    include: withItems,
  });

  res.json(updated);
}

// PATCH /api/orders/:id/payment
// Used when a card payment is confirmed afterwards, or when a failed
// payment is tried again. There is no payment provider yet: the cashier
// looks at the card terminal and tells the system what happened.
export async function updatePaymentStatus(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const { paymentStatus } = paymentStatusSchema.parse(req.body);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  if (order.status === "CANCELLED") {
    throw new HttpError(409, "This order was cancelled");
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { paymentStatus },
    include: withItems,
  });

  res.json(updated);
}
