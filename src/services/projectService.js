
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const USE_API =
  import.meta.env.VITE_USE_API === "true" ||
  Boolean(API_BASE_URL);

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      signal: options.signal,
      cache: "no-cache",
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Unable to connect to the server. Please check your internet connection."
    );
  }

  let body;

  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed (${response.status}).`);
    }

    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      body?.error?.message ||
      body?.message ||
      `Request failed (${response.status}).`
    );
  }

  return body;
}

export async function getProjects(options = {}) {
  if (!USE_API) {
    return localProjects;
  }

  const result = await request("/projects", options);

  if (!Array.isArray(result?.data)) {
    throw new Error("Invalid projects response from server.");
  }

  return result.data;
}

export async function getProject(slug, options = {}) {
  if (!slug) return null;

  if (!USE_API) {
    return (
      localProjects.find((project) => project.slug === slug) || null
    );
  }

  const result = await request(
    `/projects/${encodeURIComponent(slug)}`,
    options
  );

  return result?.data || null;
}
