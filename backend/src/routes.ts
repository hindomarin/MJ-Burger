import { Router } from "express";
import { requireAdmin, requireLogin } from "./middleware/auth";
import * as auth from "./controllers/authController";
import * as menu from "./controllers/menuController";
import * as orders from "./controllers/orderController";
import * as inventory from "./controllers/inventoryController";
import * as stats from "./controllers/statsController";

// Every address of the API in one place, so you can see the whole
// API at a glance. requireLogin = must be logged in,
// requireAdmin = must be an admin as well.
const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "MJ Juicy Burger API is running" });
});

// Login
router.post("/auth/login", auth.login);
router.get("/auth/me", requireLogin, auth.me);

// Menu - everyone who is logged in may look, only an admin may change.
router.get("/categories", requireLogin, menu.listCategories);
router.post("/categories", requireLogin, requireAdmin, menu.createCategory);
router.put("/categories/:id", requireLogin, requireAdmin, menu.updateCategory);
router.delete("/categories/:id", requireLogin, requireAdmin, menu.deleteCategory);

router.get("/products", requireLogin, menu.listProducts);
router.post("/products", requireLogin, requireAdmin, menu.createProduct);
router.put("/products/:id", requireLogin, requireAdmin, menu.updateProduct);
router.delete("/products/:id", requireLogin, requireAdmin, menu.deleteProduct);

// Orders - staff needs these every day.
router.get("/orders", requireLogin, orders.listOrders);
router.get("/orders/:id", requireLogin, orders.getOrder);
router.post("/orders", requireLogin, orders.createOrder);
router.patch("/orders/:id/status", requireLogin, orders.updateOrderStatus);

// Inventory and sales figures - admin only.
router.get("/inventory", requireLogin, requireAdmin, inventory.listInventory);
router.post("/inventory", requireLogin, requireAdmin, inventory.createInventoryItem);
router.put("/inventory/:id", requireLogin, requireAdmin, inventory.updateInventoryItem);
router.delete("/inventory/:id", requireLogin, requireAdmin, inventory.deleteInventoryItem);

router.get("/stats/dashboard", requireLogin, requireAdmin, stats.getDashboard);

export default router;
