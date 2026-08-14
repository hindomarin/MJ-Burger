import type { PaymentMethod, PaymentStatus } from "../types";

// Shows how the customer paid and whether the money actually arrived.

type Props = {
  method: PaymentMethod;
  status: PaymentStatus;
};

export function PaymentBadge({ method, status }: Props) {
  return (
    <span className={`badge badge-pay-${status.toLowerCase()}`}>
      {method} · {status}
    </span>
  );
}
