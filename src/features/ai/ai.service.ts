import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { ChurnResult, SegmentResult, ProductRecommendation, AiHealth, ChurnResultsData, SegmentResultsData } from "./types";

export const aiService = {
    async computeChurn(): Promise<{ totalCustomers: number; results: ChurnResult[] }> {
        const { data } = await apiClient.post(ENDPOINTS.AI.COMPUTE_CHURN);
        return data?.data || data;
    },

    async getChurnResults(riskLevel?: string): Promise<ChurnResultsData> {
        const params: Record<string, string> = { limit: "1000" };
        if (riskLevel) params.riskLevel = riskLevel;
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_CHURN, { params });
        return data?.data || data;
    },

    async computeSegments(): Promise<{ totalCustomers: number; distribution: unknown[]; results: SegmentResult[] }> {
        const { data } = await apiClient.post(ENDPOINTS.AI.COMPUTE_SEGMENTS);
        return data?.data || data;
    },

    async getSegmentResults(): Promise<SegmentResultsData> {
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_SEGMENTS);
        return data?.data || data;
    },

    async computeRecommendations(): Promise<{ totalItems: number; totalInteractions: number }> {
        const { data } = await apiClient.post(ENDPOINTS.AI.COMPUTE_RECOMMENDATIONS);
        return data?.data || data;
    },

    async getProductRecommendations(productId: string): Promise<ProductRecommendation | null> {
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_RECOMMENDATIONS(productId));
        return data?.data || data;
    },

    async getHealth(): Promise<AiHealth> {
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_HEALTH);
        return data?.data || data;
    },
};
