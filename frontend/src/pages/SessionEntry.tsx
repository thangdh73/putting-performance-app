import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getSession, getSessionAttempts, addAttempt } from "../api/sessions";
import { getDrill } from "../api/drills";
import BroadieResultButtons, {
  type BroadieResult,
} from "../components/BroadieResultButtons";
import MakeMissButtons from "../components/MakeMissButtons";
import SGHoleEntry from "../components/SGHoleEntry";
import {
  FOOTAGE_STRUCTURE,
  PERCENTAGE_STRUCTURE,
  TOTAL_ATTEMPTS,
} from "../lib/attemptStructure";
import type { Session, Attempt, Drill } from "../types";

function broadieResultToBody(
  result: BroadieResult,
  attemptNumber: number
): {
  attempt_number: number;
  is_holed_first_putt?: boolean;
  is_first_putt_short?: boolean;
  putts_to_hole_out?: number;
} {
  const base = { attempt_number: attemptNumber };
  switch (result) {
    case "holed":
      return { ...base, is_holed_first_putt: true, putts_to_hole_out: 1 };
    case "two_putt_not_short":
      return {
        ...base,
        is_holed_first_putt: false,
        is_first_putt_short: false,
        putts_to_hole_out: 2,
      };
    case "two_putt_short":
      return {
        ...base,
        is_holed_first_putt: false,
        is_first_putt_short: true,
        putts_to_hole_out: 2,
      };
    case "three_putt":
      return {
        ...base,
        is_holed_first_putt: false,
        putts_to_hole_out: 3,
      };
  }
}

