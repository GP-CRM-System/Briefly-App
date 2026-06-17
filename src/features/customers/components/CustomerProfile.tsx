import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomer, useAddCustomerNote } from "../customer.hooks";
import { getInitials } from "../utils";
import type { TimelineEntry, CustomerProductInteraction, CustomerEvent } from "../types";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */

const fmt = (v: string | number | null | undefined) =>
    v != null ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "—";

const fmtDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const fmtSimpleDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const dStr = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${dStr}`;
    } catch {
        return d;
    }
};

const fmtCreatedDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    } catch {
        return d;
    }
};

const scoreLabel = (score: number | null | undefined): string => {
    if (score == null) return "—";
    if (score >= 0.7) return "High";
    if (score >= 0.4) return "Medium";
    return "Low";
};

const frequencyLabel = (f: string | number | null | undefined): string => {
    if (f == null || f === "") return "—";
    const n = Number(f);
    if (isNaN(n)) {
        const s = String(f).toLowerCase();
        if (s === "frequent") return "Frequent";
        if (s === "regular") return "Regular";
        return "Occasional";
    }
    if (n >= 10) return "Frequent";
    if (n >= 5) return "Regular";
    return "Occasional";
};

/* ═══════════════════════════════════════════
   Sub-components & Helpers
   ═══════════════════════════════════════════ */

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="flex items-start gap-3">
        <span className="text-gray-400 mt-1 flex-shrink-0 bg-gray-50 p-1.5 rounded-lg border border-gray-100">{icon}</span>
        <div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm text-gray-900 font-semibold mt-0.5">{value || "—"}</p>
        </div>
    </div>
);

const getEventIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("order") || t.includes("purchase") || t.includes("placed")) {
        return (
            <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        );
    }
    if (t.includes("tag") || t.includes("label")) {
        return (
            <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        );
    }
    if (t.includes("refund")) {
        return (
            <svg className="h-3.5 w-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        );
    }
    return (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
    );
};

const getInteractionIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("purchase") || t.includes("buy")) {
        return (
            <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        );
    }
    if (t.includes("cart") || t.includes("add")) {
        return (
            <svg className="h-3.5 w-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/><line x1="12" y1="9" x2="12" y2="15"/><line x1="9" y1="12" x2="15" y2="12"/></svg>
        );
    }
    if (t.includes("view")) {
        return (
            <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        );
    }
    return (
        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
    );
};

const interactionLabel = (type: string): string => {
    const t = type.toLowerCase();
    if (t.includes("purchase") || t.includes("buy")) return "Purchased";
    if (t.includes("cart") || t.includes("add")) return "Added to Cart";
    if (t.includes("view")) return "Viewed Product";
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ═══════════════════════════════════════════
   Main Profile Page
   ═══════════════════════════════════════════ */

const CustomerProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [noteText, setNoteText] = useState("");

    /* ── Redirect non-UUID slugs like "create" or "new" ── */
    useEffect(() => {
        if (id === "create" || id === "new") {
            navigate("/dashboard/customers", { replace: true });
        }
    }, [id, navigate]);

    /* ── React Query ── */
    const { data: customer, isLoading } = useCustomer(id);
    const addNoteMutation = useAddCustomerNote(id);

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addNoteMutation.mutate(noteText.trim(), {
            onSuccess: () => setNoteText(""),
        });
    };

    // Build unified timeline from events + product interactions (must be before early returns)
    const timeline: TimelineEntry[] = useMemo(() => {
        if (!customer) return [];
        const events: TimelineEntry[] = (customer.customerEvents ?? []).map((ev: CustomerEvent) => ({
            id: ev.id,
            type: "event" as const,
            label: ev.description || ev.eventType,
            description: ev.eventType,
            timestamp: ev.occurredAt,
            icon: ev.eventType,
        }));
        const interactions: TimelineEntry[] = (customer.productInteractions ?? []).map((pi: CustomerProductInteraction) => ({
            id: pi.id,
            type: "interaction" as const,
            label: interactionLabel(pi.interactionType),
            description: pi.product?.name,
            timestamp: pi.createdAt,
            icon: pi.interactionType,
            product: pi.product,
            rating: pi.rating,
            device: pi.device,
        }));
        return [...events, ...interactions]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 50);
    }, [customer]);

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

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <span 
                    onClick={() => navigate("/dashboard/customers")} 
                    className="hover:text-gray-600 cursor-pointer"
                >
                    Customer
                </span>
                <span>&gt;</span>
                <span className="text-gray-800 font-semibold">View Profile</span>
            </div>

            {/* ═══════════════════════════════════════════
                Header Card
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                {/* Top row */}
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#4A90E2] text-white flex items-center justify-center text-lg font-bold">
                        {getInitials(c.name)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">{c.name}</h1>
                        <p className="text-xs text-gray-400 mt-1">Created at : {fmtCreatedDate(c.createdAt)}</p>
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-50 pt-6">
                    {/* Column 1 */}
                    <div className="space-y-5">
                        <InfoItem
                            label="Email"
                            value={c.email}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                        />
                        <InfoItem
                            label="Phone"
                            value={c.phone || "—"}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                        />
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-5">
                        <InfoItem
                            label="Source"
                            value={c.source || "—"}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
                        />
                        <InfoItem
                            label="Location"
                            value={[c.address, c.city].filter(Boolean).join(", ") || "—"}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                        />
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-5">
                        <InfoItem
                            label="Accepts Marketing"
                            value={c.acceptsMarketing || c.acceptMarketing ? "✓ Yes" : "✗ No"}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 8 8 12 12 16"/><line x1="16" y1="12" x2="8" y2="12"/></svg>}
                        />
                        <InfoItem
                            label="Membership"
                            value={c.isLoyaltyMember ? "Loyalty Member" : "Standard Customer"}
                            icon={<svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Scores & Segment and 2x2 Metrics Grid
               ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Scores & Segment Card */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Scores & Segment</h2>
                        
                        {/* Churn Score Progress Bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-gray-400 font-medium">Churn Score</span>
                                <span className="text-xs font-semibold text-gray-700">
                                    {scoreLabel(c.churnRiskScore)} ({c.churnRiskScore != null ? `${Math.round(c.churnRiskScore * 100)}%` : "0%"})
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                                    style={{ width: `${c.churnRiskScore != null ? Math.round(c.churnRiskScore * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3.5 border-t border-gray-50 pt-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium">LTV Score</span>
                            <span className="font-semibold text-gray-800">${fmt(c.totalSpent)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                            <span className="text-gray-400 font-medium">Segment</span>
                            <span className="font-semibold text-gray-800">{c.rfmSegment || "—"}</span>
                        </div>
                        {(c.rfmRecency != null || c.rfmFrequency != null || c.rfmMonetary != null) && (
                            <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                                <span className="text-gray-400 font-medium">RFM</span>
                                <span className="font-semibold text-gray-800 font-mono text-xs">
                                    R:{c.rfmRecency ?? "—"} · F:{c.rfmFrequency ?? "—"} · M:{c.rfmMonetary ?? "—"}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-sm border-t border-gray-50 pt-3">
                            <span className="text-gray-400 font-medium">Cohort</span>
                            <span className="font-semibold text-gray-800">{c.cohortMonth || "—"}</span>
                        </div>
                    </div>
                </div>

                {/* 2x2 Grid of Metric Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Total Orders Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{c.totalOrders ?? 0}</p>
                            </div>
                            <span className="p-2 rounded-lg bg-blue-50 text-blue-500">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Since {c.firstOrderAt ? fmtSimpleDate(c.firstOrderAt) : "—"}</p>
                    </div>

                    {/* Total Spent Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-gray-900">${fmt(c.totalSpent)}</p>
                            </div>
                            <span className="p-2 rounded-lg bg-green-50 text-green-500">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Lifetime value</p>
                    </div>

                    {/* Last Order Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">Last Order</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{c.lastOrderAt ? fmtSimpleDate(c.lastOrderAt) : "—"}</p>
                            </div>
                            <span className="p-2 rounded-lg bg-blue-50 text-blue-500">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Most recent</p>
                    </div>

                    {/* Total Refunded Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">Total Refunded</p>
                                <p className="text-2xl font-bold text-gray-900">${fmt(c.totalRefunded)}</p>
                            </div>
                            <span className="p-2 rounded-lg bg-red-50 text-red-500">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Lifetime refunds</p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Overview (engagement metrics)
               ═══════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Engagement Score */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Engagement Score</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{c.engagementScore != null ? scoreLabel(c.engagementScore / 100) : "—"}</p>
                            {c.engagementScore != null && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${c.engagementScore}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{c.engagementScore}%</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Satisfaction Score */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Satisfaction Score</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                {c.satisfactionScore != null ? (c.satisfactionScore >= 70 ? "Positive" : c.satisfactionScore >= 40 ? "Neutral" : "Negative") : "—"}
                            </p>
                            {c.satisfactionScore != null && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${c.satisfactionScore}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{c.satisfactionScore}%</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Browsing Frequency */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Browsing Frequency</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-lg font-bold text-gray-900">{frequencyLabel(c.browsingFrequency)}</p>
                            <p className="text-xs text-gray-400 mt-2">{c.browsingFrequency || "0"} visits/week</p>
                        </div>
                    </div>

                    {/* Cart Abandonment */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Cart Abandonment</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">{c.cartAbandonmentRate != null ? (c.cartAbandonmentRate >= 0.6 ? "High" : c.cartAbandonmentRate >= 0.3 ? "Medium" : "Low") : "—"}</p>
                            {c.cartAbandonmentRate != null && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${c.cartAbandonmentRate * 100}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{Math.round(c.cartAbandonmentRate * 100)}%</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Price Sensitivity */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Price Sensitivity</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-lg font-bold text-gray-900">{c.priceSensitivityIndex != null ? scoreLabel(c.priceSensitivityIndex) : "—"}</p>
                            <p className="text-xs text-gray-400 mt-2">Index: {c.priceSensitivityIndex != null ? c.priceSensitivityIndex.toFixed(2) : "0.00"}</p>
                        </div>
                    </div>

                    {/* Support Tickets */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Support Tickets</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-lg font-bold text-gray-900">{c.supportTicketsCount ?? 0} Tickets</p>
                            <p className="text-xs text-gray-400 mt-2">Last 30 Days</p>
                        </div>
                    </div>

                    {/* Website Visits */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Website Visits</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-lg font-bold text-gray-900">{c.websiteVisitsLastMonth ?? 0}</p>
                            <p className="text-xs text-gray-400 mt-2">Last 30 days</p>
                        </div>
                    </div>

                    {/* Sentiment Score */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Sentiment Score</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900">
                                {c.lastSentimentScore != null ? (c.lastSentimentScore >= 0.3 ? "Positive" : c.lastSentimentScore >= -0.3 ? "Neutral" : "Negative") : "N/A"}
                            </p>
                            {c.lastSentimentScore != null && (
                                <p className="text-xs text-gray-400 mt-2">Score: {c.lastSentimentScore.toFixed(2)}</p>
                            )}
                        </div>
                    </div>

                    {/* Avg Days Between Orders */}
                    <div className="border border-gray-100 bg-[#F8FAFC] rounded-2xl p-5 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 rounded-full bg-blue-100 text-blue-500">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </span>
                            <span className="text-xs text-gray-400 font-medium">Avg Days Between Orders</span>
                        </div>
                        <div className="mt-2">
                            <p className="text-lg font-bold text-gray-900">{c.avgDaysBetweenOrders != null ? `${Math.round(c.avgDaysBetweenOrders)} days` : "N/A"}</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* ═══════════════════════════════════════════
                Notes & Activity — side by side
               ═══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Notes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-gray-900">Notes</h2>
                            <button
                                onClick={handleAddNote}
                                disabled={addNoteMutation.isPending || !noteText.trim()}
                                className="h-[32px] px-3 rounded-lg bg-[var(--color-primary-500)] text-white text-xs font-semibold hover:bg-[var(--color-primary-600)] disabled:opacity-50 transition-all flex items-center gap-1.5"
                            >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Add Note
                            </button>
                        </div>

                        {/* Add note input */}
                        <div className="mb-4">
                            <input
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                                placeholder="Add a note..."
                                className="w-full h-[38px] px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-100)] transition-all"
                            />
                        </div>

                        {/* Notes list */}
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {c.notes && c.notes.length > 0 ? c.notes.map((note) => (
                                <div key={note.id} className="border border-gray-100 bg-[#F8FAFC] rounded-xl p-3.5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                            {getInitials(note.author || "User")}
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-800 block leading-none">{note.author || "User"}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 block">Created: {note.createdAt ? fmtDate(note.createdAt) : "—"}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed pl-9">{note.content}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 text-center py-8">No notes yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity History */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-gray-900">Activity History</h2>
                        <div className="flex items-center gap-3 text-[10px] font-semibold text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500" /> Events
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-purple-500" /> Interactions
                            </span>
                        </div>
                    </div>

                    <div className="space-y-0 max-h-[500px] overflow-y-auto pr-1">
                        {timeline.length > 0 ? timeline.map((entry, idx) => (
                            <div key={entry.id || idx} className="flex gap-4 relative pb-6">
                                {/* Timeline connector */}
                                {idx < timeline.length - 1 && (
                                    <div className="absolute left-[13px] top-6 bottom-0 w-px border-l-2 border-dashed border-gray-200" />
                                )}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10 border ${
                                    entry.type === "interaction"
                                        ? "bg-purple-50 border-purple-100"
                                        : "bg-blue-50 border-blue-100"
                                }`}> 
                                    {entry.type === "interaction"
                                        ? getInteractionIcon(entry.icon)
                                        : getEventIcon(entry.icon)
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-800 font-semibold truncate">{entry.label}</p>
                                        {entry.type === "interaction" && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-600 border border-purple-200 flex-shrink-0">
                                                Interaction
                                            </span>
                                        )}
                                    </div>
                                    {entry.description && entry.description !== entry.label && (
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{entry.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-gray-400">{entry.timestamp ? fmtSimpleDate(entry.timestamp) : "—"}</p>
                                        {entry.rating != null && (
                                            <span className="text-xs text-amber-500 font-semibold">★ {entry.rating}</span>
                                        )}
                                        {entry.device && (
                                            <span className="text-xs text-gray-400 capitalize">{entry.device}</span>
                                        )}
                                    </div>
                                    {entry.product && (
                                        <div
                                            onClick={() => navigate(`/dashboard/products/${entry.product!.id}`)}
                                            className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                        >
                                            {entry.product!.imageUrl ? (
                                                <img src={entry.product!.imageUrl} alt="" className="w-8 h-8 rounded-md object-cover bg-white" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                </div>
                                            )}
                                            <span className="text-xs font-semibold text-gray-600 truncate">{entry.product!.name}</span>
                                        </div>
                                    )}
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
