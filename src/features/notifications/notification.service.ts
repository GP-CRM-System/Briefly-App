import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Notification, UnreadCountResponse } from "./types";

export const notificationService = {
    async getAll(): Promise<Notification[]> {
        const { data } = await apiClient.get(ENDPOINTS.NOTIFICATION.GET_ALL);
        // Handle paginated { data: [...] } or plain array responses
        const list = data?.data ?? data;
        return Array.isArray(list) ? list : [];
    },

    async getOne(id: string): Promise<Notification> {
        const { data } = await apiClient.get(ENDPOINTS.NOTIFICATION.GET_ONE(id));
        return data?.data || data;
    },

    async getUnreadCount(): Promise<number> {
        const { data } = await apiClient.get(ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
        // Handle both { count: N } and { data: { count: N } } shapes
        const result: UnreadCountResponse = data?.data || data;
        return result?.count ?? 0;
    },

    async markRead(id: string): Promise<Notification> {
        const { data } = await apiClient.patch(ENDPOINTS.NOTIFICATION.MARK_READ(id));
        return data?.data || data;
    },

    async markAllRead(): Promise<void> {
        await apiClient.patch(ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.NOTIFICATION.DELETE(id));
    },
};
