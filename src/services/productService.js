
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path) {
  const response = await fetch(`${API_URL}/api/products${path}`, {
    headers: { Accept: "application/json" },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Unable to load products.");
  }

  return result.data ?? [];
}

export async function getProducts() {
  return request("");
}

export async function getProductBySlug(slug) {
  return request(`/slug/${encodeURIComponent(slug)}`);
}
