/**
 * Prepare session data for Analytics charts.
 * Backend is source of truth; we only select and format for display.
 */

import type { Session } from "../types";
import type { Drill } from "../types";

const ROLLING_WINDOW = 3;

function addRollingAverage<T extends { value: number }>(
  points: T[],
  windowSize: number = ROLLING_WINDOW
): (T & { rollingAvg?: number })[] {
  if (points.length < windowSize) return points;
  return points.map((p, i) => {
    if (i < windowSize - 1) return p;
    const slice = points.slice(i - windowSize + 1, i + 1);
    const avg =
      slice.reduce((s, x) => s + x.value, 0) / slice.length;
    return { ...p, rollingAvg: Math.round(avg * 10) / 10 };
  });
}

export interface ChartPoint {
  date: string;
  dateLabel: string;
  value: number;
  rollingAvg?: number;
}

function sessionsToChartPoints(
  sessions: Session[],
  getValue: (s: Session) => number | null
): ChartPoint[] {
  const points: ChartPoint[] = sessions
    .map((s) => {
      const v = getValue(s);
      if (v == null) return null;
      const d = new Date(s.session_date);
      return {
        date: s.session_date,
        dateLabel: d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        value: v,
      };
    })
    .filter((p): p is ChartPoint => p != null);
  // Sort by date ascending for time series
  points.sort((a, b) => a.date.localeCompare(b.date));
  return addRollingAverage(points);
}

export function getBroadieChartData(
  sessions: Session[],
  drills: Record<number, Drill>
): ChartPoint[] {
  const broadie = sessions.filter(
    (s) => drills[s.drill_id]?.category === "broadie"
  );
  return sessionsToChartPoints(broadie, (s) => s.total_score ?? null);
}

export function getFootageChartData(
  sessions: Session[],
  drills: Record<number, Drill>
): ChartPoint[] {
  const footage = sessions.filter(
    (s) => drills[s.drill_id]?.category === "footage"
  );
  return sessionsToChartPoints(footage, (s) => s.total_score ?? null);
}

export function getPercentageChartData(
  sessions: Session[],
  drills: Record<number, Drill>
): ChartPoint[] {
  const pct = sessions.filter(
    (s) => drills[s.drill_id]?.category === "percentage"
  );
  return sessionsToChartPoints(pct, (s) => s.percentage_score ?? null);
}

export function getSGChartData(
  sessions: Session[],
  drills: Record<number, Drill>
): ChartPoint[] {
  const sg = sessions.filter(
    (s) => drills[s.drill_id]?.category === "strokes_gained_placeholder"
  );
  return sessionsToChartPoints(sg, (s) => s.total_score ?? null);
}
