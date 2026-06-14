import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Segment } from "./types";
import type { Customer } from "@/features/customers/types";

export const segmentService = {
    async getAll(): Promise<Segment[]> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Segment> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Segment> {
        const { data } = await apiClient.post(ENDPOINTS.SEGMENT.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Segment> {
        const { data } = await apiClient.patch(ENDPOINTS.SEGMENT.UPDATE(id), payload);
        return data?.data || data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.SEGMENT.DELETE(id));
    },

    async getCustomers(id: string): Promise<Customer[]> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.GET_CUSTOMERS(id), {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    async getCount(id: string): Promise<{ count: number }> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.GET_COUNT(id));
        return data?.data || data || { count: 0 };
    },

    async exportSegment(id: string): Promise<any> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.EXPORT(id));
        return data;
    },
};
