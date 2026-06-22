import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";

export interface Tag {
    id: string;
    name: string;
    color: string;
    organizationId?: string;
}

export const tagService = {
    async list(search?: string): Promise<Tag[]> {
        const params: Record<string, unknown> = { limit: 100 };
        if (search) params.search = search;
        const { data } = await apiClient.get(ENDPOINTS.TAG.LIST, { params });
        return data?.data || data || [];
    },

    async create(payload: { name: string; color: string }): Promise<Tag> {
        const { data } = await apiClient.post(ENDPOINTS.TAG.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: { name?: string; color?: string }): Promise<Tag> {
        const { data } = await apiClient.patch(ENDPOINTS.TAG.UPDATE(id), payload);
        return data?.data || data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.TAG.DELETE(id));
    },
};
