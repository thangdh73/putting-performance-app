import { useEffect, useState } from "react";
import { createUser, deleteUser } from "../api/users";
import { getErrorMessage } from "../lib/apiErrors";
import { useActivePlayer } from "../context/ActivePlayerContext";

export default function Players() {
  const { users, refreshUsers, setActivePlayerId } = useActivePlayer();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removeSuccess, setRemoveSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setAddError("Please enter a player name.");
      return;
    }
    setAddError(null);
    setSubmitting(true);
    try {
      const user = await createUser({ name: trimmed });
      await refreshUsers();
      setActivePlayerId(user.id);
      setName("");
    } catch (e) {
      setAddError(getErrorMessage(e, "Failed to add player"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!removeSuccess) return;
    const t = setTimeout(() => setRemoveSuccess(null), 5000);
    return () => clearTimeout(t);
  }, [removeSuccess]);

  const handleRemove = async (user: { id: number; name: string }) => {
    if (users.length <= 1) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently remove ${user.name}?\n\nThis will also permanently delete all of their sessions and attempts.\n\nThis cannot be undone.`
    );
    if (!confirmed) return;
    setRemoveError(null);
    setRemoveSuccess(null);
    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      await refreshUsers();
      setRemoveSuccess(`${user.name} has been permanently removed.`);
    } catch (e) {
      setRemoveError(getErrorMessage(e, "Failed to remove player"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">Players</h2>
      <p className="mt-2 text-slate-600">
        Add players to track their sessions separately.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="player-name" className="block text-sm font-medium text-slate-700">
          Player name
        </label>
        <input
          id="player-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (addError) setAddError(null);
          }}
          placeholder="e.g. Alex"
          className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:max-w-xs"
          aria-invalid={!!addError}
          aria-describedby={addError ? "player-name-error" : undefined}
          autoComplete="off"
        />
        {addError && (
          <p id="player-name-error" className="mt-2 rounded-lg bg-amber-50 p-3 text-base text-amber-800" role="alert">
            {addError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 min-h-[48px] rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add Player"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-medium text-slate-700">Current players</h3>
        {removeSuccess && (
          <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-base text-emerald-800" role="status">
            {removeSuccess}
          </p>
        )}
        {removeError && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-base text-amber-800" role="alert">
            {removeError}
          </p>
        )}
        {users.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No players yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-800"
              >
                <span>{u.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(u)}
                  disabled={users.length <= 1 || deletingId === u.id}
                  className="min-h-[44px] min-w-[44px] rounded-lg px-4 py-2 text-base font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${u.name}`}
                >
                  {deletingId === u.id ? "Removing…" : "Remove"}
                </button>
              </li>
            ))}
          </ul>
        )}
        {users.length <= 1 && users.length > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            At least one player is required. Add another player to remove this one.
          </p>
        )}
      </div>
    </section>
  );
}
