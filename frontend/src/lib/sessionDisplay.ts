/**
 * Normalise session data for History and Analytics display.
 * Drill category determines which session fields map to score/attempts.
 * Backend is source of truth; this is display-only formatting.
 */

import type { Session } from "../types";
import type { Drill } from "../types";

export function getSessionSummary(
  session: Session,
  drill: Drill | null
): { mainScore: string; attemptsLabel: string } {
  if (!drill) {
    return {
      mainScore: session.total_score != null ? String(session.total_score) : "—",
      attemptsLabel: session.total_attempts != null ? `${session.total_attempts} recorded` : "",
    };
  }

  switch (drill.category) {
    case "broadie":
      const score =
        session.total_score != null ? String(session.total_score) : "—";
      const attempts =
        session.attempts_required != null
          ? `${session.attempts_required} to complete`
          : session.total_attempts != null
            ? `${session.total_attempts} putts`
            : "";
      return { mainScore: score, attemptsLabel: attempts };

    case "footage":
      return {
        mainScore:
          session.total_score != null ? `${session.total_score} ft` : "—",
        attemptsLabel:
          session.total_attempts != null
            ? `${session.total_attempts} putts`
            : "",
      };

    case "percentage":
      return {
        mainScore:
          session.percentage_score != null
            ? `${session.percentage_score}%`
            : "—",
        attemptsLabel:
          session.made_count != null && session.total_attempts != null
            ? `${session.made_count}/${session.total_attempts}`
            : session.total_attempts != null
              ? `${session.total_attempts} putts`
              : "",
      };

    case "strokes_gained_placeholder":
      return {
        mainScore:
          session.total_score != null ? `${session.total_score} putts` : "—",
        attemptsLabel:
          session.total_attempts != null
            ? `${session.total_attempts} holes`
            : "",
      };

    default:
      return {
        mainScore: session.total_score != null ? String(session.total_score) : "—",
        attemptsLabel: session.total_attempts != null ? `${session.total_attempts} recorded` : "",
      }
  }
}

/** Drill categories for filter. Maps to backend category. */
export const DRILL_CATEGORY_FILTERS = [
  { value: "", label: "All drills" },
  { value: "broadie", label: "Broadie" },
  { value: "footage", label: "100 ft" },
  { value: "percentage", label: "4–8 ft" },
  { value: "strokes_gained_placeholder", label: "SG (9/18 hole)" },
] as const;

export function filterSessionsByCategory(
  sessions: Session[],
  drills: Record<number, Drill>,
  category: string
): Session[] {
  if (!category) return sessions;
  return sessions.filter((s) => {
    const drill = drills[s.drill_id];
    return drill?.category === category;
  });
}
