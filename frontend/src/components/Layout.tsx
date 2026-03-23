import { Link, Outlet } from "react-router-dom";
import { useActivePlayer } from "../context/ActivePlayerContext";
import Nav from "./Nav";

export default function Layout() {
  const { users, activePlayer, loading, usersError, setActivePlayerId, refreshUsers, clearUsersError } = useActivePlayer();

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-900"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {usersError && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3" role="alert">
          <p className="text-sm font-medium text-amber-800">{usersError}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                clearUsersError();
                refreshUsers();
              }}
              className="min-h-[44px] rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 active:bg-amber-200"
            >
              Retry
            </button>
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 active:bg-amber-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-lg font-semibold tracking-tight">
              Putting Performance
            </h1>
            {!loading && users.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Player:</span>
                <select
                  value={activePlayer?.id ?? users[0]?.id ?? ""}
                  onChange={(e) =>
                    setActivePlayerId(parseInt(e.target.value, 10))
                  }
                  className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  aria-label="Select active player"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
        <Nav />
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
    </div>
  );
}
