import { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import toast from "react-hot-toast";
import { useDashboardData, useAuditLogs } from "../dashboard.hooks";
import type { TicketBreakdown, AuditLogEntry } from "../types";

/* ═══════════════════════════════════════════════════
   Fallback ticket values — only used if the API returns
   nothing at all. Prefer showing real zeros over fake numbers.
   ═══════════════════════════════════════════════════ */
const EMPTY_TICKETS: TicketBreakdown = { open: 0, pending: 0, closed: 0 };

/* ── Donut chart palette ── */
const DONUT_COLORS = ["#4F8CFF", "#A78BFA", "#94A3B8"];

/* ══════════════════════════════════════════════════════
   Stat Card
   ══════════════════════════════════════════════════════ */
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;          // e.g. 7 = +7%, -3 = –3%
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
   Activity Row
   ══════════════════════════════════════════════════════ */
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
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
const DashboardHome = () => {
    const navigate = useNavigate();
    const { data: dashboard, isLoading } = useDashboardData();
    const { data: auditRaw = [] } = useAuditLogs();

    useEffect(() => {
        const showWelcome = sessionStorage.getItem("briefly_show_welcome");
        if (showWelcome === "1") {
            sessionStorage.removeItem("briefly_show_welcome");
            
            toast.custom(
                (t) => (
                    <div
                        className={`${
                            t.visible ? "animate-enter" : "animate-leave"
                        } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-100 overflow-hidden transition-all duration-300`}
                        style={{
                            transform: t.visible ? "translateY(0)" : "translateY(-20px)",
                            opacity: t.visible ? 1 : 0,
                        }}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary-500)] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-purple-200">
                                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 font-['Poppins']">
                                        Welcome to Briefly CRM!
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Your organization is ready. Let's start managing your customers, campaigns, and orders.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-100">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-semibold text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] focus:outline-none transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ),
                {
                    position: "top-center",
                    duration: 5000,
                }
            );
        }
    }, []);

    /* Safely extract sub-objects — no fake data, show real values or 0 */
    const stats = dashboard?.stats;
    const hasSalesData = (dashboard?.salesOverview?.length ?? 0) > 0;
    const salesData = hasSalesData && dashboard?.salesOverview ? dashboard.salesOverview : [];
    const tickets = dashboard?.ticketBreakdown ?? EMPTY_TICKETS;
    const auditLogs: AuditLogEntry[] = Array.isArray(auditRaw) ? auditRaw : [];

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
                        <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                            <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-sm font-medium">No sales data available</p>
                            <p className="text-xs mt-1">Sales data will appear here once orders are recorded</p>
                        </div>
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
                    <h2 className="text-base font-semibold text-gray-900">Recent Activities</h2>
                    <button
                        onClick={() => navigate("/dashboard/analytics")}
                        className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] transition-colors"
                    >
                        View all
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Activity Type</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Performed By</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Related To</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Details</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-3 font-medium text-gray-400 text-xs uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        No recent activities
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.slice(0, 8).map((log) => (
                                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                    log.action?.toLowerCase().includes("create") ? "bg-emerald-400" :
                                                    log.action?.toLowerCase().includes("delete") ? "bg-red-400" :
                                                    log.action?.toLowerCase().includes("update") ? "bg-amber-400" :
                                                    "bg-blue-400"
                                                }`} />
                                                <span className="text-gray-700 capitalize">{log.action?.replace(/_/g, " ") || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-gray-600">{log.performedByName || log.performedBy || "—"}</td>
                                        <td className="px-6 py-3.5 text-gray-600 capitalize">{log.entityType || log.relatedTo || "—"}</td>
                                        <td className="px-6 py-3.5 text-gray-500 max-w-[200px] truncate">{log.details || "—"}</td>
                                        <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                                            <div>{formatDate(log.createdAt)}</div>
                                            <div className="text-[11px] text-gray-300">{formatTime(log.createdAt)}</div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            {log.entityId && log.entityType ? (
                                                <button
                                                    onClick={() => navigate(`/dashboard/${log.entityType.toLowerCase()}s/${log.entityId}`)}
                                                    className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] hover:underline transition-colors"
                                                >
                                                    View
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-300">—</span>
                                            )}
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
