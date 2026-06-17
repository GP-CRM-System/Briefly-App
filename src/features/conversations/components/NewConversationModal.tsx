import { useState } from "react";
import Modal, { FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import { useStartConversation } from "../conversation.hooks";
import { useCustomers } from "@/features/customers/customer.hooks";

interface NewConversationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (conversationId: string) => void;
}

const NewConversationModal = ({ open, onClose, onSuccess }: NewConversationModalProps) => {
    const [mode, setMode] = useState<"existing" | "new">("existing");
    const [provider, setProvider] = useState<"whatsapp" | "messenger" | "instagram">("whatsapp");
    const [recipientId, setRecipientId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [content, setContent] = useState("");

    const startMutation = useStartConversation();
    const { data: customers = [], isLoading: customersLoading } = useCustomers();

    const handleCustomerSelect = (customerId: string, currentProvider: typeof provider) => {
        setSelectedCustomerId(customerId);
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
            setCustomerName(customer.name);
            if (currentProvider === "whatsapp") {
                setRecipientId(customer.phone || "");
            } else {
                setRecipientId(customer.phone || customer.email || "");
            }
        } else {
            setCustomerName("");
            setRecipientId("");
        }
    };

    const handleProviderChange = (newProvider: typeof provider) => {
        setProvider(newProvider);
        if (mode === "existing" && selectedCustomerId) {
            const customer = customers.find((c) => c.id === selectedCustomerId);
            if (customer) {
                if (newProvider === "whatsapp") {
                    setRecipientId(customer.phone || "");
                } else {
                    setRecipientId(customer.phone || customer.email || "");
                }
            }
        }
    };

    const handleModeChange = (newMode: "existing" | "new") => {
        setMode(newMode);
        setSelectedCustomerId("");
        setRecipientId("");
        setCustomerName("");
    };

    const handleSubmit = () => {
        if (!recipientId.trim() || !content.trim()) return;
        startMutation.mutate(
            {
                provider,
                recipientId: recipientId.trim(),
                content: content.trim(),
                customerName: customerName.trim() || undefined,
                type: "text",
            },
            {
                onSuccess: (result) => {
                    onClose();
                    setMode("existing");
                    setProvider("whatsapp");
                    setRecipientId("");
                    setCustomerName("");
                    setSelectedCustomerId("");
                    setContent("");
                    onSuccess(result.conversation.id);
                },
            }
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New Conversation"
            subtitle="Start a chat with a contact"
            onSubmit={handleSubmit}
            submitLabel="Send"
            cancelLabel="Cancel"
            loading={startMutation.isPending}
            width="max-w-[560px]"
        >
            {/* Mode Toggle Switch */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                <button
                    type="button"
                    onClick={() => handleModeChange("existing")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === "existing"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    Existing Customer
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange("new")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === "new"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    New Contact
                </button>
            </div>

            <FormField label="Channel" required>
                <select
                    value={provider}
                    onChange={(e) => handleProviderChange(e.target.value as typeof provider)}
                    className={selectClasses}
                >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Facebook Messenger</option>
                    <option value="instagram">Instagram</option>
                </select>
            </FormField>

            {mode === "existing" && (
                <FormField label="Select Customer" required>
                    <select
                        value={selectedCustomerId}
                        onChange={(e) => handleCustomerSelect(e.target.value, provider)}
                        className={selectClasses}
                        disabled={customersLoading}
                    >
                        <option value="">-- Choose a Customer --</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.phone ? `(${c.phone})` : c.email ? `(${c.email})` : ""}
                            </option>
                        ))}
                    </select>
                </FormField>
            )}

            <FormField
                label={provider === "whatsapp" ? "Phone Number" : "Recipient ID"}
                required
            >
                <input
                    type="text"
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    placeholder={
                        provider === "whatsapp"
                            ? "+201234567890"
                            : provider === "messenger"
                              ? "Page-scoped user ID (PSID)"
                              : "Instagram-scoped ID (IGSID)"
                    }
                    className={inputClasses}
                />
            </FormField>
            {mode === "existing" && !recipientId && selectedCustomerId && (
                <p className="text-[11px] text-amber-600 mt-[-8px] mb-4">
                    ⚠️ Selected customer has no phone number or ID in profile. Please enter it manually.
                </p>
            )}

            <FormField label="Contact Name (optional)">
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ahmed Ali"
                    className={inputClasses}
                    readOnly={mode === "existing"}
                />
            </FormField>

            <FormField label="Message" required>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] focus:bg-white transition-all resize-none"
                    style={{ minHeight: "100px" }}
                />
            </FormField>
        </Modal>
    );
};

export default NewConversationModal;

