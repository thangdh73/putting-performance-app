import { getApiErrorMessage, toUserFriendlyMessage } from "../lib/apiErrors";

/**
 * Base API client. Vite proxy forwards /api to backend (avoids CORS).
 */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ??
  "";

/** True when using a remote backend (e.g. Render); used for deployment-aware error messages. */
export function isDeployedApi(): boolean {
  if (!API_BASE) return false;
  const u = API_BASE.toLowerCase();
  return (
    u.startsWith("https://") &&
    !u.includes("localhost") &&
    !u.includes("127.0.0.1")
  );
}

async function fetchWithErrorHandling(
  url: string,
  init?: RequestInit
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    throw new Error(toUserFriendlyMessage(e, { isDeployed: isDeployedApi() }));
  }
}

export async function fetchHealth(): Promise<{
  status: string;
  service: string;
}> {
  const res = await fetchWithErrorHandling(`${API_BASE}/api/health`);
  if (!res.ok) {
    throw new Error("Unable to connect. Check that the app server is running.");
  }
  return res.json();
}

/** Generic GET helper for typed responses. Throws with user-friendly message. */
export async function get<T>(path: string): Promise<T> {
  const res = await fetchWithErrorHandling(`${API_BASE}${path}`);
  if (!res.ok) {
    const msg = await getApiErrorMessage(res, path, { isDeployed: isDeployedApi() });
    throw new Error(msg);
  }
  return res.json();
}

/** Generic POST helper for typed responses. Throws with user-friendly message. */
export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithErrorHandling(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await getApiErrorMessage(res, path, { isDeployed: isDeployedApi() });
    throw new Error(msg);
  }
  return res.json();
}

/** Generic DELETE helper. Throws with user-friendly message. */
export async function del(path: string): Promise<void> {
  const res = await fetchWithErrorHandling(`${API_BASE}${path}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const msg = await getApiErrorMessage(res, path, { isDeployed: isDeployedApi() });
    throw new Error(msg);
  }
}
