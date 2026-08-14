import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import { useCart } from "../context/CartContext";
import { Cart } from "../components/Cart";
import { ProductCard } from "../components/ProductCard";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { Modal } from "../components/Modal";
import { formatEuro } from "../utils/money";
import type {
  Category,
  PaymentMethod,
  PaymentStatus,
  Product,
} from "../types";
import "./PosPage.css";

// The cash register screen. Left the products, right the order.

export function PosPage() {
  const { lines, orderNote, totalCents, addProduct, clearCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [placing, setPlacing] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  // Shown after "Place order" when the customer pays by card.
  const [askCardResult, setAskCardResult] = useState(false);

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

  // Cash is done at the counter, so we can save the order right away.
  // Card goes through the terminal first, so we ask the cashier what happened.
  function handlePlaceOrder() {
    setOrderError("");
    setConfirmation("");

    if (lines.length === 0) {
      setOrderError("Add at least one product first");
      return;
    }

    if (paymentMethod === null) {
      setOrderError("Choose cash or card first");
      return;
    }

    if (paymentMethod === "CARD") {
      setAskCardResult(true);
      return;
    }

    saveOrder("CASH", "PAID");
  }

  async function saveOrder(method: PaymentMethod, paymentStatus: PaymentStatus) {
    setAskCardResult(false);
    setPlacing(true);

    try {
      const order = await api.createOrder({
        note: orderNote,
        paymentMethod: method,
        paymentStatus,
        items: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
          note: line.note,
        })),
      });

      clearCart();
      setPaymentMethod(null);

      const paymentText =
        paymentStatus === "PAID"
          ? "paid"
          : paymentStatus === "FAILED"
            ? "card payment failed"
            : "waiting for payment";

      setConfirmation(`Order #${order.orderNumber} placed (${paymentText})`);
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

      <Cart
        onPlaceOrder={handlePlaceOrder}
        placing={placing}
        paymentMethod={paymentMethod}
        onChoosePayment={setPaymentMethod}
      />

      {/* There is no payment provider yet, so the cashier reads the
          card terminal and tells the system what it said. */}
      {askCardResult && (
        <Modal title="Card payment" onClose={() => setAskCardResult(false)}>
          <p className="card-amount">{formatEuro(totalCents)}</p>
          <p className="text-muted card-help">
            Check the card terminal and choose what happened.
          </p>

          <div className="card-actions">
            <button
              className="btn btn-gold"
              onClick={() => saveOrder("CARD", "PAID")}
            >
              Payment successful
            </button>
            <button className="btn" onClick={() => saveOrder("CARD", "PENDING")}>
              Confirm later
            </button>
            <button
              className="btn btn-danger"
              onClick={() => saveOrder("CARD", "FAILED")}
            >
              Payment failed
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
