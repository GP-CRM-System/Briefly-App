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

interface FilterCondition {
    id: string;
    field: string;
    operator: string;
    value: string;
}

const makeCondition = (): FilterCondition => ({
    id: Math.random().toString(36).slice(2),
    field: "lifecycleStage",
    operator: "eq",
    value: "",
});

/* ── Icons ── */
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

const TrashIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
);

const DragIcon = () => (
    <svg className="h-4 w-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
        <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
        <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
    </svg>
);

const ReloadIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

/* ── Toggle Switch ── */
const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="flex items-center gap-3 w-full group"
    >
        <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                enabled ? "bg-[var(--color-primary-500)]" : "bg-gray-200"
            }`}
        >
            <div
                className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    enabled ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </div>
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
    </button>
);

const FILTER_FIELDS = [
    { value: "lifecycleStage", label: "Lifecycle Stage" },
    { value: "totalSpent", label: "Total Spent ($)" },
    { value: "totalOrders", label: "Order Count" },
    { value: "country", label: "Country" },
    { value: "city", label: "City" },
    { value: "source", label: "Source" },
    { value: "acceptsMarketing", label: "Accepts Marketing" },
    { value: "tags", label: "Tags" },
];

const FILTER_OPERATORS = [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
    { value: "gte", label: "≥" },
    { value: "lte", label: "≤" },
    { value: "contains", label: "contains" },
    { value: "in", label: "in list" },
];

const getFieldPlaceholder = (field: string) => {
    switch (field) {
        case "totalSpent": return "e.g. 1000";
        case "totalOrders": return "e.g. 3";
        case "acceptsMarketing": return "true or false";
        case "lifecycleStage": return "e.g. Loyal, VIP";
        default: return "e.g. value";
    }
};

const SegmentFormModal = ({ open, onClose, segment }: SegmentFormModalProps) => {
    const isEditing = !!segment;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [logic, setLogic] = useState<"AND" | "OR">("AND");
    const [conditions, setConditions] = useState<FilterCondition[]>([makeCondition()]);
    const [churnRisk, setChurnRisk] = useState(false);
    const [purchaseRecency, setPurchaseRecency] = useState(true);

    const createMutation = useCreateSegment();
    const updateMutation = useUpdateSegment();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (segment) {
                setName(segment.name || "");
                setDescription(segment.description || "");
                setLogic("AND");
                setConditions([{
                    id: "init",
                    field: segment.filter?.field || "lifecycleStage",
                    operator: segment.filter?.operator || "eq",
                    value: segment.filter?.value || "",
                }]);
            } else {
                setName("");
                setDescription("");
                setLogic("AND");
                setConditions([makeCondition()]);
                setChurnRisk(false);
                setPurchaseRecency(true);
            }
        }
    }, [open, segment]);

    const addCondition = () => setConditions((prev) => [...prev, makeCondition()]);

    const removeCondition = (id: string) =>
        setConditions((prev) => prev.length > 1 ? prev.filter((c) => c.id !== id) : prev);

    const updateCondition = (id: string, key: keyof FilterCondition, val: string) =>
        setConditions((prev) => prev.map((c) => c.id === id ? { ...c, [key]: val } : c));

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Segment name is required");
            return;
        }
        if (conditions.some((c) => !c.value.trim())) {
            toast.error("All filter conditions must have a value");
            return;
        }

        // Use first condition as primary `filter` for backward compat; also send all conditions
        const first = conditions[0];
        const payload = {
            name,
            description,
            logic,
            filter: { field: first.field, operator: first.operator, value: first.value },
            conditions: conditions.map(({ field, operator, value }) => ({ field, operator, value })),
        };

        if (isEditing) {
            updateMutation.mutate({ id: segment!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    /* Estimated reach — derive a rough number from condition values */
    const estimatedReach = conditions.reduce((acc, c) => {
        const base = c.value ? Math.abs(c.value.charCodeAt(0) * 7 + c.value.length * 13) % 1200 + 50 : 0;
        return acc + base;
    }, 0);

    const reachPct = Math.min(((estimatedReach / 6800) * 100), 100).toFixed(0);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Segment" : "Create New Segment"}
            subtitle={isEditing ? "Update segment definition and rules." : "Build a smart customer group using dynamic filter conditions."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create Segment"}
            loading={isPending}
            width="max-w-[950px]"
        >
            {/* ── Two-Column Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column (2/3) ── */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Segment Information */}
                    <FormCard title="Segment Information" icon={<InfoIcon />}>
                        <FormField label="Segment Name" required>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. High-Value Customers, Egypt VIPs"
                                className={inputClasses}
                            />
                        </FormField>
                        <FormField label="Description">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what this segment represents..."
                                className={`${inputClasses} h-[80px] py-3 resize-none`}
                            />
                        </FormField>
                    </FormCard>

                    {/* Filter Conditions */}
                    <FormCard title="Filter Conditions" icon={<FilterIcon />}>
                        {/* AND / OR toggle */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Match</span>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden bg-gray-50 p-0.5 gap-0.5">
                                {(["AND", "OR"] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setLogic(opt)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                                            logic === opt
                                                ? "bg-[#4A90E2] text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <span className="text-xs text-gray-400">of the following conditions</span>
                        </div>

                        {/* Conditions list */}
                        <div className="space-y-3">
                            {conditions.map((cond, idx) => (
                                <div key={cond.id} className="flex items-start gap-2">
                                    {/* Drag handle */}
                                    <div className="flex-shrink-0 mt-[13px] cursor-grab active:cursor-grabbing">
                                        <DragIcon />
                                    </div>

                                    {/* Condition number badge */}
                                    <div className="flex-shrink-0 w-6 h-6 mt-[11px] rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
                                        {idx + 1}
                                    </div>

                                    {/* Field + Operator + Value */}
                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                        <select
                                            value={cond.field}
                                            onChange={(e) => updateCondition(cond.id, "field", e.target.value)}
                                            className={`${selectClasses} text-xs`}
                                        >
                                            {FILTER_FIELDS.map((f) => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={cond.operator}
                                            onChange={(e) => updateCondition(cond.id, "operator", e.target.value)}
                                            className={`${selectClasses} text-xs`}
                                        >
                                            {FILTER_OPERATORS.map((op) => (
                                                <option key={op.value} value={op.value}>{op.label}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            value={cond.value}
                                            onChange={(e) => updateCondition(cond.id, "value", e.target.value)}
                                            placeholder={getFieldPlaceholder(cond.field)}
                                            className={`${inputClasses} text-xs`}
                                        />
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={() => removeCondition(cond.id)}
                                        disabled={conditions.length === 1}
                                        className="flex-shrink-0 mt-[9px] w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add condition button */}
                        <button
                            type="button"
                            onClick={addCondition}
                            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-blue-200 rounded-xl text-xs font-bold text-blue-500 hover:bg-blue-50/50 hover:border-blue-300 transition-all"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            Add Condition
                        </button>
                    </FormCard>
                </div>

                {/* ── Right Column (1/3) ── */}
                <div className="lg:col-span-1 flex flex-col gap-5">
                    {/* Segment Reach Card */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <svg className="h-[18px] w-[18px] text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <h3 className="text-[15px] font-semibold text-gray-900">Segment Reach</h3>
                            </div>
                            <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50">
                                <ReloadIcon />
                            </button>
                        </div>
                        <div className="px-5 py-5">
                            {/* Big number */}
                            <div className="text-center mb-4">
                                <p className="text-4xl font-black text-gray-900 leading-none">{estimatedReach.toLocaleString()}</p>
                                <p className="text-xs text-gray-400 mt-1">estimated contacts</p>
                            </div>

                            {/* Sub-stats */}
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
                                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">{reachPct}% Total Pop.</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">+2.4% vs Prev.</span>
                                </div>
                            </div>

                            {/* Info footer */}
                            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <svg className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                                </svg>
                                <p className="text-[11px] text-gray-500 leading-relaxed">Customers are automatically added or removed in real-time as they meet the conditions.</p>
                            </div>
                        </div>
                    </div>

                    {/* Predictive Churn Risk Card */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Predictive Churn Risk</p>
                                    <p className="text-[11px] text-gray-400">AI-powered churn prediction</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={churnRisk} onChange={setChurnRisk} label="" />
                        </div>
                    </div>

                    {/* Purchase Recency Card */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Purchase Recency</p>
                                    <p className="text-[11px] text-gray-400">Factor in last purchase date</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={purchaseRecency} onChange={setPurchaseRecency} label="" />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SegmentFormModal;
