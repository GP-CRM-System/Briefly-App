export interface Conversation {
    id: string;
    organizationId: string;
    customerId: string;
    externalId: string;
    provider: "facebook" | "whatsapp" | "instagram";
    status: "OPEN" | "PENDING" | "CLOSED";
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
    customer: {
        name: string;
        email: string;
    } | null;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: "text" | "image" | "document" | "template";
    direction: "INBOUND" | "OUTBOUND";
    status: "SENT" | "DELIVERED" | "READ" | "FAILED";
    errorMessage?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

export interface SendMessagePayload {
    content: string;
    type?: "text" | "image" | "document" | "template";
    metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
