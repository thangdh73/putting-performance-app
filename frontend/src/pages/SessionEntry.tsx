import { useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { addAttempt } from "../api/sessions";
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
import { useSessionData } from "../hooks/useSessionData";
import { getErrorMessage } from "../lib/apiErrors";

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
  const { session, drill, attempts, loading, error, setError, validId, fetchData } =
    useSessionData(sessionId);
  const [saving, setSaving] = useState(false);
  const [showExtraPracticeEntry, setShowExtraPracticeEntry] = useState(false);
  const submittingRef = useRef(false);

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

  const isOfficialComplete = session?.official_attempts_count != null;
  const officialCount = session?.official_attempts_count ?? 0;
  const extraAttemptsCount = isOfficialComplete
    ? Math.max(0, attempts.length - officialCount)
    : 0;

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
  const nextAttempt = attemptStructure
    ? attemptStructure[attempts.length % attemptStructure.length]
    : null;

  const handleMakeMiss = async (made: boolean) => {
    if (!session || !nextAttempt || saving) return;
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
      fetchData();
    } catch (e) {
      setError(getErrorMessage(e, "Failed to save attempt"));
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleSGHole = async (distanceFt: number, putts: number) => {
    if (!session || !isSG || saving) return;
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
      fetchData();
    } catch (e) {
      setError(getErrorMessage(e, "Failed to save hole"));
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };

  const handleResult = async (result: BroadieResult) => {
    if (!session || !isBroadie || saving) return;
    if (isComplete && !showExtraPracticeEntry) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    try {
      const body = broadieResultToBody(result, attempts.length + 1);
      await addAttempt(session.id, body);
      fetchData();
    } catch (e) {
      setError(getErrorMessage(e, "Failed to save attempt"));
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
        <p className="mt-4 text-amber-700" role="alert">{error ?? "Session not found"}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {validId && (
            <button
              type="button"
              onClick={fetchData}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Retry
            </button>
          )}
          <Link to="/" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
            Dashboard
          </Link>
          <Link to="/history" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
            History
          </Link>
          <Link to="/drills" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
            Drill Library
          </Link>
        </div>
      </section>
    );
  }

  const CompletionChoice = () => (
    <div className="mt-6 space-y-4 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
      <p className="font-medium text-emerald-800">Official score recorded</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowExtraPracticeEntry(true)}
          className="min-h-[48px] rounded-lg border border-emerald-600 bg-white px-5 py-3 text-base font-medium text-emerald-700 hover:bg-emerald-50"
        >
          Add more putts
        </button>
        <Link
          to={`/sessions/${session!.id}/summary`}
          className="inline-flex min-h-[48px] items-center rounded-lg bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          End session
        </Link>
      </div>
    </div>
  );

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
    const inExtraPractice = isOfficialComplete && showExtraPracticeEntry;
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>

        {inExtraPractice && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">
              Official score locked · Extra practice: {extraAttemptsCount} putts
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <span className="text-sm text-slate-500">Attempts</span>
            <p className="text-2xl font-bold text-slate-800">
              {inExtraPractice ? attempts.length : `${attempts.length} / ${TOTAL_ATTEMPTS}`}
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

        {isOfficialComplete && !showExtraPracticeEntry ? (
          <CompletionChoice />
        ) : nextAttempt ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700">
              {inExtraPractice ? "Extra putt" : "Next putt"}
            </h3>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              Hole {nextAttempt.hole_group} · {nextAttempt.distance_ft} ft
            </p>
            <div className="mt-4">
              <MakeMissButtons
                onMake={() => handleMakeMiss(true)}
                onMiss={() => handleMakeMiss(false)}
                disabled={saving}
              />
            </div>
          </div>
        ) : null}

        {!isOfficialComplete && (
          <Link
            to="/drills"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Cancel (back to Drill Library)
          </Link>
        )}
        {inExtraPractice && (
          <div className="mt-6">
            <Link
              to={`/sessions/${session.id}/summary`}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              End session
            </Link>
          </div>
        )}
      </section>
    );
  }

  if (isSG) {
    const nextHole = attempts.length + 1;
    const sgInExtraPractice = isOfficialComplete && showExtraPracticeEntry;
    const sgResuming = !isOfficialComplete && attempts.length > 0;
    const canAddMore =
      attempts.length < targetHoles || sgInExtraPractice;

    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          MVP: store distance and putts. Full strokes gained later.
        </p>
        {sgResuming && (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            In progress — {attempts.length} of {targetHoles} holes recorded
          </p>
        )}

        {sgInExtraPractice && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-800">
              Official score locked · Extra practice: {extraAttemptsCount} putts
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <span className="text-sm text-slate-500">Holes entered</span>
            <p className="text-2xl font-bold text-slate-800">
              {sgInExtraPractice ? attempts.length : `${attempts.length} / ${targetHoles}`}
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

        {isOfficialComplete && !showExtraPracticeEntry ? (
          <CompletionChoice />
        ) : canAddMore ? (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700">
              {sgInExtraPractice ? "Extra hole" : `Hole ${nextHole}`}
            </h3>
            <SGHoleEntry
              onRecord={handleSGHole}
              disabled={saving}
            />
          </div>
        ) : null}

        {!isOfficialComplete && (
          <Link
            to="/drills"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Cancel (back to Drill Library)
          </Link>
        )}
        {sgInExtraPractice && (
          <div className="mt-6">
            <Link
              to={`/sessions/${session.id}/summary`}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              End session
            </Link>
          </div>
        )}
      </section>
    );
  }

  const broadieInExtraPractice = isOfficialComplete && showExtraPracticeEntry;
  const broadieResuming = !isOfficialComplete && attempts.length > 0;
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
      <p className="mt-1 text-sm text-slate-500 capitalize">{mode} mode</p>
      {broadieResuming && (
        <p className="mt-2 text-sm font-medium text-emerald-700">
          In progress — {attempts.length}
          {isCompletion && target != null ? ` putts · ${runningTotal} pts (target ${target})` : " of 10 attempts"}
        </p>
      )}

      {broadieInExtraPractice && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Official score locked · Extra practice: {extraAttemptsCount} putts
          </p>
        </div>
      )}

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

      {isOfficialComplete && !showExtraPracticeEntry ? (
        <CompletionChoice />
      ) : (
        <>
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-700">Result</h3>
            <p className="mt-1 text-sm text-slate-500">
              Tap the outcome of this putt
            </p>
            <div className="mt-4">
              <BroadieResultButtons
                onSelect={handleResult}
                disabled={saving}
              />
            </div>
          </div>

          {!isOfficialComplete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate("/drills");
              }}
              className="mt-8 inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Cancel (back to Drill Library)
            </button>
          )}
          {broadieInExtraPractice && (
            <div className="mt-6">
              <Link
                to={`/sessions/${session.id}/summary`}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                End session
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
