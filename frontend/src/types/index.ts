/**
 * Types mirroring backend Pydantic schemas.
 * Used by API client and page components.
 */

export interface User {
  id: number;
  name: string;
  preferred_scoring_mode: string | null;
  created_at: string;
  updated_at: string;
}

export interface Drill {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string | null;
  instructions_markdown: string | null;
  benchmark_json: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  drill_id: number;
  session_date: string;
  scoring_mode: string | null;
  notes: string | null;
  total_score: number | null;
  attempts_required: number | null;
  official_attempts_count: number | null;
  made_count: number | null;
  total_attempts: number | null;
  percentage_score: number | null;
  benchmark_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attempt {
  id: number;
  session_id: number;
  attempt_number: number;
  hole_group: number | null;
  distance_ft: number | null;
  result_type: string | null;
  is_holed_first_putt: boolean | null;
  is_first_putt_short: boolean | null;
  putts_to_hole_out: number | null;
  points_awarded: number | null;
  created_at: string;
}
