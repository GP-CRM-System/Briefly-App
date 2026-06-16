import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSegment, useSegmentCustomers, useDeleteSegment } from "../segment.hooks";
import { formatFilter, countConditions, isAndGroup, isOrGroup } from "../segment.utils";
import type { SegmentFilter } from "../types";
import SegmentFormModal from "./SegmentFormModal";
import toast from "react-hot-toast";

// Condition list icons
const FinanceIcon = () => (
    <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    </div>
);

const GeoIcon = () => (
    <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    </div>
);

const EngagementIcon = () => (
    <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    </div>
);

/**
 * Recursively render filter conditions as a list of rule cards.
 */
function renderFilterRules(filter: SegmentFilter | null | undefined): Array<{ icon: "finance" | "geo" | "engagement"; category: string; description: string }> {
    if (!filter) return [];

    if (isAndGroup(filter) || isOrGroup(filter)) {
        const items = isAndGroup(filter) ? filter.and : filter.or;
        return items.flatMap((item) => renderFilterRules(item));
    }

    // Simple condition
    const field = filter.field || "";
    let icon: "finance" | "geo" | "engagement" = "finance";
    if (["city", "address", "region"].includes(field)) icon = "geo";
    if (["totalOrders", "totalSpent", "engagementScore", "satisfactionScore", "supportTicketsCount"].includes(field)) icon = "engagement";

    const categoryMap: Record<string, string> = {
        lifecycleStage: "Lifecycle",
        totalSpent: "Financial",
        totalOrders: "Financial",
        avgOrderValue: "Financial",
        totalRefunded: "Financial",
        city: "Geographic",
        address: "Geographic",
        source: "Acquisition",
        acceptsMarketing: "Engagement",
        isLoyaltyMember: "Loyalty",
        tags: "Tags",
        email: "Contact",
        phone: "Contact",
        name: "Contact",
        accountAgeMonths: "Account",
        churnRiskScore: "Risk",
        rfmScore: "RFM",
        rfmSegment: "RFM",
        rfmRecency: "RFM",
        rfmFrequency: "RFM",
        rfmMonetary: "RFM",
        engagementScore: "Engagement",
        satisfactionScore: "Engagement",
        supportTicketsCount: "Support",
    };

    return [{
        icon,
        category: categoryMap[field] || "Filter",
        description: formatFilter(filter),
    }];
}

const SegmentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Queries
    const { data: segment, isLoading: isSegmentLoading } = useSegment(id);
    const { data: apiCustomers, isLoading: isCustomersLoading } = useSegmentCustomers(id);
    
    // Mutations
    const deleteMutation = useDeleteSegment();

    const fmtDetailsDate = (d: string | null | undefined) => {
        if (!d) return "—";
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${months[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`;
    };

    const getDaysAgo = (d: string | null | undefined) => {
        if (!d) return "";
        const date = new Date(d);
        if (isNaN(date.getTime())) return "";
        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return "Today";
        if (diffDays === 1) return "1 Day ago";
        return `${diffDays} Days ago`;
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this segment? This action cannot be undone.")) {
            deleteMutation.mutate(id!, {
                onSuccess: () => {
                    navigate("/dashboard/segments");
                }
            });
        }
    };

    if (isSegmentLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!segment) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Segment not found</p>
                <button
                    onClick={() => navigate("/dashboard/segments")}
                    className="mt-4 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg"
                >
                    Back to Segments
                </button>
            </div>
        );
    }

    const customers = apiCustomers || [];
    const filterRules = renderFilterRules(segment.filter);
    const totalConditions = segment.filter ? countConditions(segment.filter) : 0;
    const isComplexFilter = isAndGroup(segment.filter) || isOrGroup(segment.filter);
    const filterLogicLabel = isAndGroup(segment.filter) ? "Match all (AND)" : isOrGroup(segment.filter) ? "Match any (OR)" : "Single rule";

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <span 
                    onClick={() => navigate("/dashboard/segments")} 
                    className="hover:text-gray-600 cursor-pointer"
                >
                    Segment
                </span>
                <span>&gt;</span>
                <span className="text-gray-800 font-semibold">View Details</span>
            </div>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-900">{segment.name}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-red-50 hover:bg-red-100 text-sm font-medium text-red-600 border border-red-100 transition-all"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Segment Size */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400">Segment Size</p>
                    <h4 className="text-xl font-black text-gray-900 mt-1">{segment.size?.toLocaleString() || "0"}</h4>
                    <p className="text-xs text-green-600 font-semibold mt-1">Customers matched</p>
                </div>

                {/* Filter Conditions */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400">Filter Conditions</p>
                    <h4 className="text-xl font-bold text-gray-900 mt-1">{totalConditions}</h4>
                    <p className="text-xs text-gray-400 mt-1">{isComplexFilter ? "Nested rules" : "Simple rule"}</p>
                </div>

                {/* Segment Type */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400">Segment Type</p>
                    <h4 className="text-xl font-bold text-gray-900 mt-1">Dynamic</h4>
                    <p className="text-xs text-gray-400 mt-1">Realtime query</p>
                </div>

                {/* Created On */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-400">Created On</p>
                    <h4 className="text-xl font-bold text-gray-900 mt-1">{fmtDetailsDate(segment.createdAt)}</h4>
                    <p className="text-xs text-gray-400 mt-1">{getDaysAgo(segment.createdAt)}</p>
                </div>
            </div>

            {/* Description & Filter Conditions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Description */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Description</h3>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed font-medium">
                        "{segment.description || "No description provided."}"
                    </div>
                </div>

                {/* Filter Conditions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900">Filter Logic & Conditions</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                            {filterLogicLabel}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {filterRules.length > 0 ? (
                            filterRules.map((rule, index) => (
                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-all">
                                    {rule.icon === "finance" && <FinanceIcon />}
                                    {rule.icon === "geo" && <GeoIcon />}
                                    {rule.icon === "engagement" && <EngagementIcon />}
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{rule.category}</p>
                                        <p className="text-sm font-bold text-gray-800 mt-0.5">{rule.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-400 py-4 text-center">
                                No filter conditions defined.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Customers Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                    Customers in Segment <span className="text-gray-400 font-normal text-sm">({customers.length})</span>
                </h2>

                <div className="overflow-x-auto">
                    {isCustomersLoading ? (
                        <div className="py-10 flex justify-center">
                            <div className="w-6 h-6 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : customers.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                            {customer.email || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center">
                                            <span className="font-semibold text-green-600">
                                                ${Number(customer.totalSpent || 0).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium">
                                            {customer.totalOrders ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                                {customer.lifecycleStage || "—"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-sm text-gray-400 text-center py-8">
                            No customers currently match this segment's filter criteria.
                        </div>
                    )}
                </div>
            </div>
            
            <SegmentFormModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                segment={segment}
            />
        </div>
    );
};

export default SegmentDetails;
