import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useTickets } from "../../tickets/ticket.hooks";

interface SupportTicketsChartProps {
  data?: any; // optional if someone still wants to override
}

export default function SupportTicketsChart(props: SupportTicketsChartProps) {
  const { data: ticketsData, isLoading } = useTickets();

  const data = ticketsData
    ? [
        {
          name: "Open",
          value: ticketsData.filter(
            (t: any) => t.status?.toUpperCase() === "OPEN",
          ).length,
          color: "#A7CAF1",
        },
        {
          name: "Pending",
          value: ticketsData.filter(
            (t: any) => t.status?.toUpperCase() === "PENDING",
          ).length,
          color: "#0E3158",
        },
        {
          name: "Closed",
          value: ticketsData.filter(
            (t: any) =>
              t.status?.toUpperCase() === "CLOSED" ||
              t.status?.toUpperCase() === "RESOLVED",
          ).length,
          color: "#4B91E2",
        },
      ]
    : props.data || [];

  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Support Tickets
        </h3>
        <div className="h-[220px] bg-gray-100 rounded-full animate-pulse mx-auto w-[220px]" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 self-start">
          Support Tickets
        </h3>
        <div className="text-gray-400">No tickets found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Support Tickets
      </h3>

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={0}
            stroke="none"
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} tickets`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-12 mt-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 mt-10 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs mt-10 text-gray-600 font-medium">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
