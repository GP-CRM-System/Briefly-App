import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Campaign, CampaignStats, Template } from "./types";
import type { Segment } from "@/features/segments/types";

export const campaignService = {
    async getAll(): Promise<Campaign[]> {
        const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN.GET_ALL, {
            params: { limit: 1000 }
        });
        // Backend returns { success, data: [...], pagination } via ResponseHandler.paginated
        return data?.data || [];
    },

    async getOne(id: string): Promise<Campaign> {
        const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN.GET_ONE(id));
        // Backend returns { success, data: campaign } via ResponseHandler.success
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Campaign> {
        const { data } = await apiClient.post(ENDPOINTS.CAMPAIGN.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Campaign> {
        const { data } = await apiClient.patch(ENDPOINTS.CAMPAIGN.UPDATE(id), payload);
        return data?.data || data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.CAMPAIGN.DELETE(id));
    },

    async sendCampaign(id: string): Promise<void> {
        await apiClient.post(ENDPOINTS.CAMPAIGN.SEND(id));
    },

    async getStats(id: string): Promise<CampaignStats> {
        const { data } = await apiClient.get(ENDPOINTS.CAMPAIGN.STATS(id));
        return data?.data || data;
    },

    async getTemplates(): Promise<Template[]> {
        const { data } = await apiClient.get(ENDPOINTS.TEMPLATE.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    async getSegments(): Promise<Segment[]> {
        const { data } = await apiClient.get(ENDPOINTS.SEGMENT.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },
};
