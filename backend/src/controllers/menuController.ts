import { Request, Response } from "express";
import { prisma } from "../db";
import { HttpError } from "../middleware/errorHandler";
import { categorySchema, parseId, productSchema } from "../validation/schemas";

// ----- Categories -----

// GET /api/categories
export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  res.json(categories);
}

// POST /api/categories
export async function createCategory(req: Request, res: Response) {
  const data = categorySchema.parse(req.body);

  const existing = await prisma.category.findUnique({ where: { name: data.name } });
  if (existing) {
    throw new HttpError(409, "There is already a category with this name");
  }

  const category = await prisma.category.create({ data });
  res.status(201).json(category);
}

// PUT /api/categories/:id
export async function updateCategory(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = categorySchema.parse(req.body);

  await findCategoryOrFail(id);

  const sameName = await prisma.category.findUnique({ where: { name: data.name } });
  if (sameName && sameName.id !== id) {
    throw new HttpError(409, "There is already a category with this name");
  }

  const category = await prisma.category.update({ where: { id }, data });
  res.json(category);
}

// DELETE /api/categories/:id
export async function deleteCategory(req: Request, res: Response) {
  const id = parseId(req.params.id);
  await findCategoryOrFail(id);

  // A category with products cannot be deleted, otherwise those
  // products would point to something that does not exist.
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) {
    throw new HttpError(
      409,
      "This category still has products. Move or delete those products first.",
    );
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
}

async function findCategoryOrFail(id: number) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }
  return category;
}

// ----- Products -----

// GET /api/products
export async function listProducts(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    orderBy: [{ categoryId: "asc" }, { name: "asc" }],
  });
  res.json(products);
}

// POST /api/products
export async function createProduct(req: Request, res: Response) {
  const data = productSchema.parse(req.body);
  await checkCategoryExists(data.categoryId);

  const product = await prisma.product.create({ data });
  res.status(201).json(product);
}

// PUT /api/products/:id
export async function updateProduct(req: Request, res: Response) {
  const id = parseId(req.params.id);
  const data = productSchema.parse(req.body);

  await findProductOrFail(id);
  await checkCategoryExists(data.categoryId);

  const product = await prisma.product.update({ where: { id }, data });
  res.json(product);
}

// DELETE /api/products/:id
export async function deleteProduct(req: Request, res: Response) {
  const id = parseId(req.params.id);
  await findProductOrFail(id);

  // Products that are used in an old order must stay, otherwise the
  // order history would break. Making them unavailable is the answer.
  const usedInOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (usedInOrders > 0) {
    throw new HttpError(
      409,
      "This product is used in existing orders. Mark it as unavailable instead of deleting it.",
    );
  }

  await prisma.product.delete({ where: { id } });
  res.status(204).send();
}

async function findProductOrFail(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new HttpError(404, "Product not found");
  }
  return product;
}

async function checkCategoryExists(categoryId: number) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new HttpError(400, "The chosen category does not exist");
  }
}
