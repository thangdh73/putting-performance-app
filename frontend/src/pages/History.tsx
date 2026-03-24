import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteSession } from "../api/sessions";
import { getErrorMessage } from "../lib/apiErrors";
import DeleteSessionConfirmModal from "../components/DeleteSessionConfirmModal";
import {
  getSessionSummary,
  getPartialSessionLabel,
  getCompletedWithExtraLabel,
  isPartialSession,
  isCompletedWithExtra,
  DRILL_CATEGORY_FILTERS,
  filterSessionsByCategory,
} from "../lib/sessionDisplay";
import { useActivePlayer } from "../context/ActivePlayerContext";
import { useSessionsWithDrills } from "../hooks/useSessionsWithDrills";

export default function History() {
  const { users } = useActivePlayer();
  const [playerFilter, setPlayerFilter] = useState<string>("");
  const [filter, setFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const {
    sessions,
    drillMap,
    loading,
    error,
    refetch,
  } = useSessionsWithDrills(playerFilter);
  const filtered = filterSessionsByCategory(sessions, drillMap, filter).filter(
    (s) => {
      const attempts = s.total_attempts ?? 0;
      const isComplete = s.official_attempts_count != null;
      return isComplete || attempts > 0;
    }
  );

  const handleConfirmDelete = async () => {
    if (deletingId == null) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSession(deletingId);
      setDeletingId(null);
      refetch();
    } catch (e) {
      setDeleteError(getErrorMessage(e, "Failed to delete session"));
    } finally {
      setDeleting(false);
    }
  };

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
        <p className="mt-4 text-amber-700" role="alert">{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refetch}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Retry
          </button>
          <Link to="/drills" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
            Drill Library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      {deletingId != null && (
        <DeleteSessionConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setDeletingId(null);
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
      <h2 className="text-xl font-semibold text-slate-800">History</h2>
      <p className="mt-2 text-slate-600">
        Past sessions. Tap in-progress to resume, completed to view summary.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div className="flex-1">
          <label htmlFor="player-filter" className="block text-sm font-medium text-slate-700">
            Player
          </label>
          <select
            id="player-filter"
            value={playerFilter}
            onChange={(e) => setPlayerFilter(e.target.value)}
            className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            aria-label="Filter by player"
          >
            <option value="">All players</option>
            {users.map((u) => (
              <option key={u.id} value={String(u.id)}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
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
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-600">
            {sessions.length === 0
              ? "No sessions yet. Start a drill to record your first session."
              : "No sessions match this filter. Try a different filter or start a drill."}
          </p>
          <Link
            to="/drills"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700"
          >
            {sessions.length === 0 ? "Start a drill" : "Drill Library"}
          </Link>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {filtered.map((s) => {
            const drill = drillMap[s.drill_id] ?? null;
            const partial = isPartialSession(s);
            const to = partial
              ? `/sessions/${s.id}`
              : `/sessions/${s.id}/summary`;
            const subLabel = partial
              ? getPartialSessionLabel(s, drill)
              : (() => {
                  const { mainScore, attemptsLabel } = getSessionSummary(s, drill);
                  const parts = [new Date(s.session_date).toLocaleDateString()];
                  if (mainScore !== "—") parts.push(mainScore);
                  if (attemptsLabel) parts.push(attemptsLabel);
                  if (isCompletedWithExtra(s)) parts.push(getCompletedWithExtraLabel(s));
                  return parts.join(" · ");
                })();
            return (
              <li key={s.id} className="flex items-stretch gap-2">
                <Link
                  to={to}
                  className="min-h-[60px] flex-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 active:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">
                    {drill?.name ?? `Drill #${s.drill_id}`}
                  </span>
                  <p className="mt-1 text-sm text-slate-500">
                    {partial ? (
                      <>
                        {new Date(s.session_date).toLocaleDateString()} · {subLabel}
                      </>
                    ) : (
                      subLabel
                    )}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setDeletingId(s.id);
                  }}
                  className="min-h-[60px] shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-red-700 hover:bg-red-50"
                  aria-label={`Delete session ${drill?.name ?? s.id}`}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
