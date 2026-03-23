/**
 * Normalise session data for History and Analytics display.
 * Drill category determines which session fields map to score/attempts.
 * Backend is source of truth; this is display-only formatting.
 */

import type { Session } from "../types";
import type { Drill } from "../types";
import { TOTAL_ATTEMPTS } from "./attemptStructure";

/** True when session is partial (not officially complete). */
export function isPartialSession(session: Session): boolean {
  return session.official_attempts_count == null;
}

/** True when session is complete and has extra practice attempts. */
export function isCompletedWithExtra(session: Session): boolean {
  const official = session.official_attempts_count ?? 0;
  const total = session.total_attempts ?? 0;
  return official > 0 && total > official;
}

/** Label for completed_with_extra sessions in History. */
export function getCompletedWithExtraLabel(session: Session): string {
  const official = session.official_attempts_count ?? 0;
  const total = session.total_attempts ?? 0;
  const extra = Math.max(0, total - official);
  return `Completed + ${extra} extra`;
}

/**
 * Progress label for partial sessions in History.
 * Format: "In progress — X / Y attempts" (or putts/holes as appropriate).
 */
export function getPartialSessionLabel(
  session: Session,
  drill: Drill | null
): string {
  const current = session.total_attempts ?? 0;
  if (!drill) {
    return `In progress — ${current} recorded`;
  }

  const bench = drill.benchmark_json as Record<string, unknown> | null;

  switch (drill.category) {
    case "broadie": {
      const mode = (session.scoring_mode || "average").toString().toLowerCase();
      if (mode === "completion") {
        const target = (bench?.completion_mode as { target?: number })?.target;
        const score = session.total_score ?? 0;
        if (target != null) {
          return `In progress — score ${score} / target ${target}`;
        }
        return `In progress — ${current} putts · ${score} pts`;
      }
      return `In progress — ${current} / 10 attempts`;
    }
    case "footage":
      return `In progress — ${current} / ${TOTAL_ATTEMPTS} putts`;
    case "percentage":
      return `In progress — ${current} / ${TOTAL_ATTEMPTS} putts`;
    case "strokes_gained_placeholder": {
      const holes = (bench?.holes as number) ?? 9;
      return `In progress — ${current} / ${holes} holes`;
    }
    default:
      return `In progress — ${current} recorded`;
  }
}

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
