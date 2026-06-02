import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import type { Segment } from "../types";
import { useCreateSegment, useUpdateSegment } from "../segment.hooks";

interface SegmentFormModalProps {
    open: boolean;
    onClose: () => void;
    segment?: Segment | null;
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
    { value: "country", label: "Country" },
    { value: "city", label: "City" },
    { value: "source", label: "Source" },
    { value: "acceptsMarketing", label: "Accepts Marketing" },
    { value: "tags", label: "Tags" },
];

const FILTER_OPERATORS = [
    { value: "eq", label: "Equals (=)" },
    { value: "neq", label: "Not Equals (!=)" },
    { value: "gt", label: "Greater Than (>)" },
    { value: "lt", label: "Less Than (<)" },
    { value: "gte", label: "Greater Than or Equal (>=)" },
    { value: "lte", label: "Less Than or Equal (<=)" },
    { value: "in", label: "In list (comma separated)" },
    { value: "contains", label: "Contains" },
];

const SegmentFormModal = ({ open, onClose, segment }: SegmentFormModalProps) => {
    const isEditing = !!segment;
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [filterField, setFilterField] = useState("lifecycleStage");
    const [filterOperator, setFilterOperator] = useState("eq");
    const [filterValue, setFilterValue] = useState("");

    const createMutation = useCreateSegment();
    const updateMutation = useUpdateSegment();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (segment) {
                setName(segment.name || "");
                setDescription(segment.description || "");
                setFilterField(segment.filter?.field || "lifecycleStage");
                setFilterOperator(segment.filter?.operator || "eq");
                setFilterValue(segment.filter?.value || "");
            } else {
                setName("");
                setDescription("");
                setFilterField("lifecycleStage");
                setFilterOperator("eq");
                setFilterValue("");
            }
        }
    }, [open, segment]);

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Segment name is required");
            return;
        }

        if (!filterValue.trim()) {
            toast.error("Filter value is required");
            return;
        }

        const payload = {
            name,
            description,
            filter: {
                field: filterField,
                operator: filterOperator,
                value: filterValue,
            },
        };

        if (isEditing) {
            updateMutation.mutate({ id: segment!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
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
        >
            {/* ── Basic Info Card ── */}
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
                        className={`${inputClasses} h-[100px] py-3 resize-none`}
                    />
                </FormField>
            </FormCard>

            {/* ── Filter Rules Card ── */}
            <FormCard title="Filter Rules" icon={<FilterIcon />}>
                <FormRow>
                    <FormField label="Filter Field">
                        <select
                            value={filterField}
                            onChange={(e) => setFilterField(e.target.value)}
                            className={selectClasses}
                        >
                            {FILTER_FIELDS.map((f) => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Operator">
                        <select
                            value={filterOperator}
                            onChange={(e) => setFilterOperator(e.target.value)}
                            className={selectClasses}
                        >
                            {FILTER_OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
                <div className="mt-5">
                    <FormField label="Filter Value" required>
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={
                                filterField === "totalSpent"
                                    ? "e.g. 1000"
                                    : filterField === "acceptsMarketing"
                                    ? "true or false"
                                    : "e.g. Loyal, Egypt, VIP"
                            }
                            className={inputClasses}
                        />
                    </FormField>
                    <p className="text-xs text-gray-400 mt-2">
                        Dynamic segment: Customers matching this rule are automatically added/removed in real-time.
                    </p>
                </div>
            </FormCard>
        </Modal>
    );
};

export default SegmentFormModal;
