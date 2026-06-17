import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar,
} from "recharts";
import { useAnalytics } from "../analytics.hooks";

/* ══════════════════════════════════════════════════════
   Empty state
   ══════════════════════════════════════════════════════ */
const EmptyChart = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
        No data available for {title}
    </div>
);

/* ══════════════════════════════════════════════════════
   Stat Card
   ══════════════════════════════════════════════════════ */
interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
}

const StatCard = ({ label, value, change, icon }: StatCardProps) => {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400 tracking-wide uppercase">{label}</p>
                <div className="w-9 h-9 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[var(--color-primary-500)]">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{typeof value === "number" ? value.toLocaleString() : value}</p>
            {change !== undefined && (
                <p className={`text-xs font-medium flex items-center gap-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                    <span>{isPositive ? "↑" : "↓"}</span>
                    <span>{isPositive ? "+" : ""}{change}% Since Last week</span>
                </p>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   Custom Tooltip
   ══════════════════════════════════════════════════════ */
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-4 py-3 text-sm">
            <p className="font-semibold text-gray-800 mb-1">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} className="text-gray-500">
                    {p.name}: <span className="font-medium text-gray-800">
                        {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
                    </span>
                </p>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   Pie label with percentage
   ══════════════════════════════════════════════════════ */
const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/* ══════════════════════════════════════════════════════
   Format YYYY-MM-DD to "Apr 3" style for chart axis
   ══════════════════════════════════════════════════════ */
const formatChartDate = (d: string) => {
    try {
        return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch { return d; }
};

/* ══════════════════════════════════════════════════════
   Lifecycle label formatter
   ══════════════════════════════════════════════════════ */
const lifecycleLabel: Record<string, string> = {
    VIP: "VIP",
    LOYAL: "Loyal",
    RETURNING: "Returning",
    ONE_TIME: "One-time",
    PROSPECT: "Prospect",
    LEAD: "Lead",
    AT_RISK: "At Risk",
    CHURNED: "Churned",
};

/* ══════════════════════════════════════════════════════
   Ticket status colors
   ══════════════════════════════════════════════════════ */
const TICKET_COLORS: Record<string, string> = {
    OPEN: "#3B82F6",
    PENDING: "#F59E0B",
    CLOSED: "#10B981",
};

/* ══════════════════════════════════════════════════════
   Lifecycle pie colors
   ══════════════════════════════════════════════════════ */
const LIFECYCLE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1", "#F97316", "#6B7280"];

/* ══════════════════════════════════════════════════════
   ICONS (inline SVGs)
   ══════════════════════════════════════════════════════ */
const icons = {
    customers: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
    ),
    products: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />
        </svg>
    ),
    orders: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
    ),
    tickets: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
        </svg>
    ),
};

/* ══════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════ */
const AnalyticsPage = () => {
    const { data: analytics, isLoading } = useAnalytics();

    /* Ticket status from real API data */
    const ticketStatus = useMemo(() => {
        if (!analytics?.ticketsByStatus) return [];
        const entries = Object.entries(analytics.ticketsByStatus);
        if (entries.length === 0) return [];
        return entries.map(([name, value]) => ({
            name,
            value,
            color: TICKET_COLORS[name] || "#94A3B8",
        }));
    }, [analytics?.ticketsByStatus]);

    /* Campaign performance chart data */
    const campaignData = useMemo(() => {
        if (!analytics?.campaignPerformance?.length) return [];
        return analytics.campaignPerformance.map((pt) => ({
            date: formatChartDate(pt.date),
            orders: pt.orders,
            conversions: pt.conversions,
        }));
    }, [analytics?.campaignPerformance]);

    /* Customer lifecycle pie data */
    const lifecycleData = useMemo(() => {
        if (!analytics?.customersByLifecycle) return [];
        const entries = Object.entries(analytics.customersByLifecycle).filter(([, v]) => v > 0);
        if (entries.length === 0) return [];
        return entries.map(([key, value]) => ({
            name: lifecycleLabel[key] || key,
            value,
        }));
    }, [analytics?.customersByLifecycle]);

    /* Top products bar chart data */
    const topProducts = analytics?.topProducts ?? [];

    /* Support overview */
    const supportOverview = analytics?.supportOverview;

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
                <StatCard label="Total Customers" value={analytics?.summary.customers.total ?? 0} change={analytics?.summary.customers.change} icon={icons.customers} />
                <StatCard label="Total Products" value={analytics?.summary.products.total ?? 0} change={analytics?.summary.products.change} icon={icons.products} />
                <StatCard label="Total Orders" value={analytics?.summary.orders.total ?? 0} change={analytics?.summary.orders.change} icon={icons.orders} />
                <StatCard label="Open Tickets" value={(analytics?.ticketsByStatus?.OPEN ?? 0) + (analytics?.ticketsByStatus?.PENDING ?? 0)} change={undefined} icon={icons.tickets} />
            </div>

            {/* ── Row 2: Campaign Performance + Support Tickets Status ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaign Performance — 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Campaign Performance</h2>
                    {campaignData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={campaignData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Line type="monotone" dataKey="orders" name="Orders" stroke="#3B82F6" strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#1E3A5F" strokeWidth={2.5}
                                        dot={{ r: 4, fill: "#1E3A5F", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 mt-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-3 h-0.5 bg-[#3B82F6] rounded-full inline-block" /> Orders
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="w-3 h-0.5 bg-[#1E3A5F] rounded-full inline-block" /> Conversions
                                </div>
                            </div>
                        </>
                    ) : (
                        <EmptyChart title="Campaign Performance" />
                    )}
                </div>

                {/* Support Tickets Status — 1/3 */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Support Tickets Status</h2>
                    <div className="flex-1 flex items-center justify-center">
                        {ticketStatus.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={ticketStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                        paddingAngle={3} dataKey="value" strokeWidth={0}
                                        label={renderPercentLabel} labelLine={false}>
                                        {ticketStatus.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number, n: string) => [v, n]}
                                        contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart title="Ticket Status" />
                        )}
                    </div>
                    {ticketStatus.length > 0 && (
                        <div className="flex justify-center gap-5 mt-1">
                            {ticketStatus.map((t) => (
                                <div key={t.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: t.color }} />
                                    {t.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 3: Customer Segmentation + Top Products ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Lifecycle Segmentation */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Segmentation</h2>
                    {lifecycleData.length > 0 ? (
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={lifecycleData} cx="50%" cy="50%" outerRadius={100}
                                        dataKey="value" strokeWidth={0}
                                        label={renderPercentLabel} labelLine={false}>
                                        {lifecycleData.map((_, i) => (
                                            <Cell key={i} fill={LIFECYCLE_COLORS[i % LIFECYCLE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number, n: string) => [`${v} customers`, n]}
                                        contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                                    <Legend
                                        formatter={(value) => <span className="text-xs text-gray-500">{value}</span>}
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyChart title="Customer Segmentation" />
                    )}
                </div>

                {/* Top Products by Sales */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Top Products by Sales</h2>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                <XAxis type="number" axisLine={false} tickLine={false}
                                    tick={{ fill: "#94A3B8", fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: "#374151", fontSize: 12 }} width={160} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="sales" name="Units Sold" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={18} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart title="Top Products" />
                    )}
                </div>
            </div>

            {/* ── Row 4: Support Overview ── */}
            {supportOverview && (
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Support Overview</h2>
                    <div className="flex items-center gap-8">
                        {/* Gauge ring */}
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#3B82F6" strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 50 * (supportOverview.totalResolved / Math.max(supportOverview.totalResolved, 1))} ${2 * Math.PI * 50}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">{supportOverview.totalResolved}</span>
                                <span className="text-[10px] text-gray-400">Resolved</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Resolved</p>
                                <p className="text-xl font-bold text-gray-900">{supportOverview.totalResolved} Tickets</p>
                            </div>
                            {supportOverview.topEmployee && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Top Rep</p>
                                        <p className="text-sm font-semibold text-[var(--color-primary-500)]">{supportOverview.topEmployee.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Activity</p>
                                        <p className="text-sm font-semibold text-gray-900">{supportOverview.topEmployee.activityCount}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;

