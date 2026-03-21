interface MakeMissButtonsProps {
  onMake: () => void;
  onMiss: () => void;
  disabled?: boolean;
}

export default function MakeMissButtons({
  onMake,
  onMiss,
  disabled,
}: MakeMissButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onMake}
        disabled={disabled}
        className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-6 py-5 text-lg font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 active:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Make
      </button>
      <button
        type="button"
        onClick={onMiss}
        disabled={disabled}
        className="rounded-xl border-2 border-slate-200 bg-slate-50 px-6 py-5 text-lg font-semibold text-slate-700 transition-colors hover:bg-slate-100 active:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Miss
      </button>
    </div>
  );
}
