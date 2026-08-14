import { Request, Response } from "express";
import { prisma } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { inventorySchema, parseId } from "../validation/schemas";

// GET /api/inventory
export async function listInventory(_req: Request, res: Response) {
  const items = await prisma.inventory.findMany({ orderBy: { name: "asc" } });
  res.json(items);
}

// POST /api/inventory
export async function createInventoryItem(req: Request, res: Response) {
  const data = inventorySchema.parse(req.body);

  const existing = await prisma.inventory.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new HttpError(409, "There is already an item with this name");
  }

  const item = await prisma.inventory.create({ data });
  res.status(201).json(item);
}

// PUT /api/inventory/:id
export async function updateInventoryItem(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = inventorySchema.parse(req.body);

  const item = await prisma.inventory.findUnique({ where: { id } });
  if (!item) {
    throw new HttpError(404, "Inventory item not found");
  }

  const sameName = await prisma.inventory.findUnique({ where: { name: data.name } });
  if (sameName && sameName.id !== id) {
    throw new HttpError(409, "There is already an item with this name");
  }

  const updated = await prisma.inventory.update({ where: { id }, data });
  res.json(updated);
}

// DELETE /api/inventory/:id
export async function deleteInventoryItem(req: Request, res: Response) {
  const id = parseId(req.params.id);

  const item = await prisma.inventory.findUnique({ where: { id } });
  if (!item) {
    throw new HttpError(404, "Inventory item not found");
  }

  await prisma.inventory.delete({ where: { id } });
  res.status(204).send();
}
