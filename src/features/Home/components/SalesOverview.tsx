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
import { useDashboardReport } from "../dashboard.hooks";

export default function SalesOverviewChart() {
  const { data: report, isLoading } = useDashboardReport();
  const data = report?.salesOverview;

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
        <div className="h-5 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
        <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  /* ── Empty state ── */
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sales Overview
        </h3>
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          No sales data available yet.
        </div>
      </div>
    );
  }

  /* ── Chart ── */
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales Overview
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            formatter={(value: number, name: string) => [
              name === "revenue" ? `$${value.toLocaleString()}` : value,
              name === "orders" ? "Orders" : "Revenue ($)",
            ]}
          />
          <Legend
            formatter={(value: string) =>
              value === "orders" ? "Orders" : "Revenue ($)"
            }
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#1e3a5f"
            strokeWidth={2}
            dot={{ fill: "#1e3a5f", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
