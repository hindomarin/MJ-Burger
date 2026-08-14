import { useEffect, useState } from "react";
import * as api from "../api/endpoints";
import type { ProductInput } from "../api/endpoints";
import { Loading } from "../components/Loading";
import { Message } from "../components/Message";
import { Modal } from "../components/Modal";
import { ProductForm } from "../components/ProductForm";
import { formatEuro } from "../utils/money";
import type { Category, Product } from "../types";
import "./AdminPages.css";

// Menu management: add, change and delete products and categories.

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  async function loadEverything() {
    try {
      const [loadedCategories, loadedProducts] = await Promise.all([
        api.getCategories(),
        api.getProducts(),
      ]);
      setCategories(loadedCategories);
      setProducts(loadedProducts);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Loading failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEverything();
  }, []);

  function categoryName(id: number) {
    return categories.find((category) => category.id === id)?.name ?? "-";
  }

  function openNewProduct() {
    setEditing(null);
    setShowForm(true);
  }

  function openEditProduct(product: Product) {
    setEditing(product);
    setShowForm(true);
  }

  async function saveProduct(data: ProductInput) {
    if (editing) {
      await api.updateProduct(editing.id, data);
      setNotice(`${data.name} was updated`);
    } else {
      await api.createProduct(data);
      setNotice(`${data.name} was added`);
    }
    setShowForm(false);
    await loadEverything();
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await api.deleteProduct(product.id);
      setNotice(`${product.name} was deleted`);
      setError("");
      await loadEverything();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Deleting failed");
    }
  }

  // Quick switch between available and sold out, without opening the form.
  async function toggleAvailable(product: Product) {
    try {
      await api.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        imageUrl: product.imageUrl,
        available: !product.available,
        categoryId: product.categoryId,
      });
      await loadEverything();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Updating failed");
    }
  }

  async function addCategory(event: React.FormEvent) {
    event.preventDefault();
    if (newCategoryName.trim() === "") {
      setError("Please fill in a category name");
      return;
    }

    try {
      await api.createCategory({
        name: newCategoryName.trim(),
        sortOrder: categories.length + 1,
      });
      setNewCategoryName("");
      setNotice("Category added");
      setError("");
      await loadEverything();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Adding failed");
    }
  }

  async function removeCategory(category: Category) {
    if (!window.confirm(`Delete category ${category.name}?`)) return;

    try {
      await api.deleteCategory(category.id);
      setNotice("Category deleted");
      setError("");
      await loadEverything();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Deleting failed");
    }
  }

  if (loading) {
    return <Loading text="Loading the menu..." />;
  }

  return (
    <div className="page">
      <div className="page-head">
        <h2>Menu management</h2>
        <button className="btn btn-gold" onClick={openNewProduct}>
          + New product
        </button>
      </div>

      {error && <Message text={error} type="error" />}
      {notice && <Message text={notice} type="success" />}

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={product.available ? "" : "unavailable-row"}
              >
                <td>
                  <img
                    className="thumb"
                    src={product.imageUrl || "/images/products/placeholder.svg"}
                    alt=""
                  />
                </td>
                <td>
                  <strong>{product.name}</strong>
                  {product.description && (
                    <div className="text-muted">{product.description}</div>
                  )}
                </td>
                <td>{categoryName(product.categoryId)}</td>
                <td className="price-cell">{formatEuro(product.priceCents)}</td>
                <td>
                  <button
                    className="btn btn-small"
                    onClick={() => toggleAvailable(product)}
                  >
                    {product.available ? "Available" : "Sold out"}
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-small"
                      onClick={() => openEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => removeProduct(product)}
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

      <section className="category-manager">
        <h3 className="section-title">Categories</h3>

        <div className="category-list">
          {categories.map((category) => (
            <span className="category-chip" key={category.id}>
              <strong>{category.name}</strong>
              <button
                className="btn btn-small btn-danger"
                onClick={() => removeCategory(category)}
              >
                Delete
              </button>
            </span>
          ))}
        </div>

        <form className="filters" onSubmit={addCategory}>
          <input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
          />
          <button type="submit" className="btn">
            Add category
          </button>
        </form>
      </section>

      {showForm && (
        <Modal
          title={editing ? `Edit ${editing.name}` : "New product"}
          onClose={() => setShowForm(false)}
        >
          <ProductForm
            product={editing}
            categories={categories}
            onSave={saveProduct}
            onCancel={() => setShowForm(false)}
          />
        </Modal>
      )}
    </div>
  );
}
