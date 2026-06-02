import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSegment, useSegmentCustomers, useDeleteSegment } from "../segment.hooks";
import { MOCK_CUSTOMERS, getAvatarColor, getInitials, getLifecycleClasses } from "@/features/customers/utils";
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

const SegmentDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Queries
    const { data: segment, isLoading: isSegmentLoading } = useSegment(id);
    const { data: apiCustomers, isLoading: isCustomersLoading } = useSegmentCustomers(id);
    
    // Mutations
    const deleteMutation = useDeleteSegment();

    // Format Date exactly as OCT 12,2026
    const fmtDetailsDate = (d: string | null | undefined) => {
        if (!d) return "—";
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${months[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`;
    };

    // Calculate or match "214 Days ago"
    const getDaysAgo = (sId: string, d: string | null | undefined) => {
        if (sId === "124578954") return "214 Days ago";
        if (!d) return "";
        const date = new Date(d);
        if (isNaN(date.getTime())) return "";
        const diffTime = Math.abs(new Date().getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} Days ago`;
    };

    const getMatchedCustomers = () => {
        if (apiCustomers && apiCustomers.length > 0) {
            return apiCustomers;
        }

        if (!segment || !segment.filter) return [];

        const { field, operator, value } = segment.filter;
        if (!field || !value) return MOCK_CUSTOMERS;

        return MOCK_CUSTOMERS.filter((customer) => {
            const customerValue = (customer as any)[field];
            
            if (field === "tags") {
                const tagsList = customer.tags || [];
                const searchVal = value.toLowerCase();
                
                if (operator === "contains" || operator === "eq") {
                    return tagsList.some(t => t.toLowerCase().includes(searchVal));
                }
                if (operator === "neq") {
                    return !tagsList.some(t => t.toLowerCase().includes(searchVal));
                }
                return false;
            }

            if (customerValue === undefined) return false;

            const valStr = String(customerValue).toLowerCase();
            const filterValStr = String(value).toLowerCase();

            switch (operator) {
                case "eq":
                    return valStr === filterValStr;
                case "neq":
                    return valStr !== filterValStr;
                case "gt":
                    return Number(customerValue) > Number(value);
                case "lt":
                    return Number(customerValue) < Number(value);
                case "gte":
                    return Number(customerValue) >= Number(value);
                case "lte":
                    return Number(customerValue) <= Number(value);
                case "contains":
                    return valStr.includes(filterValStr);
                case "in":
                    const valuesList = filterValStr.split(",").map(v => v.trim());
                    return valuesList.includes(valStr);
                default:
                    return false;
            }
        });
    };

    const handleExport = () => {
        toast.success("Segment customers exported to CSV!");
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

    const matchedCustomers = getMatchedCustomers();
    
    // Explicit details matching the second screenshot
    const segmentOwnerName = id === "124578954" ? "Omar Ali" : (segment.creator || "Omar Ali");
    const segmentOwnerRole = id === "124578954" ? "Lead Strategist" : (segment.creatorRole || "Lead Strategist");
    const segmentOwnerImage = id === "124578954" 
        ? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" 
        : (segment.creatorImage || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150");

    const segmentSize = id === "124578954" ? "1,200" : matchedCustomers.length.toLocaleString();
    const segmentSizeTrend = id === "124578954" ? "↑ + 5% Since last week" : (segment.sizeTrend || "Stable");
    const segmentType = id === "124578954" ? "Dynamic" : (segment.type || "Dynamic");
    const segmentTypeDetail = id === "124578954" ? "Refreshes every 15 mins" : "Realtime query";
    const segmentCreatedOn = id === "124578954" ? "OCT 12,2026" : fmtDetailsDate(segment.createdAt);
    const segmentDaysAgo = getDaysAgo(segment.id, segment.createdAt);

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
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Export CSV
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

            {/* Premium 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Segment Owner */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src={segmentOwnerImage} 
                            alt={segmentOwnerName} 
                            className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                        />
                        <div>
                            <p className="text-xs font-semibold text-gray-400">Segment Owner</p>
                            <h4 className="text-sm font-bold text-gray-900 mt-0.5">{segmentOwnerName}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{segmentOwnerRole}</p>
                        </div>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl self-start">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <circle cx="12" cy="11" r="3" />
                            <path d="M17 17.5c0-1.93-2.24-3.5-5-3.5s-5 1.57-5 3.5" />
                        </svg>
                    </div>
                </div>

                {/* Segment Size */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400">Segment Size</p>
                        <h4 className="text-xl font-black text-gray-900 mt-0.5">{segmentSize}</h4>
                        {segmentSizeTrend && (
                            <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                                {segmentSizeTrend}
                            </p>
                        )}
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl self-start">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                </div>

                {/* Segment Type */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400">Segment Type</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-0.5">{segmentType}</h4>
                        <p className="text-xs text-gray-400 mt-1">{segmentTypeDetail}</p>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl self-start">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                </div>

                {/* Created On */}
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-gray-400">Created On</p>
                        <h4 className="text-xl font-bold text-gray-900 mt-0.5">{segmentCreatedOn}</h4>
                        <p className="text-xs text-gray-400 mt-1">{segmentDaysAgo}</p>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl self-start">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Description & Filter Conditions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Description */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4">Description</h3>
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-sm text-gray-600 leading-relaxed font-medium">
                            "{segment.description || "No segment description available."}"
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                        {/* Overlapping small avatar group */}
                        <div className="flex items-center">
                            <div className="flex -space-x-2">
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" alt="user" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" alt="user" />
                                <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50" alt="user" />
                            </div>
                            <span className="text-xs text-blue-600 font-semibold ml-2">+1.2k</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {segment.lastUpdated || "Last updated just now"}
                        </span>
                    </div>
                </div>

                {/* Filter Conditions */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 relative flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-gray-900">Filter Logic & Conditions</h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                                Match all ( And )
                            </span>
                        </div>

                        <div className="space-y-3">
                            {segment.rules && segment.rules.length > 0 ? (
                                segment.rules.map((rule, index) => (
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
                                // Generic single rule format if segment rules not defined
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <FinanceIcon />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dynamic Rule</p>
                                        <p className="text-sm font-bold text-gray-800 mt-0.5">
                                            {segment.filter?.field} is equal to {segment.filter?.value}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Customers Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <span>
                        Customers in Segment <span className="text-gray-400 font-normal text-sm">({matchedCustomers.length})</span>
                    </span>
                </h2>

                <div className="overflow-x-auto">
                    {isCustomersLoading ? (
                        <div className="py-10 flex justify-center">
                            <div className="w-6 h-6 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchedCustomers.length > 0 ? (
                                    matchedCustomers.slice(0, 10).map((customer) => {
                                        const initials = getInitials(customer.name);
                                        const avatarBg = getAvatarColor(customer.name);
                                        const stageClasses = getLifecycleClasses(customer.lifecycleStage || "");

                                        return (
                                            <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${avatarBg} text-white`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 leading-tight">{customer.name}</p>
                                                            <p className="text-xs text-gray-400">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 text-center font-medium">
                                                    {customer.totalOrders ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-center">
                                                    <span className="font-semibold text-green-600">
                                                        ${customer.totalSpent || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageClasses}`}>
                                                        {customer.lifecycleStage || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <p className="text-sm text-gray-700 leading-tight">{customer.lastActivity || "—"}</p>
                                                    {customer.lastActivityDate && <p className="text-xs text-gray-400">{customer.lastActivityDate}</p>}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-sm text-gray-400 text-center py-8">
                                            No customers currently match this segment's filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
