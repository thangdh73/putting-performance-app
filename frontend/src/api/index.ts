/**
 * API client exports. Use these for backend calls in pages.
 */
export { API_BASE, fetchHealth, get, post } from "./client";
export { getUsers } from "./users";
export { getDrills, getDrill } from "./drills";
export {
  getSessions,
  getSession,
  getSessionAttempts,
  createSession,
  addAttempt,
} from "./sessions";
export type { SessionCreateBody, AttemptCreateBody } from "./sessions";
