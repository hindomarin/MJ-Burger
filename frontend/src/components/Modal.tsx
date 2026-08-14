import type { ReactNode } from "react";

// A simple pop-up window used for forms and order details.

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  return (
    // Clicking the dark background closes the window.
    <div className="modal-backdrop" onClick={onClose}>
      {/* stopPropagation: a click inside the window must not close it. */}
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
