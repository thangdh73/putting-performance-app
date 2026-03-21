import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDrill } from "../api/drills";
import { getUsers } from "../api/users";
import { createSession } from "../api/sessions";
import type { Drill } from "../types";

export default function DrillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [drill, setDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoringMode, setScoringMode] = useState<"average" | "completion">(
    "average"
  );
  const [starting, setStarting] = useState(false);
  const submittingRef = useRef(false);

  const fetchData = useCallback(() => {
    if (!id) {
      setError("Invalid drill");
      setLoading(false);
      return;
    }
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId < 1) {
      setError("Invalid drill");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    getDrill(numId)
      .then(setDrill)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isBroadie = drill?.category === "broadie";
  const isFootage = drill?.category === "footage";
  const isPercentage = drill?.category === "percentage";
  const isSG = drill?.category === "strokes_gained_placeholder";
  const canStartSession = isBroadie || isFootage || isPercentage || isSG;

  const handleStartSession = async () => {
    if (!drill || !canStartSession) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStarting(true);
    try {
      const users = await getUsers();
      const userId = users[0]?.id ?? 1;
      const session = await createSession({
        user_id: userId,
        drill_id: drill.id,
        session_date: new Date().toISOString(),
        scoring_mode: isBroadie ? scoringMode : undefined,
      });
      navigate(`/sessions/${session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start session");
    } finally {
      submittingRef.current = false;
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Drill Detail</h2>
        <p className="mt-4 text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error || !drill) {
    const validId =
      id != null &&
      Number.isInteger(parseInt(id, 10)) &&
      parseInt(id, 10) >= 1;
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Drill Detail</h2>
        <p className="mt-4 text-amber-700">{error ?? "Drill not found"}</p>
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
          <Link to="/drills" className="text-sm text-emerald-600 hover:underline">
            ← Back to Drill Library
          </Link>
        </div>
      </section>
    );
  }

  const benchmark = drill.benchmark_json as {
    completion_mode?: { target?: number };
    average_mode?: { best?: number; average?: number; worst?: number };
  } | null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
      {drill.description && (
        <p className="mt-2 text-slate-600">{drill.description}</p>
      )}
      {drill.instructions_markdown && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-700">Instructions</h3>
          <p className="mt-2 text-sm text-slate-600">
            {drill.instructions_markdown}
          </p>
        </div>
      )}

      {canStartSession ? (
        <div className="mt-6">
          {isBroadie && (
            <>
              <h3 className="text-sm font-medium text-slate-700">Scoring mode</h3>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    checked={scoringMode === "average"}
                    onChange={() => setScoringMode("average")}
                    className="h-4 w-4"
                  />
                  <span className="text-slate-700">Average</span>
                  <span className="text-sm text-slate-500">
                    (10 putts, sum points)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="mode"
                    checked={scoringMode === "completion"}
                    onChange={() => setScoringMode("completion")}
                    className="h-4 w-4"
                  />
                  <span className="text-slate-700">Completion</span>
                  <span className="text-sm text-slate-500">
                    (until target
                    {benchmark?.completion_mode?.target != null
                      ? ` ${benchmark.completion_mode.target}`
                      : ""}
                    )
                  </span>
                </label>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={handleStartSession}
            disabled={starting}
            className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-4 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {starting ? "Starting…" : "Start Session"}
          </button>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">
          Session entry for this drill type is not yet supported.
        </div>
      )}

      <Link
        to="/drills"
        className="mt-6 inline-block text-sm text-emerald-600 hover:underline"
      >
        ← Back to Drill Library
      </Link>
    </section>
  );
}
