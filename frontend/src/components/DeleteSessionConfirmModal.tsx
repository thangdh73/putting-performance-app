/**
 * Confirmation modal for session deletion.
 * Shows required warnings before the user confirms.
 */

interface DeleteSessionConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const CONFIRM_MESSAGE = [
  "The session will be permanently deleted.",
  "All attempts for that session will also be deleted.",
  "This cannot be undone.",
];

export default function DeleteSessionConfirmModal({
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteSessionConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg">
        <h3
          id="delete-modal-title"
          className="text-lg font-semibold text-slate-800"
        >
          Delete session?
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
            disabled={isDeleting}
            className="min-h-[44px] rounded-lg bg-red-600 px-4 py-3 text-base font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
