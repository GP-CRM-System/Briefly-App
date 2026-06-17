import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Order } from "./types";

export const orderService = {
    async getAll(): Promise<Order[]> {
        const { data } = await apiClient.get(ENDPOINTS.ORDER.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Order> {
        const { data } = await apiClient.get(ENDPOINTS.ORDER.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Order> {
        const { data } = await apiClient.post(ENDPOINTS.ORDER.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Order> {
        const { data } = await apiClient.patch(ENDPOINTS.ORDER.UPDATE(id), payload);
        return data?.data || data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.ORDER.DELETE(id));
    },

    async addNote(id: string, content: string): Promise<any> {
        // Fallback to local storage or patch note in update if not supported explicitly in backend endpoints
        const { data } = await apiClient.patch(ENDPOINTS.ORDER.UPDATE(id), { note: content });
        return data?.data || data;
    },

    async downloadInvoice(id: string): Promise<Blob> {
        const { data } = await apiClient.get(ENDPOINTS.ORDER.INVOICE(id), {
            responseType: 'blob',
        });
        return data;
    }
};
