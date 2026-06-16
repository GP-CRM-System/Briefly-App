import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDashboardData } from "../dashboard.hooks";
import type { SalesDataPoint, TicketBreakdown, DashboardCustomerEvent } from "../types";

/* ── Donut chart palette ── */
const DONUT_COLORS = ["#4F8CFF", "#A78BFA", "#94A3B8"];

/* ══════════════════════════════════════════════════════
   Stat Card
   ══════════════════════════════════════════════════════ */
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    iconBg?: string;
}

const StatCard = ({ label, value, change }: StatCardProps) => {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
            <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {change !== undefined && (
                <p className={`text-xs font-medium flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                    <span>{isPositive ? "↑" : "↓"}</span>
                    <span>{Math.abs(change)}% Since last week</span>
                </p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   Custom Tooltip for sales chart
   ══════════════════════════════════════════════════════ */
const SalesTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-4 py-3 text-sm">
            <p className="font-semibold text-gray-800 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} className="text-gray-500">
                    {p.name}: <span className="font-medium text-gray-800">
                        {p.dataKey === "revenue" ? `$${p.value.toLocaleString()}` : p.value}
                    </span>
                </p>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   Donut Chart Legend (custom)
   ══════════════════════════════════════════════════════ */
const DonutLegend = ({ payload }: any) => (
    <div className="flex justify-center gap-5 mt-2">
        {payload?.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                {entry.value}
            </div>
        ))}
    </div>
);

/* ══════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════ */
const formatSalesDate = (d: string) => {
    try {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return d; }
};

const formatDate = (d: string) => {
    try {
        return new Date(d).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    } catch { return d; }
};

const formatTime = (d: string) => {
    try {
        return new Date(d).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return ""; }
};

/* ══════════════════════════════════════════════════════
   Empty state
   ══════════════════════════════════════════════════════ */
const EmptyChart = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
        No data available for {title}
    </div>
);

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
const DashboardHome = () => {
    const navigate = useNavigate();
    const { data: dashboard, isLoading } = useDashboardData();

    /* Safely extract sub-objects — no hardcoded fallbacks */
    const stats = dashboard?.stats;
    const rawSales = dashboard?.salesOverview;
    const salesData = useMemo(() => {
        if (!rawSales?.length) return [];
        return rawSales.map((pt) => ({
            ...pt,
            date: formatSalesDate(pt.date),
        }));
    }, [rawSales]);
    const tickets: TicketBreakdown = dashboard?.ticketBreakdown ?? { open: 0, pending: 0, closed: 0 };
    const customerEvents: DashboardCustomerEvent[] = stats?.customerEvents ?? [];

    /* Donut chart data */
    const donutData = useMemo(() => {
        const total = tickets.open + tickets.pending + tickets.closed;
        return [
            { name: "Open", value: tickets.open, pct: total ? Math.round((tickets.open / total) * 100) : 0 },
            { name: "Pending", value: tickets.pending, pct: total ? Math.round((tickets.pending / total) * 100) : 0 },
            { name: "Closed", value: tickets.closed, pct: total ? Math.round((tickets.closed / total) * 100) : 0 },
        ];
    }, [tickets]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} change={stats?.customerChange} />
                <StatCard label="Active Campaigns" value={stats?.activeCampaigns ?? 0} change={stats?.campaignChange} />
                <StatCard label="Total Products" value={stats?.totalProducts ?? 0} change={stats?.productChange} />
                <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} change={stats?.orderChange} />
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Overview — 2/3 width */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Sales Overview</h2>
                    {salesData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#94A3B8", fontSize: 12 }}
                                    />
                                    <Tooltip content={<SalesTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        name="Orders"
                                        stroke="#4F8CFF"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#4F8CFF", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenue ($)"
                                        stroke="#A78BFA"
                                        strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#A78BFA", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 mt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-3 h-0.5 bg-[#4F8CFF] rounded-full inline-block" /> Orders
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-3 h-0.5 bg-[#A78BFA] rounded-full inline-block" /> Revenue ($)
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyChart title="Sales Overview" />
                    )}
                </div>

                {/* Support Tickets Donut — 1/3 width */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Support Tickets</h2>
                    <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={donutData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {donutData.map((_, i) => (
                                        <Cell key={i} fill={DONUT_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, name: string) => [`${value} tickets`, name]}
                                    contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }}
                                />
                                <Legend content={<DonutLegend />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Center label */}
                    <div className="text-center -mt-4">
                        <p className="text-2xl font-bold text-gray-900">
                            {tickets.open + tickets.pending + tickets.closed}
                        </p>
                        <p className="text-xs text-gray-400">Total Tickets</p>
                    </div>
                </div>
            </div>

            {/* ── Recent Activities ── */}
            <div className="bg-white rounded-xl border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">Recent Customer Events</h2>
                    <button
                        onClick={() => navigate("/dashboard/customers")}
                        className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] transition-colors"
                    >
                        View all customers
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Event Type</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Customer</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Description</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                        No recent customer events
                                    </td>
                                </tr>
                            ) : (
                                customerEvents.slice(0, 8).map((ev) => (
                                    <tr key={ev.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    ev.eventType === "order_placed" ? "bg-emerald-400" :
                                                    ev.eventType === "cart_abandoned" ? "bg-red-400" :
                                                    ev.eventType === "review_submitted" ? "bg-blue-400" :
                                                    ev.eventType === "support_ticket_resolved" ? "bg-amber-400" :
                                                    "bg-purple-400"
                                                }`} />
                                                <span className="text-gray-700 capitalize">{ev.eventType?.replace(/_/g, " ") || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-gray-600">
                                            <button
                                                onClick={() => navigate(`/dashboard/customers/${ev.customer.id}`)}
                                                className="text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
                                            >
                                                {ev.customer.name}
                                            </button>
                                        </td>
                                        <td className="px-6 py-3.5 text-gray-500 max-w-[200px] truncate">{ev.description || "—"}</td>
                                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                                            <div>{formatDate(ev.occurredAt)}</div>
                                            <div className="text-[11px] text-gray-300">{formatTime(ev.occurredAt)}</div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <button
                                                onClick={() => navigate(`/dashboard/customers/${ev.customer.id}`)}
                                                className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
