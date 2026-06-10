import { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    BarChart, Bar,
} from "recharts";
import { useDashboardData } from "@/features/dashboard/dashboard.hooks";

/* ═══════════════════════════════════════════════════
   Fallback data — always renders even when API is empty
   ═══════════════════════════════════════════════════ */

const CAMPAIGN_DATA = [
    { date: "Apr 3", reach: 40, conversion: 12 },
    { date: "Apr 4", reach: 52, conversion: 18 },
    { date: "Apr 5", reach: 48, conversion: 15 },
    { date: "Apr 6", reach: 61, conversion: 22 },
    { date: "Apr 7", reach: 55, conversion: 20 },
    { date: "Apr 8", reach: 67, conversion: 28 },
    { date: "Apr 9", reach: 72, conversion: 32 },
];

const TICKET_STATUS = [
    { name: "Open", value: 35, color: "#93C5FD" },
    { name: "Pending", value: 15, color: "#1E3A5F" },
    { name: "Closed", value: 50, color: "#3B82F6" },
];

const CUSTOMER_SEGMENTS = [
    { name: "VIP", value: 40, color: "#3B82F6" },
    { name: "Returning", value: 60, color: "#93C5FD" },
];

const ORDER_FLOW = [
    { name: "New Orders", value: 100, color: "#3B82F6" },
    { name: "Processing", value: 82, color: "#60A5FA" },
    { name: "Shipped", value: 65, color: "#93C5FD" },
    { name: "Delivered", value: 58, color: "#34D399" },
];

const TOP_PRODUCTS = [
    { name: "Premium Hoodie", sales: 121799 },
    { name: "Classic Sneakers", sales: 50799 },
    { name: "Leather Wallet", sales: 25567 },
    { name: "Cotton T-Shirt", sales: 5789 },
];

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
   Donut center label renderer
   ══════════════════════════════════════════════════════ */
const renderCenterLabel = (data: { name: string; value: number }[]) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    return ({ cx, cy }: any) => (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} dy="-0.4em" className="text-lg font-bold fill-gray-800">{total}</tspan>
            <tspan x={cx} dy="1.4em" className="text-[11px] fill-gray-400">Total</tspan>
        </text>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v    const ticketStatus = useMemo(() => {
        const bk = dashboard?.ticketBreakdown;
        if (!bk) return TICKET_STATUS;
        const total = bk.open + bk.pending + bk.closed;
        if (total === 0) return TICKET_STATUS;
        return [
            { name: "Open", value: bk.open, color: "#93C5FD" },
            { name: "Pending", value: bk.pending, color: "#1E3A5F" },
            { name: "Closed", value: bk.closed, color: "#3B82F6" },
        ];
    }, [dashboard?.ticketBreakdown]);

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
                <StatCard label="Total Customers" value={stats?.totalCustomers ?? 1200} change={7} icon={icons.customers} />
                <StatCard label="Total Products" value={stats?.totalProducts ?? 560} change={5} icon={icons.products} />
                <StatCard label="Total Orders" value={stats?.totalOrders ?? 1200} change={-3} icon={icons.orders} />
                <StatCard label="Open Tickets" value={(dashboard?.ticketBreakdown?.open ?? 0) + (dashboard?.ticketBreakdown?.pending ?? 0) || 30} change={2} icon={icons.tickets} />
            </div>

            {/* ── Row 2: Campaign Performance + Support Tickets Status ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Campaign Performance — 2/3 */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Campaign Performance</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={CAMPAIGN_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Line type="monotone" dataKey="reach" name="Reach" stroke="#3B82F6" strokeWidth={2.5}
                                dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="conversion" name="Conversion" stroke="#1E3A5F" strokeWidth={2.5}
                                dot={{ r: 4, fill: "#1E3A5F", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-3 h-0.5 bg-[#3B82F6] rounded-full inline-block" /> Reach
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-3 h-0.5 bg-[#1E3A5F] rounded-full inline-block" /> Conversion
                        </div>
                    </div>
                </div>

                {/* Support Tickets Status — 1/3 */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Support Tickets Status</h2>
                    <div className="flex-1 flex items-center justify-center">
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
                    </div>
                    <div className="flex justify-center gap-5 mt-1">
                        {ticketStatus.map((t) => (
                            <div key={t.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: t.color }} />
                                {t.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>   <div className="flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={TICKET_STATUS} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                    paddingAngle={3} dataKey="value" strokeWidth={0}
                                    label={renderPercentLabel} labelLine={false}>
                                    {TICKET_STATUS.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]}
                                    contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-5 mt-1">
                        {TICKET_STATUS.map((t) => (
                            <div key={t.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: t.color }} />
                                {t.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Row 3: Customer Segmentation + Order Fulfillment Flow ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Segmentation */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Customer Segmentation</h2>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={CUSTOMER_SEGMENTS} cx="50%" cy="50%" outerRadius={100}
                                    dataKey="value" strokeWidth={0}
                                    label={renderPercentLabel} labelLine={false}>
                                    {CUSTOMER_SEGMENTS.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number, n: string) => [`${v}%`, n]}
                                    contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                                <Legend
                                    formatter={(value) => <span className="text-xs text-gray-500">{value}</span>}
                                    iconType="circle"
                                    iconSize={8}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Fulfillment Flow */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-6">Order Fulfillment Flow</h2>
                    <div className="space-y-5">
                        {ORDER_FLOW.map((item) => (
                            <div key={item.name}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm text-gray-600">{item.name}</span>
                                    <span className="text-sm font-semibold text-gray-800">{item.value}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${item.value}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Row 4: Top Product by Sales + Employee Performance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Product by Sales */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Top Product by Sales</h2>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={TOP_PRODUCTS} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                            <XAxis type="number" axisLine={false} tickLine={false}
                                tick={{ fill: "#94A3B8", fontSize: 11 }}
                                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                                tick={{ fill: "#374151", fontSize: 12 }} width={120} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="sales" name="Sales" fill="#3B82F6" radius={[0, 6, 6, 0]} barSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Employee Performance */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Employee Performance</h2>
                    <div className="flex items-center justify-center gap-8">
                        {/* Gauge ring */}
                        <div className="relative w-36 h-36 flex-shrink-0">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                {/* Background ring */}
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                                {/* Progress ring */}
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#3B82F6" strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 50 * 0.88} ${2 * Math.PI * 50 * 0.12}`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-gray-900">88%</span>
                                <span className="text-[10px] text-gray-400">Avg. Efficiency</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Resolved This Month</p>
                                <p className="text-xl font-bold text-gray-900">1,842 Tickets</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Top Rep</p>
                                    <p className="text-sm font-semibold text-[var(--color-primary-500)]">Sarah J.</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</p>
                                    <p className="text-sm font-semibold text-gray-900">4.9/5.0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
