import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import type { Segment } from "../types";
import { useCreateSegment, useUpdateSegment } from "../segment.hooks";

interface SegmentFormModalProps {
    open: boolean;
    onClose: () => void;
    segment?: Segment | null;
}

interface ConditionState {
    id: string;
    field: string;
    operator: string;
    value: string;
}

const InfoIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const FilterIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const FILTER_FIELDS = [
    { value: "lifecycleStage", label: "Lifecycle Stage" },
    { value: "totalSpent", label: "Total Spent" },
    { value: "city", label: "City" },
    { value: "country", label: "Country" },
    { value: "source", label: "Source" },
    { value: "acceptsMarketing", label: "Accepts Marketing" },
    { value: "totalOrders", label: "Total Orders" },
    { value: "engagementScore", label: "Engagement Score" },
    { value: "satisfactionScore", label: "Satisfaction Score" },
    { value: "supportTicketsCount", label: "Support Tickets" },
];

const FILTER_OPERATORS = [
    { value: "eq", label: "Equals (=)" },
    { value: "neq", label: "Not Equals (!=)" },
    { value: "gt", label: "Greater Than (>)" },
    { value: "lt", label: "Less Than (<)" },
    { value: "gte", label: "Greater Than or Equal (>=)" },
    { value: "lte", label: "Less Than or Equal (<=)" },
    { value: "in", label: "In list (comma separated)" },
    { value: "notIn", label: "Not in list" },
    { value: "contains", label: "Contains" },
    { value: "isNull", label: "Is empty" },
    { value: "isNotNull", label: "Is not empty" },
];

const LIFECYCLE_OPTIONS = [
    { value: "PROSPECT", label: "Prospect" },
    { value: "LEAD", label: "Lead" },
    { value: "ONE_TIME", label: "One-Time" },
    { value: "RETURNING", label: "Returning" },
    { value: "LOYAL", label: "Loyal" },
    { value: "VIP", label: "VIP" },
    { value: "AT_RISK", label: "At-Risk" },
    { value: "CHURNED", label: "Churned" },
    { value: "WINBACK", label: "Winback" },
];

const SOURCE_OPTIONS = [
    { value: "WEBSITE", label: "Website" },
    { value: "SOCIAL", label: "Social" },
    { value: "REFERRAL", label: "Referral" },
    { value: "ORGANIC", label: "Organic" },
    { value: "EMAIL", label: "Email" },
    { value: "CAMPAIGN", label: "Campaign" },
    { value: "OTHER", label: "Other" },
];

const TagInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
    const [input, setInput] = useState("");
    const tags = value ? value.split(",").map(t => t.trim()).filter(Boolean) : [];

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const tag = input.trim();
            if (tag && !tags.includes(tag)) {
                onChange([...tags, tag].join(", "));
            }
            setInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove).join(", "));
    };

    return (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white border border-gray-200 rounded-lg min-h-[38px] w-full focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
            {tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-800 font-bold ml-1">×</button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ""}
                className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
            />
        </div>
    );
};

