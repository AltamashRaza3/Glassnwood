
import { projects as localProjects } from "../data/projects.js";

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const useApi =
  import.meta.env.VITE_USE_API === "true" || Boolean(apiBase);

async function request(path) {
  const response = await fetch(`${apiBase}/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      // Response did not contain JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getProjects() {
  if (!useApi) {
    return localProjects;
  }

  const result = await request("/projects");

  return Array.isArray(result.data) ? result.data : [];
}

export async function getProject(slug) {
  if (!useApi) {
    return localProjects.find((project) => project.slug === slug) || null;
  }

  const result = await request(
    `/projects/${encodeURIComponent(slug)}`
  );

  return result.data || null;
}
