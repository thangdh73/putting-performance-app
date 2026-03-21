/**
 * Convert API errors to user-friendly messages.
 * FastAPI returns { detail: string | array } for errors.
 */

export async function getApiErrorMessage(res: Response, path: string): Promise<string> {
  const status = res.status;
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
    return "Not found";
  }
  if (status === 422) return "Invalid input. Please check your data.";
  if (status === 400) return "Invalid request. Please try again.";
  if (status >= 500) return "Server error. Please try again.";
  if (status === 0)
    return "Unable to connect. Is the backend running?";
  return "Something went wrong. Please try again.";
}
