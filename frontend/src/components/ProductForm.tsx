import { useState } from "react";
import type { ProductInput } from "../api/endpoints";
import { centsToEuroText, euroToCents } from "../utils/money";
import { Message } from "./Message";
import type { Category, Product } from "../types";

// Form to add a new product or change an existing one.

type Props = {
  product: Product | null; // null means: new product
  categories: Category[];
  onSave: (data: ProductInput) => Promise<void>;
  onCancel: () => void;
};

export function ProductForm({ product, categories, onSave, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [priceText, setPriceText] = useState(
    product ? centsToEuroText(product.priceCents) : "",
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [available, setAvailable] = useState(product?.available ?? true);
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? 0,
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    // Check the form before sending it to the backend.
    if (name.trim() === "") {
      setError("Please fill in a product name");
      return;
    }

    const priceCents = euroToCents(priceText);
    if (priceCents === null || priceCents < 1) {
      setError("Please fill in a valid price, for example 8.50");
      return;
    }

    if (!categoryId) {
      setError("Please choose a category");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        priceCents,
        imageUrl: imageUrl.trim(),
        available,
        categoryId,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saving failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Message text={error} type="error" />}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <input
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="price">Price in euro</label>
          <input
            id="price"
            inputMode="decimal"
            placeholder="8.50"
            value={priceText}
            onChange={(event) => setPriceText(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(Number(event.target.value))}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="image">Image (path in the public folder)</label>
        <input
          id="image"
          placeholder="/images/products/placeholder.svg"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />
      </div>

      <div className="checkbox-field">
        <input
          id="available"
          type="checkbox"
          checked={available}
          onChange={(event) => setAvailable(event.target.checked)}
        />
        <label htmlFor="available" style={{ margin: 0 }}>
          Available on the POS
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-gold" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
