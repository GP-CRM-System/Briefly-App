import type { Conversation, Message } from "./types";

export const formatConversationDate = (d: string | null | undefined): string => {
    if (!d) return "";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        }
        if (days === 1) return "Yesterday";
        if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return d;
    }
};

export const formatMessageTime = (d: string): string => {
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
        return d;
    }
};

const PROVIDER_BADGES: Record<string, { label: string; classes: string }> = {
    whatsapp:  { label: "WhatsApp",  classes: "bg-green-100 text-green-700 border-green-200" },
    facebook:  { label: "Messenger", classes: "bg-blue-100 text-blue-700 border-blue-200" },
    instagram: { label: "Instagram", classes: "bg-pink-100 text-pink-700 border-pink-200" },
};

export const getProviderBadge = (provider: string) =>
    PROVIDER_BADGES[provider] || { label: provider, classes: "bg-gray-100 text-gray-600 border-gray-200" };

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
    OPEN:    { label: "Open",    classes: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    PENDING: { label: "Pending", classes: "bg-amber-100 text-amber-700 border-amber-200" },
    CLOSED:  { label: "Closed",  classes: "bg-gray-100 text-gray-600 border-gray-200" },
};

export const getStatusBadge = (status: string) =>
    STATUS_BADGES[status] || { label: status, classes: "bg-gray-100 text-gray-600 border-gray-200" };

const MESSAGE_STATUS_BADGES: Record<string, { label: string; classes: string }> = {
    SENT:     { label: "Sent",     classes: "text-gray-400" },
    DELIVERED:{ label: "Delivered",classes: "text-blue-500" },
    READ:     { label: "Read",     classes: "text-emerald-500" },
    RECEIVED: { label: "Received", classes: "text-gray-400" },
    FAILED:   { label: "Failed",   classes: "text-red-500" },
};

export const getMessageStatusBadge = (status: string) =>
    MESSAGE_STATUS_BADGES[status] || { label: status, classes: "text-gray-400" };

export const MOCK_CONVERSATIONS: Conversation[] = Array.from({ length: 18 }, (_, i) => ({
    id: `conv-${i + 1}`,
    organizationId: "org-1",
    customerId: `cust-${i + 1}`,
    externalId: `ext_${i}`,
    provider: (["facebook", "whatsapp", "instagram"] as const)[i % 3],
    status: (["OPEN", "PENDING", "CLOSED"] as const)[i % 3],
    lastMessageAt: new Date(Date.now() - i * 3600000).toISOString(),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
    customer: {
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@email.com`,
    },
}));

export const MOCK_MESSAGES: Message[] = Array.from({ length: 20 }, (_, i) => ({
    id: `msg-${i + 1}`,
    conversationId: "conv-1",
    content: i % 2 === 0
        ? "Hi! I was wondering about my order status. It's been a few days and I haven't received any updates."
        : "Hi there! Let me check that for you right away. Could you please provide your order number?",
    type: "text",
    direction: i % 2 === 0 ? "INBOUND" : "OUTBOUND",
    status: i % 5 === 0 ? "FAILED" : "SENT",
    errorMessage: i % 5 === 0 ? "Meta API unavailable" : null,
    createdAt: new Date(Date.now() - (19 - i) * 60000).toISOString(),
}));
