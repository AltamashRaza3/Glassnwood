import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

const CATEGORIES = [
  "Decorative Glass",
  "Architectural Glass",
  "Decorative Mirrors",
  "Designer Mirrors",
];

const EMPTY_FORM = {
  name: "",
  slug: "",
  category: "Decorative Glass",
  description: "",
  featured: false,
  published: false,
  sortOrder: 0,
};

const inputClass =
  "mt-2 w-full border border-[#D8D2C7] bg-white p-3 text-sm outline-none focus:border-[#8A765B]";

const labelClass = "block text-sm text-[#51483B]";

async function readResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (response.status === 401 || response.status === 403) {
    throw Object.assign(
      new Error("Your admin session has expired. Please log in again."),
      { authError: true },
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error?.message ||
        "The request could not be completed.",
    );
  }

  return result;
}

function StatusLabel({ published }) {
  return (
    <span
      className={`inline-flex px-3 py-1.5 text-xs ${
        published
          ? "bg-green-100 text-green-800"
          : "bg-[#EEE7DB] text-[#6E5A40]"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const handleAuthError = useCallback(
    (err) => {
      if (!err.authError) return false;

      navigate("/admin/login", { replace: true });
      return true;
    },
    [navigate],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/products/admin/all", {
        credentials: "include",
        cache: "no-store",
      });

      const result = await readResponse(response);
      setProducts(result.data || []);
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(
          err.message === "Failed to fetch"
            ? "Cannot connect to the backend. Check that the server is running."
            : err.message || "Unable to load products.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [product.name, product.slug, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Published" && product.published) ||
        (statusFilter === "Draft" && !product.published) ||
        (statusFilter === "Featured" && product.featured);

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  function openCreateForm() {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setExistingImages([]);
    setNewFiles([]);
    setError("");
    setNotice("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(product) {
    setEditingProduct(product);

    setForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || CATEGORIES[0],
      description: product.description || "",
      featured: Boolean(product.featured),
      published: Boolean(product.published),
      sortOrder: product.sortOrder ?? 0,
    });

    setExistingImages((product.images || []).map((image) => ({ ...image })));
    setNewFiles([]);
    setError("");
    setNotice("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setExistingImages([]);
    setNewFiles([]);
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : name === "sortOrder" ? value : value,
    }));
  }

  function selectImages(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";

    const combinedCount =
      existingImages.length + newFiles.length + selected.length;

    if (combinedCount > 15) {
      setError("A product can have a maximum of 15 images.");
      return;
    }

    const oversized = selected.find((file) => file.size > 8 * 1024 * 1024);

    if (oversized) {
      setError(`"${oversized.name}" exceeds the 8 MB image limit.`);
      return;
    }

    const invalid = selected.find(
      (file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );

    if (invalid) {
      setError("Only JPG, PNG and WebP images are supported.");
      return;
    }

    setError("");
    setNewFiles((current) => [...current, ...selected]);
  }

  function removeExistingImage(index) {
    setExistingImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function removeNewImage(index) {
    setNewFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (saving) return;

    if (!form.name.trim() || !form.category || !form.description.trim()) {
      setError("Name, category and description are required.");
      return;
    }

    if (existingImages.length + newFiles.length > 15) {
      setError("A product can have a maximum of 15 images.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const body = new FormData();

      body.set("name", form.name.trim());
      body.set("slug", form.slug.trim());
      body.set("category", form.category);
      body.set("description", form.description.trim());
      body.set("featured", String(form.featured));
      body.set("published", String(form.published));
      body.set("sortOrder", String(Number(form.sortOrder) || 0));

      if (editingProduct) {
        // Send the retained images so the backend knows which to keep.
        body.set("images", JSON.stringify(existingImages));
      }

      newFiles.forEach((file) => {
        body.append("images", file);
      });

      const isEditing = Boolean(editingProduct);

      const response = await fetch(
        isEditing
          ? `/api/products/admin/${editingProduct._id}`
          : "/api/products/admin",
        {
          method: isEditing ? "PATCH" : "POST",
          credentials: "include",
          body,
        },
      );

      const result = await readResponse(response);

      setNotice(
        result.message ||
          (isEditing
            ? "Product updated successfully."
            : "Product created successfully."),
      );

      setShowForm(false);
      setEditingProduct(null);
      setForm({ ...EMPTY_FORM });
      setExistingImages([]);
      setNewFiles([]);

      await loadProducts();
    } catch (err) {
      handleAuthError(err);

      setError(
        err.message === "Failed to fetch"
          ? "Could not reach the backend. Check your server and network."
          : err.message || "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(product, field) {
    setBusyId(product._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/products/admin/${product._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [field]: !product[field],
        }),
      });

      const result = await readResponse(response);

      setProducts((current) =>
        current.map((item) => (item._id === product._id ? result.data : item)),
      );

      setNotice(
        field === "published"
          ? result.data.published
            ? "Product published successfully."
            : "Product unpublished successfully."
          : result.data.featured
            ? "Product marked as featured."
            : "Product removed from featured products.",
      );
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err.message || "Unable to update product.");
      }
    } finally {
      setBusyId("");
    }
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"?\n\nThis removes the product record and attempts to delete its Cloudinary images. This action cannot be undone.`,
    );

    if (!confirmed) return;

    setBusyId(product._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/products/admin/${product._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await readResponse(response);

      setProducts((current) =>
        current.filter((item) => item._id !== product._id),
      );

      setNotice(result.message || "Product deleted successfully.");
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err.message || "Unable to delete product.");
      }
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F2EC] px-5 py-8 text-[#292923] sm:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#8A765B]">
              Glass n Wood
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl">
              Manage Products
            </h1>
            <p className="mt-3 text-sm text-[#77756D]">
              Manage glass, mirror finishes, product images and publishing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 border border-[#D8D2C7] px-4 py-3 text-sm hover:bg-[#292923] hover:text-white"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loading || saving || Boolean(busyId)}
              className="inline-flex items-center gap-2 border border-[#D8D2C7] px-4 py-3 text-sm hover:bg-[#EEE7DB] disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              type="button"
              onClick={showForm ? closeForm : openCreateForm}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#292923] px-5 py-3 text-sm text-white hover:bg-[#51483B] disabled:opacity-50"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Close form" : "Add product"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start justify-between gap-4 border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 flex items-start justify-between gap-4 border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={17} />
            </button>
          </div>
        )}

        {showForm && (
          <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
            <div className="border-b border-[#DED8CC] p-5 sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                {editingProduct ? "Edit product" : "New product"}
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                {editingProduct ? editingProduct.name : "Product details"}
              </h2>
              <p className="mt-2 text-sm text-[#77756D]">
                Product images are uploaded to Cloudinary when you save.
              </p>
            </div>

            <form onSubmit={saveProduct} className="space-y-6 p-5 sm:p-7">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  Product name *
                  <input
                    name="name"
                    value={form.name}
                    onChange={updateField}
                    required
                    maxLength={160}
                    className={inputClass}
                    placeholder="Fluted Glass"
                  />
                </label>

                <label className={labelClass}>
                  URL slug
                  <input
                    name="slug"
                    value={form.slug}
                    onChange={updateField}
                    maxLength={180}
                    className={inputClass}
                    placeholder="fluted-glass"
                  />
                  <span className="mt-1 block text-xs text-[#77756D]">
                    Leave blank to generate it from the product name.
                  </span>
                </label>

                <label className={labelClass}>
                  Category *
                  <select
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    required
                    className={inputClass}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Display order
                  <input
                    name="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={updateField}
                    min="0"
                    className={inputClass}
                  />
                  <span className="mt-1 block text-xs text-[#77756D]">
                    Lower numbers appear first.
                  </span>
                </label>
              </div>

              <label className={labelClass}>
                Description *
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  required
                  maxLength={3000}
                  rows={5}
                  className={inputClass}
                  placeholder="Describe the glass or mirror finish, suitable applications and design details..."
                />
              </label>

              <section className="border border-[#DED8CC] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-2xl">Product images</h3>
                    <p className="mt-1 text-xs leading-5 text-[#77756D]">
                      JPG, PNG or WebP · Maximum 8 MB per image · 15 images per
                      product
                    </p>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 border border-[#D8D2C7] px-4 py-3 text-sm hover:bg-[#EEE7DB]">
                    <ImagePlus size={17} />
                    Add images
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={selectImages}
                      className="sr-only"
                    />
                  </label>
                </div>

                <p className="mt-3 text-xs text-[#77756D]">
                  {existingImages.length + newFiles.length} of 15 images
                  selected. The first image is used as the product card image.
                </p>

                {existingImages.length + newFiles.length === 0 ? (
                  <div className="mt-4 flex min-h-28 flex-col items-center justify-center border border-dashed border-[#D8D2C7] text-center">
                    <ImagePlus size={24} className="text-[#8A765B]" />
                    <p className="mt-2 text-sm text-[#77756D]">
                      No images selected
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {existingImages.map((image, index) => (
                      <div
                        key={image.publicId || `${image.src}-${index}`}
                        className="relative min-w-0"
                      >
                        <img
                          src={image.src}
                          alt={image.alt || `Product image ${index + 1}`}
                          className="aspect-square w-full border border-[#DED8CC] bg-[#EEE7DB] object-cover"
                        />

                        {index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#292923]/85 px-2 py-1.5 text-center text-[10px] text-white">
                            Main image
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white text-red-700 shadow hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {newFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${file.size}-${index}`}
                        className="relative min-w-0"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="aspect-square w-full border border-[#DED8CC] bg-[#EEE7DB] object-cover"
                        />

                        <span className="absolute bottom-0 left-0 right-0 truncate bg-[#292923]/85 px-2 py-1.5 text-center text-[10px] text-white">
                          New image
                        </span>

                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          aria-label={`Remove new image ${index + 1}`}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white text-red-700 shadow hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 border border-[#DED8CC] p-4 text-sm">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={updateField}
                    className="mt-1 h-4 w-4 accent-[#8A765B]"
                  />
                  <span>
                    <span className="block font-medium">Featured product</span>
                    <span className="mt-1 block text-xs text-[#77756D]">
                      Mark this item as featured for future featured-product
                      sections.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-3 border border-[#DED8CC] p-4 text-sm">
                  <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={updateField}
                    className="mt-1 h-4 w-4 accent-[#8A765B]"
                  />
                  <span>
                    <span className="block font-medium">Publish product</span>
                    <span className="mt-1 block text-xs text-[#77756D]">
                      Published products appear on the public product page.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#DED8CC] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#292923] px-6 py-3 text-sm text-white hover:bg-[#51483B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Uploading and saving..."
                    : editingProduct
                      ? "Save changes"
                      : "Create product"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="border border-[#D8D2C7] px-6 py-3 text-sm hover:bg-[#EEE7DB] disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="mt-8 border border-[#DED8CC] bg-[#FBF9F5]">
          <div className="border-b border-[#DED8CC] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8A765B]">
                  Catalogue management
                </p>
                <h2 className="mt-2 font-serif text-2xl">All products</h2>
              </div>

              <p className="text-sm text-[#77756D]">
                {visibleProducts.length} of {products.length} products
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_220px]">
              <label className="flex items-center gap-3 border border-[#D8D2C7] bg-white px-3">
                <Search size={17} className="text-[#77756D]" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="min-h-11 w-full bg-transparent text-sm outline-none"
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter products"
                className="border border-[#D8D2C7] bg-white p-3 text-sm"
              >
                <option value="All">All products</option>
                <option value="Published">Published</option>
                <option value="Draft">Drafts</option>
                <option value="Featured">Featured</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-sm text-[#77756D]">
              Loading products from MongoDB...
            </p>
          ) : visibleProducts.length === 0 ? (
            <div className="p-8">
              <p className="text-sm text-[#77756D]">
                {products.length === 0
                  ? "No products found. Add your first product to get started."
                  : "No products match your search or filter."}
              </p>

              {products.length === 0 && (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="mt-4 bg-[#292923] px-4 py-3 text-sm text-white hover:bg-[#51483B]"
                >
                  Add your first product
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E8E2D8]">
              {visibleProducts.map((product) => {
                const isBusy = busyId === product._id;
                const firstImage = product.images?.[0]?.src;

                return (
                  <article
                    key={product._id}
                    className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
                  >
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={product.images?.[0]?.alt || product.name}
                        loading="lazy"
                        className="h-32 w-full shrink-0 border border-[#DED8CC] bg-[#EEE7DB] object-cover sm:w-32"
                      />
                    ) : (
                      <div className="flex h-32 w-full shrink-0 items-center justify-center border border-[#DED8CC] bg-[#EEE7DB] sm:w-32">
                        <ImagePlus size={28} className="text-[#8A765B]" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words font-serif text-xl">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#77756D]">
                        {product.category}
                      </p>

                      <p className="mt-1 break-all text-xs text-[#8A765B]">
                        /products/glass-mirrors · {product.slug}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusLabel published={product.published} />

                        {product.featured && (
                          <span className="bg-[#292923] px-3 py-1.5 text-xs text-white">
                            Featured
                          </span>
                        )}

                        <span className="border border-[#DED8CC] px-3 py-1.5 text-xs text-[#77756D]">
                          {product.images?.length || 0} image(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:max-w-60 sm:justify-end">
                      <button
                        type="button"
                        disabled={Boolean(busyId) || saving}
                        onClick={() => openEditForm(product)}
                        className="inline-flex items-center gap-1.5 border border-[#D8D2C7] px-3 py-2 text-xs hover:bg-[#EEE7DB] disabled:opacity-50"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyId) || saving}
                        onClick={() => toggleProduct(product, "published")}
                        className="border border-[#D8D2C7] px-3 py-2 text-xs hover:bg-[#292923] hover:text-white disabled:opacity-50"
                      >
                        {isBusy
                          ? "Saving..."
                          : product.published
                            ? "Unpublish"
                            : "Publish"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyId) || saving}
                        onClick={() => toggleProduct(product, "featured")}
                        className="border border-[#D8D2C7] px-3 py-2 text-xs hover:bg-[#292923] hover:text-white disabled:opacity-50"
                      >
                        {product.featured ? "Unfeature" : "Feature"}
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(busyId) || saving}
                        onClick={() => deleteProduct(product)}
                        className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {isBusy ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-6 text-xs leading-5 text-[#8B877F]">
          Product information is stored in MongoDB. Images are stored in
          Cloudinary. Only published products are returned by the public
          catalogue API.
        </p>
      </div>
    </main>
  );
}
