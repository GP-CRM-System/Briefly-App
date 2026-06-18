import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { ChurnResult, SegmentResult, ProductRecommendation, AiHealth, ChurnResultsData, SegmentResultsData } from "./types";

export interface AiProduct {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    category?: string;
    type?: string;
    vendor?: string;
    brand?: string;
    tags?: string[];
    status?: string;
    totalSold?: number;
    totalRevenue?: number | string;
    rating?: number | null;
    image?: string;
    imageUrl?: string;
}

export interface AiCustomerBrief {
    id: string;
    name: string;
    email: string;
}

export interface AiCustomerDetail {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    totalSpent?: string | number;
    totalOrders?: number;
    lifecycleStage?: string;
    tags?: string[];
    churnRiskScore?: number | null;
    productInteractions?: Array<{
        id: string;
        interactionType: string;
        rating?: number | null;
        device?: string | null;
        createdAt: string;
        product?: { id: string; name: string } | null;
    }>;
    customerEvents?: Array<{
        id: string;
        eventType: string;
        description?: string;
        occurredAt: string;
    }>;
    orders?: Array<{
        id: string;
        totalAmount?: string | number;
        createdAt: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

export const aiService = {
    async computeChurn(): Promise<{ totalCustomers: number; results: ChurnResult[] }> {
        const { data } = await apiClient.post(ENDPOINTS.AI.COMPUTE_CHURN);
        return data?.data || data;
    },

    async getChurnResults(riskLevel?: string): Promise<ChurnResultsData> {
        const params: Record<string, string> = { limit: "1000" };
        if (riskLevel) params.riskLevel = riskLevel;
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_CHURN, { params });
        // Backend uses ResponseHandler.paginated() — data field is the raw array, total is in pagination
        const customers = data?.data || data || [];
        const total = data?.pagination?.total ?? (Array.isArray(customers) ? customers.length : 0);
        return {
            customers: Array.isArray(customers) ? customers : [],
            total,
        };
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
        const raw = data?.data || data;
        if (!raw) return null;
        // HF API returns snake_case (item_id), normalize to camelCase (itemId)
        const recs = (raw.recommendations ?? []).map((r: any) => ({
            itemId: r.item_id ?? r.itemId,
            similarity: r.similarity,
        }));
        return {
            productId: raw.productId ?? raw.product_id,
            recommendations: recs,
        };
    },

    async getHealth(): Promise<AiHealth> {
        const { data } = await apiClient.get(ENDPOINTS.AI.GET_HEALTH);
        return data?.data || data;
    },

    // ── Catalog Intelligence ──

    async getAllProducts(): Promise<AiProduct[]> {
        const { data } = await apiClient.get(ENDPOINTS.PRODUCT.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    // ── Customer 360 ──

    async getAllCustomers(): Promise<AiCustomerBrief[]> {
        const { data } = await apiClient.get(ENDPOINTS.CUSTOMER.GET_ALL, {
            params: { limit: 1000 }
        });
        const items: any[] = data?.data || data || [];
        return items.map((c: any) => ({
            id: c.id,
            name: c.name || c.email || c.id,
            email: c.email || "",
        }));
    },

    async getCustomerDetail(id: string): Promise<AiCustomerDetail> {
        const { data } = await apiClient.get(ENDPOINTS.CUSTOMER.GET_ONE(id));
        const c = data?.data || data;
        return c;
    },
};
