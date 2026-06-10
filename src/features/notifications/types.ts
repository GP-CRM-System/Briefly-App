export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "error" | "success";
    isRead: boolean;
    createdAt: string;
    updatedAt?: string;
    /** Optional link to navigate to when clicked */
    link?: string;
    /** Optional metadata (e.g. related entity id) */
    metadata?: Record<string, unknown>;
}

export interface UnreadCountResponse {
    count: number;
}

export interface NotificationListResponse {
    data: Notification[];
    total?: number;
    page?: number;
    limit?: number;
}
