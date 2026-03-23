import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSessionData } from "../hooks/useSessionData";
import { deleteSession } from "../api/sessions";
import { isPartialSession } from "../lib/sessionDisplay";
import { getErrorMessage } from "../lib/apiErrors";
import DeleteSessionConfirmModal from "../components/DeleteSessionConfirmModal";

export default function SessionSummary() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
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
            View History
          </Link>
          <Link to="/drills" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
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
  const partial = isPartialSession(session);

  const officialCount = session.official_attempts_count ?? attempts.length;

  const handleConfirmDelete = async () => {
    if (!session) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSession(session.id);
      navigate("/history");
    } catch (e) {
      setDeleteError(getErrorMessage(e, "Failed to delete session"));
    } finally {
      setDeleting(false);
    }
  };
  const extraCount = Math.max(0, attempts.length - officialCount);

  const formatAttempt = (a: (typeof attempts)[0], i: number) => {
    if (isSG) {
      return (
        <li
          key={a.id}
          className="flex min-h-[48px] items-center justify-between px-4 py-3"
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
          className="flex min-h-[48px] items-center justify-between px-4 py-3"
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
        className="flex min-h-[48px] items-center justify-between px-4 py-3"
      >
        <span className="text-slate-700">Putts {i + 1}</span>
        <span className="font-medium text-slate-800">
          {a.points_awarded != null && a.points_awarded >= 0 ? "+" : ""}
          {a.points_awarded ?? "—"}
        </span>
      </li>
    );
  };

  if (partial) {
    return (
      <>
        {showDeleteConfirm && (
          <DeleteSessionConfirmModal
            onConfirm={handleConfirmDelete}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeleteError(null);
            }}
            isDeleting={deleting}
          />
        )}
        {deleteError && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3" role="alert">
            <p className="text-sm text-amber-800">{deleteError}</p>
          </div>
        )}
        <section>
          <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
          {isBroadie && (
            <p className="mt-1 text-sm text-slate-500 capitalize">{mode} mode</p>
          )}
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/80 p-6">
            <p className="font-medium text-emerald-800">In progress</p>
            <p className="mt-2 text-sm text-slate-600">
              This session has {attempts.length} attempt{attempts.length !== 1 ? "s" : ""} recorded.
              Tap below to resume and continue.
            </p>
            <Link
              to={`/sessions/${session.id}`}
              className="mt-4 inline-flex min-h-[48px] items-center rounded-lg bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700"
            >
              Resume session
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/history"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              View History
            </Link>
            <Link
              to="/drills"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Drill Library
            </Link>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="min-h-[44px] rounded-lg border border-red-200 bg-white px-4 py-3 text-base font-medium text-red-700 hover:bg-red-50"
            >
              Delete session
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {showDeleteConfirm && (
        <DeleteSessionConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteError(null);
          }}
          isDeleting={deleting}
        />
      )}
      {deleteError && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3" role="alert">
          <p className="text-sm text-amber-800">{deleteError}</p>
        </div>
      )}
    <section>
      <h2 className="text-xl font-semibold text-slate-800">{drill.name}</h2>
      {isBroadie && (
        <p className="mt-1 text-sm text-slate-500 capitalize">{mode} mode</p>
      )}

      {extraCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            Extra practice: {extraCount} putts
          </p>
        </div>
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

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={fetchData}
          className="min-h-[48px] rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
        <Link
          to="/history"
          className="inline-flex min-h-[48px] items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          View History
        </Link>
        <Link
          to="/drills"
          className="inline-flex min-h-[48px] items-center rounded-lg bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700"
        >
          Another drill
        </Link>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="min-h-[48px] rounded-lg border border-red-200 bg-white px-5 py-3 text-base font-medium text-red-700 hover:bg-red-50"
        >
          Delete session
        </button>
      </div>
    </section>
    </>
  );
}
