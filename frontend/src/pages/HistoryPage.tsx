import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { PaymentBadge } from "../components/PaymentBadge";
import { formatEuro } from "../utils/money";
import type { Order } from "../types";
import "./AdminPages.css";

// All orders that were placed, with a simple search and filter.

export function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");

  const [selected, setSelected] = useState<Order | null>(null);

  // Load again whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .getOrderHistory({ search, date, status })
      .then((result) => {
        // Ignore the answer if the user already changed the filter again.
        if (!cancelled) {
          setOrders(result);
          setError("");
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Loading failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, date, status]);

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function clearFilters() {
    setSearch("");
    setDate("");
    setStatus("");
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>Order history</h2>
        <span className="text-muted">{orders.length} orders</span>
      </div>

      <div className="filters">
        <input
          placeholder="Search order number or product"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="NEW">New</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="btn" onClick={clearFilters}>
          Reset
        </button>
      </div>

      {error && <Message text={error} type="error" />}

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <p className="empty">No orders found</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date and time</th>
                <th className="hide-sm">Products</th>
                <th>Status</th>
                <th className="hide-sm">Payment</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="price-cell">#{order.orderNumber}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td className="hide-sm">
                    {order.items
                      .map((item) => `${item.quantity}× ${item.productName}`)
                      .join(", ")}
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="hide-sm">
                    <PaymentBadge
                      method={order.paymentMethod}
                      status={order.paymentStatus}
                    />
                  </td>
                  <td className="price-cell">{formatEuro(order.totalCents)}</td>
                  <td>
                    <button
                      className="btn btn-small"
                      onClick={() => setSelected(order)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal
          title={`Order #${selected.orderNumber}`}
          onClose={() => setSelected(null)}
        >
          <p className="text-muted">{formatDateTime(selected.createdAt)}</p>
          <p className="modal-badges">
            <StatusBadge status={selected.status} />
            <PaymentBadge
              method={selected.paymentMethod}
              status={selected.paymentStatus}
            />
          </p>

          <table>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Product</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.quantity}×</td>
                  <td>
                    {item.productName}
                    {item.note && (
                      <em className="text-muted"> — {item.note}</em>
                    )}
                  </td>
                  <td className="price-cell">
                    {formatEuro(item.unitPriceCents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected.note && <p style={{ marginTop: 14 }}>Note: {selected.note}</p>}

          <p className="history-modal-total">
            Total <strong>{formatEuro(selected.totalCents)}</strong>
          </p>
        </Modal>
      )}
    </div>
  );
}
