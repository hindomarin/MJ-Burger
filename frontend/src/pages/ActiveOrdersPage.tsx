import { useCallback, useEffect, useState } from "react";
import * as api from "../api/endpoints";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { StatusBadge } from "../components/StatusBadge";
import { PaymentBadge } from "../components/PaymentBadge";
import { formatEuro } from "../utils/money";
import type { Order, OrderStatus } from "../types";
import "./ActiveOrdersPage.css";

// Orders that are still busy. The list refreshes itself every 5 seconds,
// so a second screen in the kitchen would stay up to date automatically.

const REFRESH_MS = 5000;

// Which button do we show for each status?
const NEXT_STATUS: Record<string, { label: string; status: OrderStatus }> = {
  NEW: { label: "Start preparing", status: "PREPARING" },
  PREPARING: { label: "Mark as ready", status: "READY" },
  READY: { label: "Complete", status: "COMPLETED" },
};

export function ActiveOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await api.getActiveOrders());
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Loading failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Ask the backend again every few seconds.
    const timer = setInterval(loadOrders, REFRESH_MS);

    // Stop the timer when the user leaves this page.
    return () => clearInterval(timer);
  }, [loadOrders]);

  async function changeStatus(order: Order, status: OrderStatus) {
    setBusyId(order.id);
    try {
      await api.updateOrderStatus(order.id, status);
      await loadOrders();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update");
    } finally {
      setBusyId(null);
    }
  }

  // For card orders that were not confirmed yet, or that failed and
  // were paid on a second try.
  async function markAsPaid(order: Order) {
    setBusyId(order.id);
    try {
      await api.updatePaymentStatus(order.id, "PAID");
      await loadOrders();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update");
    } finally {
      setBusyId(null);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return <Loading text="Loading orders..." />;
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>Active orders</h2>
        <span className="text-muted">{orders.length} open</span>
      </div>

      {error && <Message text={error} type="error" />}

      {orders.length === 0 ? (
        <p className="empty">No open orders right now</p>
      ) : (
        <div className="order-grid">
          {orders.map((order) => {
            const next = NEXT_STATUS[order.status];

            return (
              <article className="order-card" key={order.id}>
                <header className="order-card-head">
                  <span className="order-number">#{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </header>

                <div className="order-meta">
                  <span className="order-time">{formatTime(order.createdAt)}</span>
                  <PaymentBadge
                    method={order.paymentMethod}
                    status={order.paymentStatus}
                  />
                </div>

                <ul className="order-items">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      <span className="order-item-qty">{item.quantity}×</span>
                      <span className="order-item-name">
                        {item.productName}
                        {item.note && (
                          <em className="order-item-note"> — {item.note}</em>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.note && <p className="order-note-text">Note: {order.note}</p>}

                <p className="order-total">{formatEuro(order.totalCents)}</p>

                {/* Money still has to come in for this order. */}
                {order.paymentStatus !== "PAID" && (
                  <button
                    className="btn mark-paid-btn"
                    onClick={() => markAsPaid(order)}
                    disabled={busyId === order.id}
                  >
                    Mark as paid
                  </button>
                )}

                <div className="order-actions">
                  {next && (
                    <button
                      className="btn btn-gold"
                      onClick={() => changeStatus(order, next.status)}
                      disabled={busyId === order.id}
                    >
                      {next.label}
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    onClick={() => changeStatus(order, "CANCELLED")}
                    disabled={busyId === order.id}
                  >
                    Cancel
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
