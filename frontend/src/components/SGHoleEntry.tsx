import { useState } from "react";

const MAX_DISTANCE_FT = 200;
const MIN_DISTANCE_FT = 0;
const MIN_PUTTS = 1;
const MAX_PUTTS = 10;

interface SGHoleEntryProps {
  onRecord: (distanceFt: number, putts: number) => void;
  disabled?: boolean;
}

export default function SGHoleEntry({ onRecord, disabled }: SGHoleEntryProps) {
  const [distance, setDistance] = useState("");
  const [putts, setPutts] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    setValidationError(null);
    const d = parseFloat(distance);
    const p = parseInt(putts, 10);
    if (isNaN(d) || d < MIN_DISTANCE_FT || d > MAX_DISTANCE_FT) {
      setValidationError(`Distance must be ${MIN_DISTANCE_FT}–${MAX_DISTANCE_FT} ft`);
      return;
    }
    if (
      isNaN(p) ||
      !Number.isInteger(p) ||
      p < MIN_PUTTS ||
      p > MAX_PUTTS ||
      Number(putts) !== Math.floor(Number(putts))
    ) {
      setValidationError(`Putts must be a whole number ${MIN_PUTTS}–${MAX_PUTTS}`);
      return;
    }
    onRecord(d, p);
    setDistance("");
    setPutts("");
  };

  const d = parseFloat(distance);
  const p = parseInt(putts, 10);
  const isValid =
    distance !== "" &&
    putts !== "" &&
    !isNaN(d) &&
    d >= MIN_DISTANCE_FT &&
    d <= MAX_DISTANCE_FT &&
    !isNaN(p) &&
    Number.isInteger(p) &&
    p >= MIN_PUTTS &&
    p <= MAX_PUTTS &&
    Number(putts) === Math.floor(Number(putts));

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="sg-distance"
          className="block text-sm font-medium text-slate-700"
        >
          Distance (ft)
        </label>
        <input
          id="sg-distance"
          type="number"
          inputMode="decimal"
          min={0}
          max={MAX_DISTANCE_FT}
          step={0.5}
          value={distance}
          onChange={(e) => {
            setDistance(e.target.value);
            setValidationError(null);
          }}
          placeholder="e.g. 15"
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
        />
      </div>
      <div>
        <label
          htmlFor="sg-putts"
          className="block text-sm font-medium text-slate-700"
        >
          Putts
        </label>
        <input
          id="sg-putts"
          type="number"
          inputMode="numeric"
          min={MIN_PUTTS}
          max={MAX_PUTTS}
          value={putts}
          onChange={(e) => {
            setPutts(e.target.value);
            setValidationError(null);
          }}
          placeholder="e.g. 2"
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-lg focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
        />
      </div>
      {validationError && (
        <p className="text-sm text-amber-700" role="alert">
          {validationError}
        </p>
      )}
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-lg font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        Record hole
      </button>
    </form>
  );
}
