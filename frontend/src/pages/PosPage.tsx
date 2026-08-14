import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import { useCart } from "../context/CartContext";
import { Cart } from "../components/Cart";
import { ProductCard } from "../components/ProductCard";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import type { Category, Product } from "../types";
import "./PosPage.css";

// The cash register screen. Left the products, right the order.

export function PosPage() {
  const { lines, orderNote, addProduct, clearCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [placing, setPlacing] = useState(false);

  // Load the menu once when the screen opens.
  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts()])
      .then(([loadedCategories, loadedProducts]) => {
        setCategories(loadedCategories);
        setProducts(loadedProducts);
        setActiveCategoryId(loadedCategories[0]?.id ?? null);
      })
      .catch((caught) =>
        setLoadError(caught instanceof Error ? caught.message : "Loading failed"),
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = products.filter(
    (product) => product.categoryId === activeCategoryId,
  );

  async function handlePlaceOrder() {
    setOrderError("");
    setConfirmation("");

    if (lines.length === 0) {
      setOrderError("Add at least one product first");
      return;
    }

    setPlacing(true);
    try {
      const order = await api.createOrder({
        note: orderNote,
        items: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
          note: line.note,
        })),
      });

      clearCart();
      setConfirmation(`Order #${order.orderNumber} placed`);
    } catch (caught) {
      setOrderError(
        caught instanceof Error ? caught.message : "Could not place the order",
      );
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return <Loading text="Loading the menu..." />;
  }

  if (loadError) {
    return (
      <div className="page">
        <Message text={loadError} type="error" />
      </div>
    );
  }

  return (
    <div className="pos">
      <section className="pos-products">
        {/* Category tabs */}
        <nav className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab ${
                category.id === activeCategoryId ? "category-tab-active" : ""
              }`}
              onClick={() => setActiveCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </nav>

        {confirmation && <Message text={confirmation} type="success" />}
        {orderError && <Message text={orderError} type="error" />}

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addProduct} />
          ))}
        </div>

        {visibleProducts.length === 0 && (
          <p className="empty">No products in this category yet</p>
        )}
      </section>

      <Cart onPlaceOrder={handlePlaceOrder} placing={placing} />
    </div>
  );
}
