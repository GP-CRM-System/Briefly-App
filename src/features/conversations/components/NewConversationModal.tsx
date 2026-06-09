import { useState } from "react";
import Modal, { FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import { useStartConversation } from "../conversation.hooks";

interface NewConversationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (conversationId: string) => void;
}

const NewConversationModal = ({ open, onClose, onSuccess }: NewConversationModalProps) => {
    const [provider, setProvider] = useState<"whatsapp" | "messenger" | "instagram">("whatsapp");
    const [recipientId, setRecipientId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [content, setContent] = useState("");

    const startMutation = useStartConversation();

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
                    setProvider("whatsapp");
                    setRecipientId("");
                    setCustomerName("");
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
            subtitle="Send a message to a new contact"
            onSubmit={handleSubmit}
            submitLabel="Send"
            cancelLabel="Cancel"
            loading={startMutation.isPending}
            width="max-w-[560px]"
        >
            <FormField label="Channel" required>
                <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as typeof provider)}
                    className={selectClasses}
                >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="messenger">Facebook Messenger</option>
                    <option value="instagram">Instagram</option>
                </select>
            </FormField>

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

            <FormField label="Contact Name (optional)">
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ahmed Ali"
                    className={inputClasses}
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
