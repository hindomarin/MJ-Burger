import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import type { InventoryInput } from "../api/endpoints";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { Modal } from "../components/Modal";
import type { InventoryItem } from "../types";
import "./AdminPages.css";

// A very simple stock list. When something reaches its minimum level
// we show LOW STOCK, so the owner knows what to buy.

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function loadItems() {
    try {
      setItems(await api.getInventory());
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Loading failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function isLow(item: InventoryItem) {
    return item.quantity <= item.minQuantity;
  }

  async function removeItem(item: InventoryItem) {
    if (!window.confirm(`Delete ${item.name}?`)) return;

    try {
      await api.deleteInventoryItem(item.id);
      await loadItems();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Deleting failed");
    }
  }

  async function saveItem(data: InventoryInput) {
    if (editing) {
      await api.updateInventoryItem(editing.id, data);
    } else {
      await api.createInventoryItem(data);
    }
    setShowForm(false);
    await loadItems();
  }

  if (loading) return <Loading text="Loading the stock..." />;

  const lowCount = items.filter(isLow).length;

  return (
    <div className="page">
      <div className="page-head">
        <h2>Stock</h2>
        <div className="row-actions">
          {lowCount > 0 && (
            <span className="badge badge-low">{lowCount} low stock</span>
          )}
          <button
            className="btn btn-gold"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + New item
          </button>
        </div>
      </div>

      {error && <Message text={error} type="error" />}

      {items.length === 0 ? (
        <p className="empty">No stock items yet</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>In stock</th>
                <th>Minimum</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td className="price-cell">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="text-muted">
                    {item.minQuantity} {item.unit}
                  </td>
                  <td>
                    {isLow(item) ? (
                      <span className="badge badge-low">Low stock</span>
                    ) : (
                      <span className="text-muted">OK</span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => {
                          setEditing(item);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => removeItem(item)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? `Edit ${editing.name}` : "New stock item"}
          onClose={() => setShowForm(false)}
        >
          <InventoryForm
            item={editing}
            onSave={saveItem}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}

// The form for one stock item. It lives here because it is only used here.
function InventoryForm({
  item,
  onSave,
  onCancel,
}: {
  item: InventoryItem | null;
  onSave: (data: InventoryInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState(String(item?.quantity ?? ""));
  const [unit, setUnit] = useState(item?.unit ?? "pcs");
  const [minQuantity, setMinQuantity] = useState(String(item?.minQuantity ?? ""));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const quantityNumber = Number(quantity.replace(",", "."));
    const minNumber = Number(minQuantity.replace(",", "."));

    if (name.trim() === "") {
      setError("Please fill in a name");
      return;
    }
    if (Number.isNaN(quantityNumber) || quantityNumber < 0) {
      setError("Quantity must be a number of 0 or higher");
      return;
    }
    if (Number.isNaN(minNumber) || minNumber < 0) {
      setError("Minimum stock must be a number of 0 or higher");
      return;
    }
    if (unit.trim() === "") {
      setError("Please fill in a unit, for example kg or pcs");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        quantity: quantityNumber,
        unit: unit.trim(),
        minQuantity: minNumber,
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
        <label htmlFor="item-name">Name</label>
        <input
          id="item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="quantity">In stock</label>
          <input
            id="quantity"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="unit">Unit</label>
          <input
            id="unit"
            placeholder="kg, pcs, L"
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="min">Minimum</label>
          <input
            id="min"
            inputMode="decimal"
            value={minQuantity}
            onChange={(event) => setMinQuantity(event.target.value)}
          />
        </div>
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
