export interface Conversation {
    id: string;
    organizationId: string;
    customerId: string;
    externalId: string;
    provider: "facebook" | "messenger" | "whatsapp" | "instagram";
    status: "OPEN" | "PENDING" | "CLOSED";
    lastMessageAt: string | null;
    createdAt: string;
    updatedAt: string;
    assignedAgentId?: string | null;
    unreadCount?: number;
    customer: {
        name: string;
        email: string;
    } | null;
    messages?: Message[];
}

export interface MessageMetadata {
    fileName?: string;
    mimeType?: string;
    size?: number;
    originalName?: string;
    storageKey?: string;
    uploadProgress?: number;
    localPreviewUrl?: string;
    [key: string]: any;
}

export interface Message {
    id: string;
    conversationId: string;
    content: string;
    type: "text" | "image" | "document" | "template" | "audio" | "video" | "sticker";
    direction: "INBOUND" | "OUTBOUND";
    status: "SENT" | "DELIVERED" | "READ" | "FAILED" | "PENDING" | "PROCESSING" | "UPLOADING";
    errorMessage?: string | null;
    metadata?: MessageMetadata | null;
    createdAt: string;
}

export interface SendMessagePayload {
    content: string;
    type?: "text" | "image" | "document" | "template" | "audio" | "video" | "sticker";
    metadata?: Record<string, unknown>;
}

export interface StartConversationPayload {
    provider: "whatsapp" | "facebook" | "messenger" | "instagram";
    recipientId: string;
    content: string;
    type?: "text" | "image" | "document" | "template" | "audio" | "video" | "sticker";
    customerPhone?: string;
    customerName?: string;
    metadata?: Record<string, unknown>;
}

export interface StartConversationResult {
    conversation: Conversation;
    message: Message;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}
