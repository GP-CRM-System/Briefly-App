import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Template } from "./types";

export const templateService = {
    async getAll(): Promise<Template[]> {
        const { data } = await apiClient.get(ENDPOINTS.TEMPLATE.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || [];
    },

    async getOne(id: string): Promise<Template> {
        const { data } = await apiClient.get(ENDPOINTS.TEMPLATE.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Template> {
        const { data } = await apiClient.post(ENDPOINTS.TEMPLATE.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Template> {
        const { data } = await apiClient.patch(ENDPOINTS.TEMPLATE.UPDATE(id), payload);
        return data?.data || data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.TEMPLATE.DELETE(id));
    },

    async preview(id: string): Promise<{ subject: string; body: string }> {
        const { data } = await apiClient.get(ENDPOINTS.TEMPLATE.PREVIEW(id));
        return data?.data || data;
    },
};
