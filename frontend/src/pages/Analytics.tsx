import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getSessions } from "../api/sessions";
import { getDrills } from "../api/drills";
import {
  getBroadieChartData,
  getFootageChartData,
  getPercentageChartData,
  getSGChartData,
} from "../lib/analyticsData";
import type { Session, Drill } from "../types";

export default function Analytics() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const drillMap = Object.fromEntries(drills.map((d) => [d.id, d]));

  const broadieData = getBroadieChartData(sessions, drillMap);
  const footageData = getFootageChartData(sessions, drillMap);
  const percentageData = getPercentageChartData(sessions, drillMap);
  const sgData = getSGChartData(sessions, drillMap);

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .then(() => getDrills())
      .then(setDrills)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
        <p className="mt-4 text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
        <p className="mt-4 text-amber-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setLoading(true);
            getSessions()
              .then(setSessions)
              .then(() => getDrills())
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

  const ChartCard = ({
    title,
    data,
    valueKey,
    unit,
    emptyMessage,
  }: {
    title: string;
    data: { dateLabel: string; value: number; rollingAvg?: number }[];
    valueKey: string;
    unit?: string;
    emptyMessage: string;
  }) => (
    <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <h3 className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="p-4" style={{ minHeight: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickLine={false}
                tickFormatter={(v) => (unit ? `${v}${unit}` : String(v))}
              />
              <Tooltip
                formatter={(value: unknown): React.ReactNode =>
                  unit && typeof value === "number"
                    ? `${value}${unit}`
                    : String(value ?? "")
                }
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 4 }}
                name={valueKey}
              />
              {data.some((d) => d.rollingAvg != null) && (
                <Line
                  type="monotone"
                  dataKey="rollingAvg"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="3-session avg"
                />
              )}
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
      <p className="mt-2 text-slate-600">
        Score trends over time. Rolling average (3 sessions) when available.
      </p>

      <ChartCard
        title="Broadie score trend"
        data={broadieData}
        valueKey="Score"
        emptyMessage="No Broadie sessions yet."
      />

      <ChartCard
        title="100 ft total footage trend"
        data={footageData}
        valueKey="Footage"
        unit=" ft"
        emptyMessage="No 100 ft sessions yet."
      />

      <ChartCard
        title="4–8 ft percentage trend"
        data={percentageData}
        valueKey="Percentage"
        unit="%"
        emptyMessage="No 4–8 ft sessions yet."
      />

      <ChartCard
        title="SG placeholder total putts trend"
        data={sgData}
        valueKey="Putts"
        emptyMessage="No 9/18 hole SG sessions yet."
      />
    </section>
  );
}
