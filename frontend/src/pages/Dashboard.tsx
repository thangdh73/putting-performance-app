import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
      <p className="mt-2 text-slate-600">
        Quick access to start a drill or view recent activity.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/drills"
          className="flex min-h-[56px] items-center justify-center rounded-lg bg-emerald-600 px-6 py-4 text-center text-base font-medium text-white hover:bg-emerald-700"
        >
          Choose a drill
        </Link>
        <Link
          to="/history"
          className="flex min-h-[56px] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-4 text-center text-base font-medium text-slate-700 hover:bg-slate-50"
        >
          View history
        </Link>
      </div>
    </section>
  );
}
