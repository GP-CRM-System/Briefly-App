import { useState, useMemo } from "react";
import { CheckListIcon, AlertCircleIcon, CancelCircleIcon, UserIcon } from "hugeicons-react";
import { useAiCustomers, useAiCustomer, useChurnResults, useSegmentResults } from "../ai.hooks";

/* ══════════════════════════════════════════════════════
   Churn Status Banner
   ══════════════════════════════════════════════════════ */
const CHURN_THRESHOLD = 0.68;

const ChurnBanner = ({
    probability,
}: {
    probability: number;
}) => {
    const isStable = probability < CHURN_THRESHOLD;
    const isLowRisk = probability >= CHURN_THRESHOLD && probability < 0.8;
    const isHighRisk = probability >= 0.8;

    if (isStable) {
        return (
            <div className="rounded-xl border-l-4 border-green-500 bg-green-50 px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                    <CheckListIcon size={16} /> Stable Account
                </div>
                <p className="text-xs text-green-600 ml-6">
                    Probability: {(probability * 100).toFixed(1)}% (Below {(CHURN_THRESHOLD * 100).toFixed(1)}% threshold)
                </p>
            </div>
        );
    }
    if (isLowRisk) {
        return (
            <div className="rounded-xl border-l-4 border-yellow-500 bg-yellow-50 px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800">
                    <AlertCircleIcon size={16} /> At Risk (Monitor)
                </div>
                <p className="text-xs text-yellow-600 ml-6">
                    Probability: {(probability * 100).toFixed(1)}%
                </p>
            </div>
        );
    }
    if (isHighRisk) {
        return (
            <div className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
                    <CancelCircleIcon size={16} /> High Churn Risk
                </div>
                <p className="text-xs text-red-600 ml-6">
                    Probability: {(probability * 100).toFixed(1)}%. Immediate action required.
                </p>
            </div>
        );
    }
    return null;
};

/* ══════════════════════════════════════════════════════
   Segment Chart (simple bar visualization)
   ══════════════════════════════════════════════════════ */
