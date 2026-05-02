import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomer, useAddCustomerNote } from "../customer.hooks";
import { getAvatarColor, getInitials, getLifecycleClasses } from "../utils";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const fmt = (v: string | number | null | undefined) =>
    v != null ? Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const fmtDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const fmtFullDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const scoreLabel = (score: number | null | undefined): string => {
    if (score == null) return "N/A";
    if (score >= 0.7) return "High";
    if (score >= 0.4) return "Medium";
    return "Low";
};

const scoreColor = (score: number | null | undefined): string => {
    if (score == null) return "text-gray-400";
    if (score >= 0.7) return "text-red-500";
    if (score >= 0.4) return "text-amber-500";
    return "text-green-500";
};

const frequencyLabel = (f: string | null | undefined): string => {
    if (!f) return "N/A";
    const n = Number(f);
    if (n >= 10) return "Frequent";
    if (n >= 5) return "Regular";
    return "Occasional";
};

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-2.5 min-w-[180px]">
        <span className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</span>
        <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{value || "—"}</p>
        </div>
    </div>
);

const MetricCard = ({ label, value, sub, className = "" }: { label: string; value: string; sub?: string; className?: string }) => (
    <div className={`bg-white border border-gray-100 rounded-xl p-4 ${className}`}>
        <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
        <p className="text-lg font-semibold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

/* ═══════════════════════════════════════════
   Main Profile Page
   ═══════════════════════════════════════════ */

const CustomerProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [noteText, setNoteText] = useState("");

    /* ── React Query ── */
    const { data: customer, isLoading } = useCustomer(id);
    const addNoteMutation = useAddCustomerNote(id);

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNoteMutation.mutate(noteText.trim(), {
            onSuccess: () => setNoteText(""),
        });
    };

    /* ── Loading skeleton ── */
    if (isLoading || !customer) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="bg-white rounded-2xl h-48 border border-gray-100" />
                <div className="bg-white rounded-2xl h-40 border border-gray-100" />
                <div className="bg-white rounded-2xl h-36 border border-gray-100" />
            </div>
        );
    }

    const c = customer;
    const lcLower = c.lifecycleStage?.toLowerCase() || "";
    const lcClasses = getLifecycleClasses(lcLower);

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* ── Back button ── */}
            <button
                onClick={() => navigate("/dashboard/customers")}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
            >
                <svg className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Customers
            </button>

            {/* ═══════════════════════════════════════════
                Header Card
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Top row */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${getAvatarColor(c.name)}`}>
                            {getInitials(c.name)}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{c.name}</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Created at: {fmtDate(c.createdAt)}</p>
                        </div>
                    </div>
                    <span className={`text-sm font-medium border-2 ${lcClasses.bg} ${lcClasses.text} ${lcClasses.border} px-3 py-1 rounded-full`}>
                        {c.lifecycleStage || "—"}
                    </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 gap-x-6">
                    <InfoItem
                        label="Email"
                        value={c.email}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                    />
                    <InfoItem
                        label="Source"
                        value={c.source || "—"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                    />
                    <InfoItem
                        label="Accepts Marketing"
                        value={c.acceptsMarketing ? "Yes" : "No"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                    />
                    <InfoItem
                        label="Tags"
                        value={c.tags?.length ? c.tags.join(", ") : "—"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
                    />
                    <InfoItem
                        label="Phone"
                        value={c.phone || "—"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                    />
                    <InfoItem
                        label="Address"
                        value={[c.address, c.city].filter(Boolean).join(", ") || "—"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                    />
                    <InfoItem
                        label="Loyalty Member"
                        value={c.isLoyaltyMember ? "Yes" : "No"}
                        icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Scores & Segment
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Scores & Segment</h2>

                {/* Top stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <p className="text-xs text-gray-400 font-medium">Churn Score</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className={`text-xl font-bold ${scoreColor(c.churnRiskScore)}`}>
                                {scoreLabel(c.churnRiskScore)}
                            </span>
                            <span className="text-xs text-gray-400">
                                ({c.churnRiskScore != null ? `${(c.churnRiskScore * 100).toFixed(0)}%` : "—"})
                            </span>
                        </div>
                    </div>
                    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{c.totalOrders ?? 0}</p>
                        {c.lastOrderAt && <p className="text-xs text-gray-400 mt-1">Since {fmtDate(c.firstOrderAt)}</p>}
                    </div>
                    <div className="bg-green-50/60 border border-green-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">${fmt(c.totalSpent)}</p>
                        <p className="text-xs text-gray-400 mt-1">Lifetime value</p>
                    </div>
                    <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium">RFM Score</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{c.rfmScore || "—"}</p>
                        <p className="text-xs text-gray-400 mt-1">R{c.rfmRecency ?? "-"} · F{c.rfmFrequency ?? "-"} · M{c.rfmMonetary ?? "-"}</p>
                    </div>
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard label="Avg. Order Value" value={`$${fmt(c.avgOrderValue)}`} />
                    <MetricCard label="Last Order" value={fmtDate(c.lastOrderAt)} />
                    <MetricCard label="Cohort" value={c.cohortMonth || "—"} />
                    <MetricCard label="Total Refunded" value={`$${fmt(c.totalRefunded)}`} />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Overview (engagement metrics)
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <MetricCard
                        label="Engagement Score"
                        value={c.engagementScore != null ? scoreLabel(c.engagementScore / 100) : "N/A"}
                        sub={c.engagementScore != null ? `${c.engagementScore}%` : undefined}
                    />
                    <MetricCard
                        label="Satisfaction Score"
                        value={c.satisfactionScore != null ? scoreLabel(c.satisfactionScore / 100) : "N/A"}
                        sub={c.satisfactionScore != null ? `${c.satisfactionScore}%` : undefined}
                    />
                    <MetricCard
                        label="Browsing Frequency"
                        value={frequencyLabel(c.browsingFrequency)}
                        sub={c.browsingFrequency ? `${c.browsingFrequency} visits/month` : undefined}
                    />
                    <MetricCard
                        label="Cart Abandonment"
                        value={c.cartAbandonmentRate != null ? `${(c.cartAbandonmentRate * 100).toFixed(0)}%` : "N/A"}
                    />
                    <MetricCard
                        label="Price Sensitivity"
                        value={c.priceSensitivityIndex != null ? scoreLabel(c.priceSensitivityIndex) : "N/A"}
                    />
                    <MetricCard
                        label="Support Tickets"
                        value={String(c.supportTicketsCount ?? 0)}
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Notes & Activity — side by side
               ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Notes</h2>
                    </div>

                    {/* Add note input */}
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                            placeholder="Add a note..."
                            className="flex-1 h-[38px] px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-100)] transition-all"
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={addNoteMutation.isPending || !noteText.trim()}
                            className="h-[38px] px-4 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-medium hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Note
                        </button>
                    </div>

                    {/* Notes list */}
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                        {c.notes && c.notes.length > 0 ? c.notes.map((note) => (
                            <div key={note.id} className="border border-gray-100 rounded-xl p-3.5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
                                        {(note.author || "U")[0].toUpperCase()}
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">{note.author || "User"}</span>
                                    <span className="text-xs text-gray-400 ml-auto">{fmtDate(note.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-8">No notes yet</p>
                        )}
                    </div>
                </div>

                {/* Activity History */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">Activity History</h2>

                    <div className="space-y-0 max-h-[400px] overflow-y-auto pr-1">
                        {c.customerEvents && c.customerEvents.length > 0 ? c.customerEvents.map((ev, idx) => (
                            <div key={ev.id || idx} className="flex gap-3 relative pb-5">
                                {/* Timeline connector */}
                                {idx < (c.customerEvents?.length ?? 0) - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
                                )}
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800 font-medium">{ev.description || ev.type}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{fmtFullDate(ev.createdAt)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 text-center py-8">No activity recorded</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Orders Table
               ═══════════════════════════════════════════ */}
            {c.orders && c.orders.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-semibold text-gray-900 mb-4">
                        Orders <span className="text-gray-400 font-normal text-sm">({c.orders.length})</span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Shipping</th>
                                </tr>
                            </thead>
                            <tbody>
                                {c.orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {fmtDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <span className="font-semibold text-green-600">
                                                {order.currency} {fmt(order.totalAmount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                order.paymentStatus === "PAID" 
                                                    ? "bg-green-50 text-green-600"
                                                    : order.paymentStatus === "REFUNDED"
                                                    ? "bg-red-50 text-red-600"
                                                    : "bg-amber-50 text-amber-600"
                                            }`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                order.shippingStatus === "DELIVERED"
                                                    ? "bg-green-50 text-green-600"
                                                    : order.shippingStatus === "SHIPPED"
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-gray-50 text-gray-600"
                                            }`}>
                                                {order.shippingStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;
