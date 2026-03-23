import { useState } from "react";
import { Link } from "react-router-dom";
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
import {
  getBroadieChartData,
  getFootageChartData,
  getPercentageChartData,
  getSGChartData,
} from "../lib/analyticsData";
import { useActivePlayer } from "../context/ActivePlayerContext";
import { useSessionsWithDrills } from "../hooks/useSessionsWithDrills";

const CHART_TICK_FONT_SIZE = 12;
const CHART_HEIGHT = 220;

function AnalyticsChartCard({
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
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h3 className="border-b border-slate-100 px-4 py-3 text-base font-medium text-slate-800">
        {title}
      </h3>
      {data.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center px-4 py-8">
          <p className="text-center text-sm text-slate-500">{emptyMessage}</p>
          <Link
            to="/drills"
            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Start a drill →
          </Link>
        </div>
      ) : (
        <div className="p-4 sm:p-5" style={{ minHeight: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: CHART_TICK_FONT_SIZE, fill: "#475569" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: CHART_TICK_FONT_SIZE, fill: "#475569" }}
                tickLine={false}
                tickFormatter={(v) => (unit ? `${v}${unit}` : String(v))}
                width={36}
              />
              <Tooltip
                formatter={(value: unknown): React.ReactNode =>
                  unit && typeof value === "number"
                    ? `${value}${unit}`
                    : String(value ?? "")
                }
                labelFormatter={(label) => label}
                contentStyle={{
                  fontSize: 14,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
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
              <Legend
                wrapperStyle={{ fontSize: CHART_TICK_FONT_SIZE }}
                iconSize={10}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { users } = useActivePlayer();
  const [playerFilter, setPlayerFilter] = useState<string>("");
  const {
    sessions,
    drillMap,
    loading,
    error,
    refetch,
  } = useSessionsWithDrills(playerFilter, { officialOnly: true });

  const broadieData = getBroadieChartData(sessions, drillMap);
  const footageData = getFootageChartData(sessions, drillMap);
  const percentageData = getPercentageChartData(sessions, drillMap);
  const sgData = getSGChartData(sessions, drillMap);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
        <p className="text-slate-500">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
        <p className="text-amber-700" role="alert">
          {error}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refetch}
            className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Retry
          </button>
          <Link
            to="/drills"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Drill Library
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Analytics</h2>
        <p className="mt-2 text-slate-600">
          Score trends over time. Rolling average (3 sessions) when available.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Scores use official putts only — extra practice putts are excluded.
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            No sessions yet. Start a drill to see your trends.
          </p>
          <Link
            to="/drills"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-emerald-600 px-5 py-3 text-base font-medium text-white hover:bg-emerald-700"
          >
            Start a drill
          </Link>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-3 text-sm font-medium text-slate-700">Filters</h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="analytics-player-filter"
                  className="block text-sm font-medium text-slate-700"
                >
                  Player
                </label>
                <select
                  id="analytics-player-filter"
                  value={playerFilter}
                  onChange={(e) => setPlayerFilter(e.target.value)}
                  className="mt-1 min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  aria-label="Filter charts by player"
                >
                  <option value="">All players</option>
                  {users.map((u) => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} in
              view
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-base font-medium text-slate-800">
              Score trends
            </h3>
            <div className="flex flex-col gap-6">
              <AnalyticsChartCard
                title="Broadie — score over time"
                data={broadieData}
                valueKey="Score"
                emptyMessage="Record a Broadie drill (5/10/15 ft) to see your score trend."
              />
              <AnalyticsChartCard
                title="100 ft — total footage over time"
                data={footageData}
                valueKey="Footage"
                unit=" ft"
                emptyMessage="Record a 100 ft Performance drill to see your footage trend."
              />
              <AnalyticsChartCard
                title="4–8 ft — percentage over time"
                data={percentageData}
                valueKey="Percentage"
                unit="%"
                emptyMessage="Record a 4–8 ft drill to see your percentage trend."
              />
              <AnalyticsChartCard
                title="SG (9/18 hole) — total putts over time"
                data={sgData}
                valueKey="Putts"
                emptyMessage="Record a 9- or 18-hole SG drill to see your putts trend."
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