export default function SessionEntry() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const submittingRef = useRef(false);

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

  const isBroadie = drill?.category === "broadie";
  const isFootage = drill?.category === "footage";
  const isPercentage = drill?.category === "percentage";
  const isSG = drill?.category === "strokes_gained_placeholder";

  const targetHoles =
    isSG && drill?.benchmark_json && typeof drill.benchmark_json === "object"
      ? (drill.benchmark_json as { holes?: number }).holes ?? 9
      : 9;
  const mode = (session?.scoring_mode || "average").toLowerCase();
  const isCompletion = mode === "completion";

  const runningTotal = attempts.reduce(
    (sum, a) => sum + (a.points_awarded ?? 0),
    0
  );

  const target =
    isBroadie && drill?.benchmark_json && typeof drill.benchmark_json === "object"
      ? (drill.benchmark_json as { completion_mode?: { target?: number } })
          .completion_mode?.target
      : undefined;

  const isComplete = isBroadie
    ? isCompletion
      ? session?.attempts_required != null
      : attempts.length >= 10
    : isSG
      ? attempts.length >= targetHoles
      : (isFootage || isPercentage) && attempts.length >= TOTAL_ATTEMPTS;

  const attemptStructure = isFootage
    ? FOOTAGE_STRUCTURE
    : isPercentage
      ? PERCENTAGE_STRUCTURE
      : null;
  const nextAttempt = attemptStructure?.[attempts.length];

  const handleMakeMiss = async (made: boolean) => {
    if (!session || !nextAttempt || saving || isComplete) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const body = {
        attempt_number: attempts.length + 1,
        hole_group: nextAttempt.hole_group,
        distance_ft: nextAttempt.distance_ft,
        is_holed_first_putt: made,
        result_type: made ? "make" : "miss",
      };
      await addAttempt(session.id, body);

      const [updatedSession, updatedAttempts] = await Promise.all([
        getSession(session.id),
        getSessionAttempts(session.id),
      ]);
      setSession(updatedSession);
      setAttempts(updatedAttempts);

      if (updatedAttempts.length >= TOTAL_ATTEMPTS) {
        navigate(`/sessions/${session.id}/summary`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save attempt");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleSGHole = async (distanceFt: number, putts: number) => {
    if (!session || !isSG || saving || isComplete) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const holeNumber = attempts.length + 1;
      const body = {
        attempt_number: holeNumber,
        hole_group: holeNumber,
        distance_ft: distanceFt,
        putts_to_hole_out: putts,
      };
      await addAttempt(session.id, body);

      const [updatedSession, updatedAttempts] = await Promise.all([
        getSession(session.id),
        getSessionAttempts(session.id),
      ]);
      setSession(updatedSession);
      setAttempts(updatedAttempts);

      if (updatedAttempts.length >= targetHoles) {
        navigate(`/sessions/${session.id}/summary`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save hole");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleResult = async (result: BroadieResult) => {
    if (!session || !isBroadie || saving || isComplete) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const body = broadieResultToBody(result, attempts.length + 1);
      await addAttempt(session.id, body);

      const [updatedSession, updatedAttempts] = await Promise.all([
        getSession(session.id),
        getSessionAttempts(session.id),
      ]);
      setSession(updatedSession);
      setAttempts(updatedAttempts);

      const nowComplete = isCompletion
        ? updatedSession.attempts_required != null
        : updatedAttempts.length >= 10;

      if (nowComplete) {
        navigate(`/sessions/${session.id}/summary`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save attempt");
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Session Entry</h2>
        <p className="mt-4 text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error || !session || !drill) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Session Entry</h2>
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
            ← History
          </Link>
          <Link to="/drills" className="text-sm text-emerald-600 hover:underline">
            Drill Library
          </Link>
        </div>
      </section>
    );
  }

  if (!isBroadie && !isFootage && !isPercentage && !isSG) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Session Entry</h2>
        <p className="mt-4 text-slate-600">
          Session entry for {drill.name} is not yet supported.
        </p>
        <Link
          to="/drills"
          className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
        >
          ← Back to Drill Library
        </Link>
      </section>
    );
  }

  if (isFootage || isPercentage) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <span className="text-sm text-slate-500">Attempts</span>
            <p className="text-2xl font-bold text-slate-800">
              {attempts.length} / {TOTAL_ATTEMPTS}
            </p>
          </div>
          {isFootage && (
            <div>
              <span className="text-sm text-slate-500">Holed footage</span>
              <p className="text-2xl font-bold text-slate-800">
                {session.total_score ?? 0} ft
              </p>
            </div>
          )}
          {isPercentage && (
            <>
              <div>
                <span className="text-sm text-slate-500">Made</span>
                <p className="text-2xl font-bold text-slate-800">
                  {session.made_count ?? 0}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-500">Percentage</span>
                <p className="text-2xl font-bold text-slate-800">
                  {session.percentage_score ?? 0}%
                </p>
              </div>
            </>
          )}
        </div>

        {nextAttempt ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700">Next putt</h3>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              Hole {nextAttempt.hole_group} · {nextAttempt.distance_ft} ft
            </p>
            <div className="mt-4">
              <MakeMissButtons
                onMake={() => handleMakeMiss(true)}
                onMiss={() => handleMakeMiss(false)}
                disabled={saving || isComplete}
              />
            </div>
          </div>
        ) : (
          <p className="mt-6 text-slate-600">Session complete.</p>
        )}

        <Link
          to="/drills"
          className="mt-8 inline-block text-sm text-emerald-600 hover:underline"
        >
          ← Cancel (back to Drill Library)
        </Link>
      </section>
    );
  }

  if (isSG) {
    const nextHole = attempts.length + 1;
    const canAddMore = attempts.length < targetHoles;

    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          MVP: store distance and putts. Full strokes gained later.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <span className="text-sm text-slate-500">Holes entered</span>
            <p className="text-2xl font-bold text-slate-800">
              {attempts.length} / {targetHoles}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500">Total putts</span>
            <p className="text-2xl font-bold text-slate-800">
              {session.total_score ?? 0}
            </p>
          </div>
          {session.benchmark_label && (
            <div>
              <span className="text-sm text-slate-500">Avg distance</span>
              <p className="text-2xl font-bold text-slate-800">
                {session.benchmark_label}
              </p>
            </div>
          )}
        </div>

        {canAddMore ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700">
              Hole {nextHole}
            </h3>
            <SGHoleEntry
              onRecord={handleSGHole}
              disabled={saving || isComplete}
            />
          </div>
        ) : (
          <p className="mt-6 text-slate-600">Session complete.</p>
        )}

        <Link
          to="/drills"
          className="mt-8 inline-block text-sm text-emerald-600 hover:underline"
        >
          ← Cancel (back to Drill Library)
        </Link>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
      <p className="mt-1 text-sm text-slate-500 capitalize">{mode} mode</p>

      <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <span className="text-sm text-slate-500">Attempts</span>
          <p className="text-2xl font-bold text-slate-800">{attempts.length}</p>
        </div>
        <div>
          <span className="text-sm text-slate-500">Running total</span>
          <p className="text-2xl font-bold text-slate-800">{runningTotal}</p>
        </div>
        {isCompletion && target != null && (
          <div>
            <span className="text-sm text-slate-500">Target</span>
            <p className="text-2xl font-bold text-slate-800">{target}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-700">Result</h3>
        <p className="mt-1 text-sm text-slate-500">
          Tap the outcome of this putt
        </p>
        <div className="mt-4">
          <BroadieResultButtons
            onSelect={handleResult}
            disabled={saving || isComplete}
          />
        </div>
      </div>

      <Link
        to="/drills"
        className="mt-8 inline-block text-sm text-emerald-600 hover:underline"
      >
        ← Cancel (back to Drill Library)
      </Link>
    </section>
  );
}
