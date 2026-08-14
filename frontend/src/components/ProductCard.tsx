import type { Product } from "../types";
import { formatEuro } from "../utils/money";

// One product tile on the POS screen. Tapping it puts the product
// in the cart. Products that are sold out cannot be tapped.

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
};

export function ProductCard({ product, onAdd }: Props) {
  return (
    <button
      className={`product-card ${product.available ? "" : "product-unavailable"}`}
      onClick={() => onAdd(product)}
      disabled={!product.available}
    >
      <span className="product-image">
        <img src={product.imageUrl || "/images/products/placeholder.svg"} alt="" />
        {!product.available && <span className="sold-out">Sold out</span>}
      </span>
      <span className="product-name">{product.name}</span>
      <span className="product-price">{formatEuro(product.priceCents)}</span>
    </button>
  );
}
