import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { CUSTOMER_SOURCES, CUSTOMER_LIFECYCLE_STAGES, BOOLEAN_OPTIONS } from "@/core/constants";
import type { Customer, CustomerFormData } from "../types";
import { useCreateCustomer, useUpdateCustomer } from "../customer.hooks";
import { EMPTY_FORM, customerToFormData, formDataToPayload } from "../utils";

/* ── Section Icons ── */
const UserIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const LocationIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const MarketingIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const StatusIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

/* ── Props ── */
interface CustomerFormModalProps {
    open: boolean;
    onClose: () => void;
    customer?: Customer | null;
}

const CustomerFormModal = ({ open, onClose, customer }: CustomerFormModalProps) => {
    const isEditing = !!customer;
    const [form, setForm] = useState<CustomerFormData>({ ...EMPTY_FORM });

    const createMutation = useCreateCustomer();
    const updateMutation = useUpdateCustomer();
    const isPending = createMutation.isPending || updateMutation.isPending;

    /* Sync form when modal opens */
    useEffect(() => {
        if (open) {
            setForm(customer ? customerToFormData(customer) : { ...EMPTY_FORM });
        }
    }, [open, customer]);

    const update = (key: keyof CustomerFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = () => {
        if (!form.name.trim()) {
            toast.error("Customer name is required");
            return;
        }

        const payload = formDataToPayload(form);

        if (isEditing) {
            updateMutation.mutate({ id: customer!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Customer" : "Create New Customer"}
            subtitle={isEditing ? "Update existing customer details." : "Create a new customer in your database."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
        >
            {/* ── Basic Information ── */}
            <FormCard title="Basic Information" icon={<UserIcon />}>
                <FormField label="Customer Name" required>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g. Sarah Ahmed or Menna Fathy"
                        className={inputClasses}
                    />
                </FormField>
                <FormRow>
                    <FormField label="Phone Number">
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="E-mail Address">
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="email@example.com"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Location Details ── */}
            <FormCard title="Location Details" icon={<LocationIcon />}>
                <FormRow>
                    <FormField label="Full Address">
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => update("address", e.target.value)}
                            placeholder="123 Business Way, Suite"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="City">
                        <input
                            type="text"
                            value={form.city}
                            onChange={(e) => update("city", e.target.value)}
                            placeholder="Mansoura"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Marketing & Source ── */}
            <FormCard title="Marketing & Source" icon={<MarketingIcon />}>
                <FormRow>
                    <FormField label="Customer Source">
                        <select
                            value={form.source}
                            onChange={(e) => update("source", e.target.value)}
                            className={selectClasses}
                        >
                            {CUSTOMER_SOURCES.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Accept Marketing">
                        <select
                            value={form.acceptMarketing}
                            onChange={(e) => update("acceptMarketing", e.target.value)}
                            className={selectClasses}
                        >
                            {BOOLEAN_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Customer Status ── */}
            <FormCard title="Customer Status" icon={<StatusIcon />}>
                <FormField label="Lifecycle Stage">
                    <select
                        value={form.lifecycleStage}
                        onChange={(e) => update("lifecycleStage", e.target.value)}
                        className={selectClasses}
                    >
                        {CUSTOMER_LIFECYCLE_STAGES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </FormField>
            </FormCard>
        </Modal>
    );
};

export default CustomerFormModal;
