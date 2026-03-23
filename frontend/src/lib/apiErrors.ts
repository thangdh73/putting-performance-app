/**
 * Convert API errors to user-friendly messages.
 * FastAPI returns { detail: string | array } for errors.
 */

/** Extract a displayable message from a caught error. Uses Error.message when available. */
export function getErrorMessage(err: unknown, fallback = "Failed to load"): string {
  return err instanceof Error ? err.message : fallback;
}

/**
 * Convert thrown errors (network failures, etc.) to user-friendly messages.
 * When isDeployed is true, uses messaging for free-tier backend (e.g. Render wake-up).
 */
export function toUserFriendlyMessage(
  err: unknown,
  options?: { isDeployed?: boolean }
): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    const isNetwork =
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("load failed") ||
      msg.includes("connection") ||
      msg.includes("timeout");
    if (isNetwork) {
      return options?.isDeployed
        ? "Connection failed. The server may be waking up — try again in a moment."
        : "Unable to connect. Check that the app server is running.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export async function getApiErrorMessage(
  res: Response,
  path: string,
  options?: { isDeployed?: boolean }
): Promise<string> {
  const status = res.status;

  // 502/503/504 when deployed often means backend is waking up (e.g. Render free tier)
  if (options?.isDeployed && (status === 502 || status === 503 || status === 504)) {
    return "Connection failed. The server may be waking up — try again in a moment.";
  }

  let detail: unknown = null;
  try {
    const body = await res.json();
    detail = (body as { detail?: unknown }).detail;
  } catch {
    // Non-JSON response
  }

  if (typeof detail === "string") {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: unknown[] };
    if (typeof first?.msg === "string") return first.msg;
  }

  // Fallback by status
  if (status === 404) {
    if (path.includes("/sessions/")) return "Session not found";
    if (path.includes("/drills/")) return "Drill not found";
    if (path.includes("/users/")) return "Player not found";
    return "Not found";
  }
  if (status === 422) return "Invalid input. Please check your data.";
  if (status === 400) return "Invalid request. Please try again.";
  if (status >= 500) return "Server error. Please try again.";
  if (status === 0)
    return "Unable to connect. Is the backend running?";
  return "Something went wrong. Please try again.";
}
