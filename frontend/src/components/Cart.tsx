import { useCart } from "../context/CartContext";
import { formatEuro } from "../utils/money";
import type { PaymentMethod } from "../types";

// The order that is being put together, on the right side of the POS.

type Props = {
  onPlaceOrder: () => void;
  placing: boolean;
  paymentMethod: PaymentMethod | null;
  onChoosePayment: (method: PaymentMethod) => void;
};

export function Cart({
  onPlaceOrder,
  placing,
  paymentMethod,
  onChoosePayment,
}: Props) {
  const {
    lines,
    orderNote,
    totalCents,
    itemCount,
    increase,
    decrease,
    removeLine,
    setLineNote,
    setOrderNote,
    clearCart,
  } = useCart();

  const isEmpty = lines.length === 0;

  return (
    <aside className="cart">
      <div className="cart-head">
        <h2>Order</h2>
        {!isEmpty && (
          <button className="btn btn-small" onClick={clearCart}>
            Clear
          </button>
        )}
      </div>

      <div className="cart-lines">
        {isEmpty ? (
          <p className="cart-empty">Tap a product to start an order</p>
        ) : (
          lines.map((line) => (
            <div className="cart-line" key={line.product.id}>
              <div className="cart-line-top">
                <span className="cart-line-name">{line.product.name}</span>
                <span className="cart-line-price">
                  {formatEuro(line.product.priceCents * line.quantity)}
                </span>
              </div>

              <div className="cart-line-controls">
                <button
                  className="qty-btn"
                  onClick={() => decrease(line.product.id)}
                  aria-label={`One less ${line.product.name}`}
                >
                  −
                </button>
                <span className="qty-value">{line.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => increase(line.product.id)}
                  aria-label={`One more ${line.product.name}`}
                >
                  +
                </button>

                <input
                  className="cart-line-note"
                  placeholder="Note (optional)"
                  value={line.note}
                  onChange={(event) =>
                    setLineNote(line.product.id, event.target.value)
                  }
                />

                <button
                  className="qty-btn remove-btn"
                  onClick={() => removeLine(line.product.id)}
                  aria-label={`Remove ${line.product.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-bottom">
        <input
          className="order-note"
          placeholder="Note for the whole order (optional)"
          value={orderNote}
          onChange={(event) => setOrderNote(event.target.value)}
        />

        <div className="cart-totals">
          <div className="cart-total-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatEuro(totalCents)}</span>
          </div>
          <div className="cart-total-row cart-total-final">
            <span>Total</span>
            <span>{formatEuro(totalCents)}</span>
          </div>
        </div>

        {/* The cashier must pick cash or card before the order can be sent. */}
        <div className="payment-choice">
          <span className="payment-label">Payment</span>
          <div className="payment-buttons">
            <button
              className={`btn payment-btn ${
                paymentMethod === "CASH" ? "payment-btn-active" : ""
              }`}
              onClick={() => onChoosePayment("CASH")}
              aria-pressed={paymentMethod === "CASH"}
            >
              Cash
            </button>
            <button
              className={`btn payment-btn ${
                paymentMethod === "CARD" ? "payment-btn-active" : ""
              }`}
              onClick={() => onChoosePayment("CARD")}
              aria-pressed={paymentMethod === "CARD"}
            >
              Card
            </button>
          </div>
        </div>

        {/* An empty order or a missing payment method cannot be sent.
            The backend refuses both as well. */}
        <button
          className="btn btn-gold place-order-btn"
          onClick={onPlaceOrder}
          disabled={isEmpty || placing || paymentMethod === null}
        >
          {placing
            ? "Placing..."
            : paymentMethod === null
              ? "Choose payment first"
              : "Place order"}
        </button>
      </div>
    </aside>
  );
}