const SegmentChart = ({
    distances,
    assignedSegment,
}: {
    distances: [number, number, number];
    assignedSegment: number;
}) => {
    const colors = ["#3B82F6", "#F59E0B", "#8B5CF6"];
    const bgColors = ["rgba(59,130,246,0.1)", "rgba(245,158,11,0.1)", "rgba(139,92,246,0.1)"];
    const segNames = ["Cluster 0: Browsers", "Cluster 1: Bargain/Casual", "Cluster 2: Premium Loyal"];
    const maxDist = Math.max(...distances, 1);

    return (
        <div className="space-y-3">
            {distances.map((dist, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{segNames[i]}</span>
                        <span className="text-gray-400">{dist.toFixed(2)}</span>
                    </div>
                    <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${(dist / maxDist) * 100}%`,
                                backgroundColor: assignedSegment === i ? colors[i] : bgColors[i],
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════════════════
   Interaction Pill
   ══════════════════════════════════════════════════════ */
const InteractionPill = ({ type }: { type: string }) => {
    const styles: Record<string, string> = {
        view: "bg-gray-100 text-gray-600",
        add_to_cart: "bg-yellow-50 text-yellow-700",
        purchase: "bg-green-50 text-green-700",
    };
    const labels: Record<string, string> = {
        view: "View",
        add_to_cart: "Add to Cart",
        purchase: "Purchase",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                styles[type] || "bg-gray-100 text-gray-500"
            }`}
        >
            {labels[type] || type.replace(/_/g, " ")}
        </span>
    );
};

/* ══════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════ */
const AiCustomer360 = () => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

    const { data: customers = [] } = useAiCustomers();
    const { data: customerDetail } = useAiCustomer(selectedCustomerId || undefined);
    const { data: churnData } = useChurnResults();
    const { data: segmentData } = useSegmentResults();

    /* Map churn data for lookup */
    const churnMap = useMemo(() => {
        const map = new Map<string, number>();
        if (churnData?.customers) {
            for (const c of churnData.customers) {
                map.set(c.id, c.churnRiskScore);
            }
        }
        return map;
    }, [churnData]);

    /* Find churn data for selected customer */
    // Prefer the individual customer detail (most direct/always current), fall back to bulk churn map
    const selectedChurnScore = useMemo(() => {
        if (!selectedCustomerId) return null;
        const fromDetail = customerDetail?.churnRiskScore;
        if (fromDetail != null) return fromDetail;
        return churnMap.get(selectedCustomerId) ?? null;
    }, [selectedCustomerId, customerDetail?.churnRiskScore, churnMap]);

    /* Find segment data for selected customer */
    const selectedSegment = useMemo(() => {
        if (!segmentData?.distribution || !selectedCustomerId) return null;
        // Use distribution info for visualization - we don't have per-customer segment from this hook
        return segmentData.distribution;
    }, [segmentData, selectedCustomerId]);

    /* Compute stats from customer interactions and orders */
    const engagementStats = useMemo(() => {
        if (!customerDetail?.productInteractions && !customerDetail?.orders) return null;
        const interactions = customerDetail.productInteractions ?? [];
        const orders = customerDetail.orders ?? [];
        const total = interactions.length + orders.length;
        const views = interactions.filter((i) => i.interactionType === "view").length;
        const carts = interactions.filter((i) => i.interactionType === "add_to_cart").length;
        const purchases = orders.length;
        const totalSpent = orders.reduce((sum, o) => {
            const amt = o.totalAmount != null ? Number(o.totalAmount) : 0;
            return sum + amt;
        }, 0);
        const validRatings = interactions
            .filter((i) => i.rating != null)
            .map((i) => i.rating as number);
        const avgRating =
            validRatings.length > 0
                ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
                : 0;
        return {
            total,
            views,
            carts,
            purchases,
            total_spent: customerDetail.totalSpent
                ? Number(customerDetail.totalSpent)
                : totalSpent,
            avg_rating: avgRating,
        };
    }, [customerDetail]);

    /* Build timeline from interactions + events */
    const timeline = useMemo(() => {
        if (!customerDetail) return [];
        const entries: Array<{
            id: string;
            type: string;
            item: string;
            category?: string;
            interactionType?: string;
            time: string;
        }> = [];

        if (customerDetail.productInteractions) {
            for (const ix of customerDetail.productInteractions) {
                entries.push({
                    id: ix.id,
                    type: "interaction",
                    item: ix.product?.name || "Unknown",
                    category: "",
                    interactionType: ix.interactionType,
                    time: ix.createdAt,
                });
            }
        }

        if (customerDetail.customerEvents) {
            for (const ev of customerDetail.customerEvents) {
                entries.push({
                    id: ev.id,
                    type: "event",
                    item: ev.description || ev.eventType,
                    category: ev.eventType,
                    time: ev.occurredAt,
                });
            }
        }

        entries.sort(
            (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        return entries;
    }, [customerDetail]);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCustomerId(e.target.value);
    };

    return (
        <div className="space-y-4">
            {/* Header with dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Customer Insights</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Analyze individual customer behavior, churn risk, and historical interactions.
                    </p>
                </div>
                <select
                    value={selectedCustomerId}
                    onChange={handleCustomerChange}
                    className="w-full sm:w-72 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all appearance-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "16px",
                    }}
                >
                    <option value="">Select Customer ID...</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name} ({c.email})
                        </option>
                    ))}
                </select>
            </div>

            {!selectedCustomerId ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                    <div className="mb-4 text-gray-300"><UserIcon size={48} /></div>
                    <h3 className="text-lg font-semibold text-gray-900">No Customer Selected</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-sm">
                        Please choose a customer from the dropdown menu to view their complete profile, predictive metrics, and history.
                    </p>
                </div>
            ) : !customerDetail ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Row 1: Churn + Segment + Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Churn Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Predictive Churn Analysis
                            </h3>
                            {selectedChurnScore !== null ? (
                                <ChurnBanner
                                    probability={selectedChurnScore}
                                />
                            ) : (
                                <div className="text-sm text-gray-400 text-center py-4">
                                    No churn data available. Run churn computation first.
                                </div>
                            )}
                        </div>

                        {/* Segment Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Behavioral Segmentation
                            </h3>
                            {selectedSegment && selectedSegment.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="text-sm font-semibold text-gray-800">
                                        Segment Distribution
                                    </div>
                                    <SegmentChart
                                        distances={
                                            selectedSegment.length >= 3
                                                ? ([
                                                      selectedSegment[0].percentage,
                                                      selectedSegment[1].percentage,
                                                      selectedSegment[2].percentage,
                                                  ] as [number, number, number])
                                                : [33, 33, 34]
                                        }
                                        assignedSegment={0}
                                    />
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 text-center py-4">
                                    No segment data available. Run segmentation computation first.
                                </div>
                            )}
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                Engagement Metrics
                            </h3>
                            {engagementStats ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">{engagementStats.total}</div>
                                        <div className="text-[11px] text-gray-400">Total Events</div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">{engagementStats.views}</div>
                                        <div className="text-[11px] text-gray-400">Views</div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">{engagementStats.carts}</div>
                                        <div className="text-[11px] text-gray-400">Add to Cart</div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">{engagementStats.purchases}</div>
                                        <div className="text-[11px] text-gray-400">Purchases</div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">
                                            ${engagementStats.total_spent.toFixed(2)}
                                        </div>
                                        <div className="text-[11px] text-gray-400">Lifetime Value</div>
                                    </div>
                                    <div className="border border-gray-100 rounded-xl bg-gray-50/50 px-3 py-2.5">
                                        <div className="text-lg font-bold text-gray-900">
                                            {engagementStats.avg_rating > 0
                                                ? engagementStats.avg_rating.toFixed(1)
                                                : "N/A"}
                                        </div>
                                        <div className="text-[11px] text-gray-400">Avg Rating</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 text-center py-4">
                                    No interaction data available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interaction History Timeline */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Interaction History Timeline
                        </h3>
                        {timeline.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-400 border-b border-gray-100">
                                            <th className="pb-2.5 pr-4 font-medium text-xs uppercase tracking-wider">Item</th>
                                            <th className="pb-2.5 pr-4 font-medium text-xs uppercase tracking-wider">Type</th>
                                            <th className="pb-2.5 pr-4 font-medium text-xs uppercase tracking-wider">Interaction</th>
                                            <th className="pb-2.5 font-medium text-xs uppercase tracking-wider">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeline.map((entry) => (
                                            <tr
                                                key={entry.id}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="py-2.5 pr-4">
                                                    <span className="font-medium text-[var(--color-primary-600)]">
                                                        {entry.item}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-gray-500">
                                                    {entry.category || "—"}
                                                </td>
                                                <td className="py-2.5 pr-4">
                                                    {entry.interactionType ? (
                                                        <InteractionPill type={entry.interactionType} />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Event</span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 text-gray-400 text-xs whitespace-nowrap">
                                                    {new Date(entry.time).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 text-center py-8 border border-dashed border-gray-200 rounded-xl">
                                No interaction history available for this customer.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiCustomer360;
