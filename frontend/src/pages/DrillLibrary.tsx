import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDrills } from "../api/drills";
import { getErrorMessage } from "../lib/apiErrors";
import type { Drill } from "../types";

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrills()
      .then(setDrills)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Drill Library</h2>
        <p className="mt-4 text-slate-500">Loading drills…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Drill Library</h2>
        <p className="mt-4 text-amber-700" role="alert">{error}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              getDrills()
                .then(setDrills)
                .catch((e) => setError(getErrorMessage(e)))
                .finally(() => setLoading(false));
            }}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Retry
          </button>
          <Link to="/" className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
            Dashboard
          </Link>
        </div>
      </section>
    );
  }

  if (drills.length === 0) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Drill Library</h2>
        <p className="mt-4 text-slate-600">
          No drills available. The app may still be loading data.
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            getDrills()
              .then(setDrills)
              .catch((e) => setError(getErrorMessage(e)))
              .finally(() => setLoading(false));
          }}
          className="mt-4 min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">Drill Library</h2>
      <p className="mt-2 text-slate-600">
        Choose a drill to view details and start a session.
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {drills.map((drill) => (
          <li key={drill.id}>
            <Link
              to={`/drills/${drill.id}`}
              className="block min-h-[64px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300 hover:bg-slate-50 active:bg-slate-100"
            >
              <span className="font-medium text-slate-800">{drill.name}</span>
              {drill.description && (
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {drill.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
