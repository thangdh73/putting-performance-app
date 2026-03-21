import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSessions } from "../api/sessions";
import { getDrills } from "../api/drills";
import {
  getSessionSummary,
  DRILL_CATEGORY_FILTERS,
  filterSessionsByCategory,
} from "../lib/sessionDisplay";
import type { Session, Drill } from "../types";

export default function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const drillMap = Object.fromEntries(drills.map((d) => [d.id, d]));
  const filtered = filterSessionsByCategory(sessions, drillMap, filter);
  // Backend returns newest first; no client sort needed

  useEffect(() => {
    getSessions()
      .then((s) => {
        setSessions(s);
        return getDrills();
      })
      .then(setDrills)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">History</h2>
        <p className="mt-4 text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">History</h2>
        <p className="mt-4 text-amber-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            getSessions()
              .then((s) => {
                setSessions(s);
                return getDrills();
              })
              .then(setDrills)
              .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
              .finally(() => setLoading(false));
          }}
          className="mt-4 text-sm text-emerald-600 hover:underline"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">History</h2>
      <p className="mt-2 text-slate-600">Past sessions. Tap to view summary.</p>

      <div className="mt-4">
        <label htmlFor="filter" className="block text-sm font-medium text-slate-700">
          Filter by drill type
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {DRILL_CATEGORY_FILTERS.map(({ value, label }) => (
            <option key={value || "all"} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-slate-500">
          {sessions.length === 0
            ? "No sessions yet. Start a drill!"
            : "No sessions match this filter."}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {filtered.map((s) => {
            const drill = drillMap[s.drill_id] ?? null;
            const { mainScore, attemptsLabel } = getSessionSummary(s, drill);
            return (
              <li key={s.id}>
                <Link
                  to={`/sessions/${s.id}/summary`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300"
                >
                  <span className="font-medium text-slate-800">
                    {drill?.name ?? `Drill #${s.drill_id}`}
                  </span>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(s.session_date).toLocaleDateString()}
                    {mainScore !== "—" && ` · ${mainScore}`}
                    {attemptsLabel && ` · ${attemptsLabel}`}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
