import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import { useCreateTicket } from "../ticket.hooks";
import toast from "react-hot-toast";

interface TicketFormModalProps {
    open: boolean;
    onClose: () => void;
}

/* Icons */
const TicketIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const UserIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const DetailsIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const SettingsIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const TicketFormModal = ({ open, onClose }: TicketFormModalProps) => {
    const createMutation = useCreateTicket();

    const [name, setName] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [status, setStatus] = useState<"open" | "pending" | "resolved" | "closed">("open");

    useEffect(() => {
        if (open) {
            setName("");
            setCustomerName("");
            setSubject("");
            setDescription("");
            setPriority("medium");
            setStatus("open");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = () => {
        if (!name.trim() || !customerName.trim() || !subject.trim() || !description.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        const payload = {
            name,
            customerName,
            subject,
            description,
            priority,
            status,
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create New Ticket"
            subtitle="create a new ticket to your database."
            onSubmit={handleSubmit}
            submitLabel="Create"
            loading={createMutation.isPending}
            width="max-w-[700px]"
        >
            {/* ── Ticket Information ── */}
            <FormCard title="Ticket Information" icon={<TicketIcon />}>
                <FormField label="Ticket Name" required>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ticket name"
                        className={inputClasses}
                        required
                    />
                </FormField>
            </FormCard>

            {/* ── Customer Information ── */}
            <FormCard title="Customer Information" icon={<UserIcon />}>
                <FormField label="Customer Name" required>
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer name"
                        className={inputClasses}
                        required
                    />
                </FormField>
            </FormCard>

            {/* ── Ticket Details ── */}
            <FormCard title="Ticket Details" icon={<DetailsIcon />}>
                <FormField label="Subject" required>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of the issue"
                        className={inputClasses}
                        required
                    />
                </FormField>
                <FormField label="Description" required>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe the product features..."
                        rows={4}
                        className={`${inputClasses} h-[110px] py-2 resize-none`}
                        required
                    />
                </FormField>
            </FormCard>

            {/* ── Priority & Status ── */}
            <FormCard title="Priority & Status" icon={<SettingsIcon />}>
                <FormRow>
                    <FormField label="Priority">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className={selectClasses}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </FormField>
                    <FormField label="Status">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className={selectClasses}
                        >
                            <option value="open">Open</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </FormField>
                </FormRow>
            </FormCard>
        </Modal>
    );
};

export default TicketFormModal;
