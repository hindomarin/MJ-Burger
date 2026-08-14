import { useCart } from "../context/CartContext";
import { formatEuro } from "../utils/money";

// The order that is being put together, on the right side of the POS.

type Props = {
  onPlaceOrder: () => void;
  placing: boolean;
};

export function Cart({ onPlaceOrder, placing }: Props) {
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

        {/* An empty order cannot be sent. The backend refuses it as well. */}
        <button
          className="btn btn-gold place-order-btn"
          onClick={onPlaceOrder}
          disabled={isEmpty || placing}
        >
          {placing ? "Placing..." : "Place order"}
        </button>
      </div>
    </aside>
  );
}