const SegmentFormModal = ({ open, onClose, segment }: SegmentFormModalProps) => {
    const isEditing = !!segment;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [conjunction, setConjunction] = useState<"and" | "or">("and");
    const [conditions, setConditions] = useState<ConditionState[]>([]);
    const [excludeHighChurn, setExcludeHighChurn] = useState(false);
    const [activeLast30Days, setActiveLast30Days] = useState(false);

    const createMutation = useCreateSegment();
    const updateMutation = useUpdateSegment();
    const isPending = createMutation.isPending || updateMutation.isPending;

    // Helper to parse a filter tree into UI state
    const parseFilterPayload = (filter: any) => {
        let conj: "and" | "or" = "and";
        let conds: ConditionState[] = [];
        let churnToggle = false;
        let recencyToggle = false;

        if (!filter) return { conj, conds, churnToggle, recencyToggle };

        const extractCondition = (c: any) => {
            if (c.field === "churnRiskScore" && c.operator === "lt" && Number(c.value) === 0.7) {
                churnToggle = true;
                return false;
            }
            if (c.field === "lastOrderAt" && c.operator === "gte" && typeof c.value === "string") {
                const diffMs = Math.abs(new Date().getTime() - new Date(c.value).getTime());
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                if (diffDays >= 28 && diffDays <= 32) {
                    recencyToggle = true;
                    return false;
                }
            }
            return true;
        };

        const traverse = (node: any) => {
            if (!node) return;
            if (node.and && Array.isArray(node.and)) {
                conj = "and";
                node.and.forEach((child: any) => {
                    if (child.field && child.operator) {
                        if (extractCondition(child)) {
                            conds.push({
                                id: Math.random().toString(36).substr(2, 9),
                                field: child.field,
                                operator: child.operator,
                                value: String(child.value ?? ""),
                            });
                        }
                    } else {
                        traverse(child);
                    }
                });
            } else if (node.or && Array.isArray(node.or)) {
                conj = "or";
                node.or.forEach((child: any) => {
                    if (child.field && child.operator) {
                        if (extractCondition(child)) {
                            conds.push({
                                id: Math.random().toString(36).substr(2, 9),
                                field: child.field,
                                operator: child.operator,
                                value: String(child.value ?? ""),
                            });
                        }
                    } else {
                        traverse(child);
                    }
                });
            } else if (node.field && node.operator) {
                if (extractCondition(node)) {
                    conds.push({
                        id: Math.random().toString(36).substr(2, 9),
                        field: node.field,
                        operator: node.operator,
                        value: String(node.value ?? ""),
                    });
                }
            }
        };

        traverse(filter);
        return { conj, conds, churnToggle, recencyToggle };
    };

    useEffect(() => {
        if (open) {
            if (segment) {
                setName(segment.name || "");
                setDescription(segment.description || "");
                const parsed = parseFilterPayload(segment.filter);
                setConjunction(parsed.conj);
                setConditions(parsed.conds);
                setExcludeHighChurn(parsed.churnToggle);
                setActiveLast30Days(parsed.recencyToggle);
            } else {
                setName("");
                setDescription("");
                setConjunction("and");
                setConditions([
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        field: "lifecycleStage",
                        operator: "eq",
                        value: "LOYAL",
                    },
                ]);
                setExcludeHighChurn(false);
                setActiveLast30Days(false);
            }
        }
    }, [open, segment]);

    const handleAddCondition = () => {
        setConditions(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                field: "lifecycleStage",
                operator: "eq",
                value: "LOYAL",
            },
        ]);
    };

    const handleDeleteCondition = (id: string) => {
        setConditions(prev => prev.filter(c => c.id !== id));
    };

    const handleUpdateCondition = (id: string, updates: Partial<ConditionState>) => {
        setConditions(prev =>
            prev.map(c => {
                if (c.id !== id) return c;
                const next = { ...c, ...updates };
                // Reset operator/value defaults if field changes
                if (updates.field) {
                    if (updates.field === "acceptsMarketing") {
                        next.operator = "eq";
                        next.value = "true";
                    } else if (updates.field === "lifecycleStage") {
                        next.operator = "eq";
                        next.value = "LOYAL";
                    } else if (updates.field === "source") {
                        next.operator = "eq";
                        next.value = "WEBSITE";
                    } else {
                        next.operator = "eq";
                        next.value = "";
                    }
                }
                return next;
            })
        );
    };

    const buildFilterPayload = () => {
        const condPayloads = conditions.map(c => {
            const numericFields = [
                "totalSpent", "totalOrders", "engagementScore", "satisfactionScore", "supportTicketsCount"
            ];

            let val: any = c.value;
            if (c.operator === "isNull" || c.operator === "isNotNull") {
                val = undefined;
            } else if (c.operator === "in" || c.operator === "notIn") {
                val = c.value;
            } else if (c.field === "acceptsMarketing") {
                val = c.value === "true";
            } else if (numericFields.includes(c.field)) {
                const parsed = parseFloat(c.value);
                val = isNaN(parsed) ? c.value : parsed;
            }

            return {
                field: c.field,
                operator: c.operator,
                value: val,
            };
        });

        const extraConditions: any[] = [];
        if (excludeHighChurn) {
            extraConditions.push({
                field: "churnRiskScore",
                operator: "lt",
                value: 0.7,
            });
        }
        if (activeLast30Days) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            extraConditions.push({
                field: "lastOrderAt",
                operator: "gte",
                value: thirtyDaysAgo.toISOString(),
            });
        }

        if (extraConditions.length === 0) {
            if (condPayloads.length === 0) return {};
            if (condPayloads.length === 1) return condPayloads[0];
            return { [conjunction]: condPayloads };
        } else {
            if (condPayloads.length === 0) {
                return extraConditions.length === 1 ? extraConditions[0] : { and: extraConditions };
            }
            const mainGroup = condPayloads.length === 1 ? condPayloads[0] : { [conjunction]: condPayloads };
            return {
                and: [mainGroup, ...extraConditions],
            };
        }
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Segment name is required");
            return;
        }

        // Validate values
        for (const cond of conditions) {
            if (cond.operator !== "isNull" && cond.operator !== "isNotNull" && !cond.value.trim()) {
                toast.error("All conditions must have a value");
                return;
            }
        }

        const payload = {
            name,
            description,
            filter: buildFilterPayload(),
        };

        if (isEditing) {
            updateMutation.mutate({ id: segment!.id, payload }, {
                onSuccess: onClose,
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to update segment");
                }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: onClose,
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to create segment");
                }
            });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Segment" : "Create New Segment"}
            subtitle={isEditing ? "Update segment definition and rules." : "Create a customer segment by defining dynamic filters."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
            width="max-w-[750px]"
        >
            {/* ── Segment Info Card ── */}
            <FormCard title="Segment Information" icon={<InfoIcon />}>
                <FormField label="Segment Name" required>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Loyal Customers, High Spenders Egypt"
                        className={inputClasses}
                    />
                </FormField>
                <FormField label="Description">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details about what this segment represents..."
                        className={`${inputClasses} h-[80px] py-3 resize-none`}
                    />
                </FormField>
            </FormCard>

            {/* ── Filter Rules Card ── */}
            <FormCard
                title="Filter Logic & Conditions"
                icon={<FilterIcon />}
                headerActions={
                    <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setConjunction("and")}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                                conjunction === "and"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            AND
                        </button>
                        <button
                            type="button"
                            onClick={() => setConjunction("or")}
                            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                                conjunction === "or"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            OR
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {conditions.map((cond) => {
                        const isTagInput = cond.operator === "in" || cond.operator === "notIn";
                        const showValueInput = cond.operator !== "isNull" && cond.operator !== "isNotNull";

                        return (
                            <div key={cond.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50/50 border border-gray-150 p-3.5 rounded-xl">
                                {/* Drag Handle Decoration */}
                                <div className="hidden sm:flex items-center text-gray-300 cursor-grab active:cursor-grabbing">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                                    </svg>
                                </div>

                                {/* Field selector */}
                                <div className="w-full sm:w-[170px] shrink-0">
                                    <select
                                        value={cond.field}
                                        onChange={e => handleUpdateCondition(cond.id, { field: e.target.value })}
                                        className={selectClasses}
                                    >
                                        {FILTER_FIELDS.map(f => (
                                            <option key={f.value} value={f.value}>{f.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Operator selector */}
                                <div className="w-full sm:w-[180px] shrink-0">
                                    <select
                                        value={cond.operator}
                                        onChange={e => handleUpdateCondition(cond.id, { operator: e.target.value })}
                                        className={selectClasses}
                                    >
                                        {FILTER_OPERATORS.map(op => (
                                            <option key={op.value} value={op.value}>{op.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value Editor */}
                                <div className="flex-1">
                                    {showValueInput && (
                                        cond.field === "lifecycleStage" ? (
                                            <select
                                                value={cond.value}
                                                onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                                                className={selectClasses}
                                            >
                                                {LIFECYCLE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : cond.field === "source" ? (
                                            <select
                                                value={cond.value}
                                                onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                                                className={selectClasses}
                                            >
                                                {SOURCE_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        ) : cond.field === "acceptsMarketing" ? (
                                            <select
                                                value={cond.value}
                                                onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                                                className={selectClasses}
                                            >
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        ) : isTagInput ? (
                                            <TagInput
                                                value={cond.value}
                                                onChange={v => handleUpdateCondition(cond.id, { value: v })}
                                                placeholder="Type & press Enter..."
                                            />
                                        ) : (
                                            <input
                                                type={cond.field === "totalSpent" || cond.field === "totalOrders" || cond.field.includes("Score") || cond.field === "supportTicketsCount" ? "number" : "text"}
                                                value={cond.value}
                                                onChange={e => handleUpdateCondition(cond.id, { value: e.target.value })}
                                                placeholder={cond.field === "totalSpent" ? "e.g. 500" : "Value..."}
                                                className={inputClasses}
                                            />
                                        )
                                    )}
                                </div>

                                {/* Delete button */}
                                {conditions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCondition(cond.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100 self-end sm:self-center"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        onClick={handleAddCondition}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors py-1 px-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Condition
                    </button>
                </div>

                {/* ── Predictive Churn Risk & Purchase Recency Toggles ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    {/* Predictive Churn Card */}
                    <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">Predictive Churn Risk</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Exclude customers with high risk scores</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setExcludeHighChurn(!excludeHighChurn)}
                            className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 shrink-0 ${
                                excludeHighChurn ? "bg-blue-500" : "bg-gray-200"
                            }`}
                        >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                                excludeHighChurn ? "translate-x-5" : "translate-x-0"
                            }`} />
                        </button>
                    </div>

                    {/* Purchase Recency Card */}
                    <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 leading-tight">Purchase Recency</h4>
                                <p className="text-xs text-gray-400 mt-0.5">Limit to active in last 30 days</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveLast30Days(!activeLast30Days)}
                            className={`w-11 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 shrink-0 ${
                                activeLast30Days ? "bg-blue-500" : "bg-gray-200"
                            }`}
                        >
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                                activeLast30Days ? "translate-x-5" : "translate-x-0"
                            }`} />
                        </button>
                    </div>
                </div>
            </FormCard>
        </Modal>
    );
};

export default SegmentFormModal;
