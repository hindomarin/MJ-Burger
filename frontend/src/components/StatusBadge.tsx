import type { OrderStatus } from "../types";

// Shows the order status in the matching colour.
export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
}
