import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { CartLine, Product } from "../types";

// The shopping cart of the POS screen. It only lives in the browser;
// nothing is sent to the backend until PLACE ORDER is pressed.

type CartValue = {
  lines: CartLine[];
  orderNote: string;
  totalCents: number;
  itemCount: number;
  addProduct: (product: Product) => void;
  increase: (productId: number) => void;
  decrease: (productId: number) => void;
  removeLine: (productId: number) => void;
  setLineNote: (productId: number, note: string) => void;
  setOrderNote: (note: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderNote, setOrderNote] = useState("");

  // Clicking the same product again just makes the quantity higher.
  function addProduct(product: Product) {
    setLines((current) => {
      const existing = current.find((line) => line.product.id === product.id);

      if (existing) {
        return current.map((line) =>
          line.product.id === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }

      return [...current, { product, quantity: 1, note: "" }];
    });
  }

  function increase(productId: number) {
    setLines((current) =>
      current.map((line) =>
        line.product.id === productId
          ? { ...line, quantity: Math.min(line.quantity + 1, 99) }
          : line,
      ),
    );
  }

  // Going below 1 removes the line completely.
  function decrease(productId: number) {
    setLines((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }

  function removeLine(productId: number) {
    setLines((current) => current.filter((line) => line.product.id !== productId));
  }

  function setLineNote(productId: number, note: string) {
    setLines((current) =>
      current.map((line) =>
        line.product.id === productId ? { ...line, note } : line,
      ),
    );
  }

  function clearCart() {
    setLines([]);
    setOrderNote("");
  }

  // useMemo: only count again when the lines really changed.
  const totalCents = useMemo(
    () =>
      lines.reduce(
        (total, line) => total + line.product.priceCents * line.quantity,
        0,
      ),
    [lines],
  );

  const itemCount = useMemo(
    () => lines.reduce((total, line) => total + line.quantity, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        orderNote,
        totalCents,
        itemCount,
        addProduct,
        increase,
        decrease,
        removeLine,
        setLineNote,
        setOrderNote,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return value;
}
