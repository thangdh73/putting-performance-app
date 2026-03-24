/**
 * Confirmation modal for player removal.
 * Prevents accidental data loss from removing a player.
 */

interface RemovePlayerConfirmModalProps {
  playerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isRemoving?: boolean;
}

const CONFIRM_MESSAGE = [
  "This will permanently remove the player.",
  "All of their sessions and attempts will also be deleted.",
  "This cannot be undone.",
];

export default function RemovePlayerConfirmModal({
  playerName,
  onConfirm,
  onCancel,
  isRemoving = false,
}: RemovePlayerConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-player-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <h3
          id="remove-player-modal-title"
          className="text-lg font-semibold text-slate-800"
        >
          Remove {playerName}?
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {CONFIRM_MESSAGE.map((line, i) => (
            <li key={i}>• {line}</li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse sm:gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isRemoving}
            className="min-h-[44px] rounded-lg bg-amber-600 px-4 py-3 text-base font-medium text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isRemoving ? "Removing…" : "Remove"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isRemoving}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
