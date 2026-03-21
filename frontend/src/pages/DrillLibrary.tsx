import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDrills } from "../api/drills";
import type { Drill } from "../types";

export default function DrillLibrary() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrills()
      .then(setDrills)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
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
        <p className="mt-4 text-amber-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            getDrills()
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
      <h2 className="text-xl font-semibold text-slate-800">Drill Library</h2>
      <p className="mt-2 text-slate-600">
        Choose a drill to view details and start a session.
      </p>
      <ul className="mt-6 flex flex-col gap-3">
        {drills.map((drill) => (
          <li key={drill.id}>
            <Link
              to={`/drills/${drill.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-300 hover:bg-slate-50"
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
