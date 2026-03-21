import { get, post } from "./client";
import type { Session, Attempt } from "../types";

export async function getSessions(params?: {
  user_id?: number;
  drill_id?: number;
}): Promise<Session[]> {
  const search = new URLSearchParams();
  if (params?.user_id != null) search.set("user_id", String(params.user_id));
  if (params?.drill_id != null) search.set("drill_id", String(params.drill_id));
  const qs = search.toString();
  return get<Session[]>(`/api/sessions${qs ? `?${qs}` : ""}`);
}

export async function getSession(id: number): Promise<Session> {
  return get<Session>(`/api/sessions/${id}`);
}

export async function getSessionAttempts(sessionId: number): Promise<Attempt[]> {
  return get<Attempt[]>(`/api/sessions/${sessionId}/attempts`);
}

export interface SessionCreateBody {
  user_id: number;
  drill_id: number;
  session_date: string;
  scoring_mode?: string;
  notes?: string;
}

export async function createSession(body: SessionCreateBody): Promise<Session> {
  return post<Session>("/api/sessions", body);
}

export interface AttemptCreateBody {
  attempt_number: number;
  hole_group?: number;
  distance_ft?: number;
  result_type?: string;
  is_holed_first_putt?: boolean;
  is_first_putt_short?: boolean;
  putts_to_hole_out?: number;
  points_awarded?: number;
}

export async function addAttempt(
  sessionId: number,
  body: AttemptCreateBody
): Promise<Attempt> {
  return post<Attempt>(`/api/sessions/${sessionId}/attempts`, body);
}
