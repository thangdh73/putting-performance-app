import { getApiErrorMessage } from "../lib/apiErrors";

/**
 * Base API client. Vite proxy forwards /api to backend (avoids CORS).
 */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ??
  "";

export async function fetchHealth(): Promise<{
  status: string;
  service: string;
}> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

/** Generic GET helper for typed responses. Throws with user-friendly message. */
export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const msg = await getApiErrorMessage(res, path);
    throw new Error(msg);
  }
  return res.json();
}

/** Generic POST helper for typed responses. Throws with user-friendly message. */
export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await getApiErrorMessage(res, path);
    throw new Error(msg);
  }
  return res.json();
}
