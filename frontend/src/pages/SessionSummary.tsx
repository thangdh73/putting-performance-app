import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSession, getSessionAttempts } from "../api/sessions";
import { getDrill } from "../api/drills";
import type { Session, Attempt, Drill } from "../types";

function useSessionData(sessionId: string | undefined) {
  const [session, setSession] = useState<Session | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sid = sessionId ? parseInt(sessionId, 10) : NaN;
  const validId = Number.isInteger(sid) && sid >= 1;

  const fetchData = useCallback(() => {
    if (!sessionId || !validId) {
      setError("Invalid session");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    Promise.all([getSession(sid), getSessionAttempts(sid)])
      .then(([s, a]) => {
        setSession(s);
        setAttempts(a);
        return getDrill(s.drill_id);
      })
      .then((d) => {
        setDrill(d);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [sessionId, validId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { session, drill, attempts, loading, error, validId, fetchData };
}

export default function SessionSummary() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const {
    session,
    drill,
    attempts,
    loading,
    error,
    validId,
    fetchData,
  } = useSessionData(sessionId);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Session Summary</h2>
        <p className="mt-4 text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error || !session || !drill) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Session Summary</h2>
        <p className="mt-4 text-amber-700">{error ?? "Session not found"}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {validId && (
            <button
              type="button"
              onClick={fetchData}
              className="text-sm text-emerald-600 hover:underline"
            >
              Retry
            </button>
          )}
          <Link to="/history" className="text-sm text-emerald-600 hover:underline">
            View History
          </Link>
          <Link to="/drills" className="text-sm text-emerald-600 hover:underline">
            Drill Library
          </Link>
        </div>
      </section>
    );
  }

  const mode = (session.scoring_mode || "average").toLowerCase();
  const isBroadie = drill.category === "broadie";
  const isFootage = drill.category === "footage";
  const isPercentage = drill.category === "percentage";
  const isSG = drill.category === "strokes_gained_placeholder";

  const formatAttempt = (a: (typeof attempts)[0], i: number) => {
    if (isSG) {
      return (
        <li
          key={a.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <span className="text-slate-700">
            Hole {a.attempt_number ?? a.hole_group ?? i + 1} · {a.distance_ft ?? "—"} ft
          </span>
          <span className="font-medium text-slate-800">
            {a.putts_to_hole_out ?? "—"} putts
          </span>
        </li>
      );
    }
    if (isFootage || isPercentage) {
      const made = a.is_holed_first_putt === true || a.result_type === "make";
      return (
        <li
          key={a.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <span className="text-slate-700">
            {i + 1}. Hole {a.hole_group ?? "—"} · {a.distance_ft ?? "—"} ft
          </span>
          <span className="font-medium text-slate-800">
            {made ? "Make" : "Miss"}
          </span>
        </li>
      );
    }
    return (
      <li
        key={a.id}
        className="flex items-center justify-between px-4 py-3"
      >
        <span className="text-slate-700">Putts {i + 1}</span>
        <span className="font-medium text-slate-800">
          {a.points_awarded != null && a.points_awarded >= 0 ? "+" : ""}
          {a.points_awarded ?? "—"}
        </span>
      </li>
    );
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
      {isBroadie && (
        <p className="mt-1 text-sm text-slate-500 capitalize">{mode} mode</p>
      )}

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap gap-6">
          {isFootage && (
            <>
              {session.total_score != null && (
                <div>
                  <span className="text-sm text-slate-500">Total holed footage</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.total_score} ft
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-slate-500">Attempts recorded</span>
                <p className="text-2xl font-bold text-slate-800">
                  {session.total_attempts ?? attempts.length}
                </p>
              </div>
            </>
          )}
          {isPercentage && (
            <>
              {session.made_count != null && (
                <div>
                  <span className="text-sm text-slate-500">Made</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.made_count}
                  </p>
                </div>
              )}
              {session.percentage_score != null && (
                <div>
                  <span className="text-sm text-slate-500">Percentage</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.percentage_score}%
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-slate-500">Attempts recorded</span>
                <p className="text-2xl font-bold text-slate-800">
                  {session.total_attempts ?? attempts.length}
                </p>
              </div>
            </>
          )}
          {isSG && (
            <>
              <div>
                <span className="text-sm text-slate-500">Holes entered</span>
                <p className="text-2xl font-bold text-slate-800">
                  {session.total_attempts ?? attempts.length}
                </p>
              </div>
              {session.total_score != null && (
                <div>
                  <span className="text-sm text-slate-500">Total putts</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.total_score}
                  </p>
                </div>
              )}
              {session.benchmark_label && (
                <div>
                  <span className="text-sm text-slate-500">Average distance</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.benchmark_label}
                  </p>
                </div>
              )}
            </>
          )}
          {isBroadie && (
            <>
              {session.total_score != null && (
                <div>
                  <span className="text-sm text-slate-500">Total score</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.total_score}
                  </p>
                </div>
              )}
              {session.attempts_required != null && (
                <div>
                  <span className="text-sm text-slate-500">Attempts required</span>
                  <p className="text-2xl font-bold text-slate-800">
                    {session.attempts_required}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {attempts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-700">
            {isSG ? "Holes" : "Attempts"}
          </h3>
          <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {attempts.map((a, i) => formatAttempt(a, i))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={fetchData}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
        <Link
          to="/history"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View History
        </Link>
        <Link
          to="/drills"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Another drill
        </Link>
      </div>
    </section>
  );
}
