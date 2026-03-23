type BroadieResult = "holed" | "two_putt_not_short" | "two_putt_short" | "three_putt";

interface BroadieResultButtonsProps {
  onSelect: (result: BroadieResult) => void;
  disabled?: boolean;
}

const results: { id: BroadieResult; label: string; points: number }[] = [
  { id: "holed", label: "Holed first putt", points: 2 },
  { id: "two_putt_not_short", label: "2 putts, first not short", points: 0 },
  { id: "two_putt_short", label: "2 putts, first short", points: -1 },
  { id: "three_putt", label: "3 putts or worse", points: -3 },
];

export type { BroadieResult };

export default function BroadieResultButtons({
  onSelect,
  disabled,
}: BroadieResultButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      {results.map(({ id, label, points }) => (
        <button
          key={id}
          type="button"
          onPointerDown={(e) => {
            if (e.button === 0 || e.pointerType === "touch") {
              e.preventDefault();
              if (!disabled) onSelect(id);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            if (!disabled) onSelect(id);
          }}
          disabled={disabled}
          className="min-h-[56px] rounded-xl border-2 border-slate-200 bg-white px-6 py-4 text-left text-base font-medium text-slate-800 shadow-sm transition-colors hover:border-emerald-400 hover:bg-emerald-50 active:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="block">{label}</span>
          <span className="mt-1 block text-sm text-slate-500">
            {points >= 0 ? "+" : ""}
            {points} pts
          </span>
        </button>
      ))}
    </div>
  );
}
