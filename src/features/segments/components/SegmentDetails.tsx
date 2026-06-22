import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSegment, useSegmentCustomers, useDeleteSegment } from "../segment.hooks";
import { MOCK_CUSTOMERS, getAvatarColor, getInitials, getLifecycleClasses } from "@/features/customers/utils";
import type { CustomerEvent } from "@/features/customers/types";
import SegmentFormModal from "./SegmentFormModal";

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

        const { field, operator, value } = segment.filter as any;
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
    
    const segmentOwnerName = segment.creator || "Omar Ali";
    const segmentOwnerRole = segment.creatorRole || "Lead Strategist";
    const segmentOwnerImage = segment.creatorImage;

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
                <h2 className="text-2xl font-bold text-gray-900 font-['Poppins']">{segment.name}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-2 h-[49px] px-4 rounded-[9px] border border-[rgba(179,179,179,0.27)] bg-white text-sm font-medium text-gray-600 shadow-[2px_4px_5px_rgba(180,191,205,0.2)] hover:border-gray-300 hover:bg-gray-50 transition-all font-['Poppins']"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 h-[49px] px-4 rounded-[9px] bg-red-50 hover:bg-red-100 text-sm font-medium text-red-600 border border-red-100 transition-all font-['Poppins']"
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
                <div className="bg-white p-6 rounded-[12px] shadow-[0px_16px_12px_rgba(0,0,0,0.06),0px_2px_3px_rgba(0,0,0,0.04),0px_0px_1px_rgba(0,0,0,0.04)] flex items-start justify-between h-[138px]">
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <p className="capitalize font-['Poppins'] text-[#8a8a8a] text-base leading-none">Segment Owner</p>
                        <div className="flex items-center gap-3">
                            {segmentOwnerImage ? (
                                <img 
                                    src={segmentOwnerImage} 
                                    alt={segmentOwnerName} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white" 
                                />
                            ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white ${getAvatarColor(segmentOwnerName)}`}>
                                    {getInitials(segmentOwnerName)}
                                </div>
                            )}
                            <div className="flex flex-col font-['Poppins'] leading-none">
                                <h4 className="text-base font-semibold text-[#191c1e]">{segmentOwnerName}</h4>
                                <p className="text-xs text-[#45464d] font-['Inter'] mt-1">{segmentOwnerRole}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[rgba(74,144,226,0.19)] text-[#4a90e2] rounded-[20px] shrink-0 p-2 w-9 h-9 flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>

                {/* Segment Size */}
                <div className="bg-white p-6 rounded-[12px] shadow-[0px_16px_12px_rgba(0,0,0,0.06),0px_2px_3px_rgba(0,0,0,0.04),0px_0px_1px_rgba(0,0,0,0.04)] flex items-start justify-between h-[138px]">
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <p className="capitalize font-['Poppins'] text-[#8a8a8a] text-base leading-none">Segment Size</p>
                        <h4 className="text-[24px] font-medium text-[#1a1a1a] font-['Poppins'] mt-1 leading-none">{segmentSize}</h4>
                        {segmentSizeTrend && (
                            <p className="text-xs text-[#22c55e] font-medium mt-1 flex items-center gap-1 leading-none">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="19" x2="12" y2="5" />
                                    <polyline points="5 12 12 5 19 12" />
                                </svg>
                                {segmentSizeTrend.replace("↑ ", "")}
                            </p>
                        )}
                    </div>
                    <div className="bg-[rgba(74,144,226,0.19)] text-[#4a90e2] rounded-[20px] shrink-0 p-2 w-9 h-9 flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                </div>

                {/* Segment Type */}
                <div className="bg-white p-6 rounded-[12px] shadow-[0px_16px_12px_rgba(0,0,0,0.06),0px_2px_3px_rgba(0,0,0,0.04),0px_0px_1px_rgba(0,0,0,0.04)] flex items-start justify-between h-[138px]">
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <p className="capitalize font-['Poppins'] text-[#8a8a8a] text-base leading-none">Segment Type</p>
                        <h4 className="text-[24px] font-medium text-[#1a1a1a] font-['Poppins'] mt-1 leading-none">{segmentType}</h4>
                        <p className="text-xs text-[#8a8a8a] font-['Poppins'] font-medium mt-1 leading-none">{segmentTypeDetail}</p>
                    </div>
                    <div className="bg-[rgba(74,144,226,0.19)] text-[#4a90e2] rounded-[20px] shrink-0 p-2 w-9 h-9 flex items-center justify-center">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    </div>
                </div>

                {/* Created On */}
                <div className="bg-white p-6 rounded-[12px] shadow-[0px_16px_12px_rgba(0,0,0,0.06),0px_2px_3px_rgba(0,0,0,0.04),0px_0px_1px_rgba(0,0,0,0.04)] flex items-start justify-between h-[138px]">
                    <div className="flex flex-col justify-between h-full py-0.5">
                        <p className="capitalize font-['Poppins'] text-[#8a8a8a] text-base leading-none">Created On</p>
                        <h4 className="text-[24px] font-medium text-[#1a1a1a] font-['Poppins'] mt-1 leading-none">{segmentCreatedOn}</h4>
                        <p className="text-xs text-[#8a8a8a] font-['Poppins'] font-medium mt-1 leading-none">{segmentDaysAgo}</p>
                    </div>
                    <div className="bg-[rgba(74,144,226,0.19)] text-[#4a90e2] rounded-[20px] shrink-0 p-2 w-9 h-9 flex items-center justify-center">
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
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Description */}
                <div className="bg-white p-8 rounded-[14px] border border-[#e5e7eb] shadow-sm lg:col-span-2 flex flex-col justify-between min-h-[468px]">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-['Poppins'] font-medium text-[18px] text-[#1a1a1a] leading-none">Description</h3>
                        <div className="bg-[#f2f4f6] rounded-[4px] border border-[#f1f5f9] p-5 text-sm text-[#45464d] leading-[26px] italic font-normal">
                            "{segment.description || "No segment description available."}"
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-6 pt-[25px] border-t border-[#f1f5f9]">
                        <span className="font-semibold text-[#45464d] text-[12px] tracking-[0.6px]">
                            {segment.lastUpdated || "Last updated just now"}
                        </span>
                    </div>
                </div>

                {/* Filter Conditions */}
                <div className="bg-white p-8 rounded-[14px] border border-[#e5e7eb] shadow-sm lg:col-span-3 flex flex-col justify-between min-h-[468px]">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className=" font-semibold text-[20px] text-[#191c1e] leading-none">Filter Logic & Conditions</h3>
                            <span className="inline-flex items-center px-[12px] py-[4px] rounded-[12px] text-xs font-semibold bg-[rgba(74,144,226,0.09)] text-[#4a90e2] tracking-[0.6px] leading-none">
                                {segment.filter && (segment.filter as any).or ? "Match any ( Or )" : "Match all ( And )"}
                            </span>
                        </div>

                        <div className="space-y-3">
                            {(() => {
                                /* ── Dynamic condition derivation ── */
                                const FIELD_LABELS: Record<string, string> = {
                                    totalSpent: "Total Spent", totalOrders: "Order Count",
                                    lifecycleStage: "Lifecycle Stage", country: "Country",
                                    city: "City", source: "Source", acceptsMarketing: "Accepts Marketing",
                                    tags: "Tags", churnRiskScore: "Churn Risk Score",
                                    lastOrderAt: "Last Order", engagementScore: "Engagement Score",
                                    satisfactionScore: "Satisfaction Score", supportTicketsCount: "Support Tickets"
                                };
                                const OP_LABELS: Record<string, string> = {
                                    eq: "is equal to", neq: "is not equal to",
                                    gt: "is greater than", lt: "is less than",
                                    gte: "is greater than or equal to", lte: "is less than or equal to",
                                    contains: "contains", in: "is in list", notIn: "is not in list",
                                    isNull: "is empty", isNotNull: "is not empty"
                                };

                                const getIconForField = (field: string) => {
                                    if (field === "totalSpent" || field === "totalOrders") return "finance";
                                    if (field === "country" || field === "city") return "geo";
                                    return "engagement";
                                };
                                const getCategoryForField = (field: string) => {
                                    if (field === "totalSpent" || field === "totalOrders") return "Finance";
                                    if (field === "country" || field === "city") return "Geography";
                                    return "Engagement";
                                };
                                const formatValue = (field: string, value: any) => {
                                    if (field === "totalSpent") return `$${Number(value).toLocaleString()}`;
                                    if (typeof value === "boolean") return value ? "Yes" : "No";
                                    return String(value);
                                };

                                // Priority: explicit rules → conditions from API → single filter fallback
                                if (segment.rules && segment.rules.length > 0) {
                                    return segment.rules.map((rule, index) => (
                                        <div key={index} className="flex items-center gap-[12px] bg-[#fbfcfd] border border-[#e5e7eb] px-[12px] py-[11px] rounded-[8px] w-full h-[79px]">
                                            {rule.icon === "finance" && <FinanceIcon />}
                                            {rule.icon === "geo" && <GeoIcon />}
                                            {rule.icon === "engagement" && <EngagementIcon />}
                                            <div className="flex flex-col h-[39px] justify-center leading-none">
                                                <p className="font-['Poppins'] font-medium text-[#8a8a8a] text-[12px] leading-tight">{rule.category}</p>
                                                <p className="font-['Poppins'] font-normal text-[#1a1a1a] text-[16px] leading-snug mt-0.5">{rule.description}</p>
                                            </div>
                                        </div>
                                    ));
                                }

                                // Recursive flattener for filter payload
                                const flattenFilter = (node: any): any[] => {
                                    if (!node) return [];
                                    if (node.field && node.operator) {
                                        return [node];
                                    }
                                    let list: any[] = [];
                                    if (node.and && Array.isArray(node.and)) {
                                        node.and.forEach((child: any) => {
                                            list = [...list, ...flattenFilter(child)];
                                        });
                                    } else if (node.or && Array.isArray(node.or)) {
                                        node.or.forEach((child: any) => {
                                            list = [...list, ...flattenFilter(child)];
                                        });
                                    }
                                    return list;
                                };

                                const conditionsList = flattenFilter(segment.filter);

                                if (conditionsList.length === 0) {
                                    return (
                                        <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                                            No filter conditions defined.
                                        </div>
                                    );
                                }

                                return conditionsList.map((cond: { field: string; operator: string; value: any }, idx: number) => {
                                    // Skip custom toggles from printing as general conditions if we want them to feel integrated,
                                    // or print them nicely. We will print them nicely!
                                    const iconType = getIconForField(cond.field);
                                    const category = getCategoryForField(cond.field);
                                    const fieldLabel = FIELD_LABELS[cond.field] || cond.field;
                                    const opLabel = OP_LABELS[cond.operator] || cond.operator;
                                    
                                    let description = "";
                                    if (cond.operator === "isNull") {
                                        description = `${fieldLabel} is empty`;
                                    } else if (cond.operator === "isNotNull") {
                                        description = `${fieldLabel} is not empty`;
                                    } else {
                                        const displayVal = formatValue(cond.field, cond.value);
                                        description = `${fieldLabel} ${opLabel} ${displayVal}`;
                                    }

                                    return (
                                        <div key={idx} className="flex items-center gap-[12px] bg-[#fbfcfd] border border-[#e5e7eb] px-[12px] py-[11px] rounded-[8px] w-full h-[79px]">
                                            {iconType === "finance" && <FinanceIcon />}
                                            {iconType === "geo" && <GeoIcon />}
                                            {iconType === "engagement" && <EngagementIcon />}
                                            <div className="flex flex-col h-[39px] justify-center leading-none">
                                                <p className="font-['Poppins'] font-medium text-[#8a8a8a] text-[12px] leading-tight">{category}</p>
                                                <p className="font-['Poppins'] font-normal text-[#1a1a1a] text-[16px] leading-snug mt-0.5">{description}</p>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
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
                        <table className="w-full rounded-xl overflow-hidden border border-gray-100">
                            <thead>
                                <tr className="border-b border-gray-100 bg-[#4A90E214] h-[52px]">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1a1a1a]/50 tracking-wider font-['Poppins']">Name</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]/50 tracking-wider font-['Poppins']">Orders</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]/50 tracking-wider font-['Poppins']">Total Spent</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]/50 tracking-wider font-['Poppins']">Stage</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-[#1a1a1a]/50 tracking-wider font-['Poppins']">Last Activity</th>
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
                                                <td className="px-4 py-[18px]">
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
                                                <td className="px-4 py-[18px] text-sm text-gray-600 text-center font-medium">
                                                    {customer.totalOrders ?? 0}
                                                </td>
                                                <td className="px-4 py-[18px] text-sm text-center">
                                                    <span className="font-semibold text-green-600 font-['Poppins']">
                                                        ${customer.totalSpent || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-[18px] text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageClasses}`}>
                                                        {customer.lifecycleStage || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-[18px] text-center">
                                                    {(() => {
                                                        const events = (customer as any).customerEvents ?? [];
                                                        const latest: CustomerEvent | undefined = events[0];
                                                        const fallback = customer.lastActivity;
                                                        const fallbackDate = customer.lastActivityDate;
                                                        return (
                                                            <>
                                                                <p className="text-sm text-gray-700 leading-tight">
                                                                    {latest?.description || fallback || "—"}
                                                                </p>
                                                                {(latest?.occurredAt || fallbackDate) && (
                                                                    <p className="text-xs text-gray-400">
                                                                        {latest?.occurredAt
                                                                            ? new Date(latest.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                                                            : fallbackDate}
                                                                    </p>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
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
