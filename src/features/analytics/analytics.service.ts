import apiClient from "@/api/client";

export interface AnalyticsSummary {
    total: number;
    change: number;
}

export interface CampaignPerformancePoint {
    date: string;
    orders: number;
    conversions: number;
}

export interface TopProduct {
    name: string;
    sales: number;
}

export interface TopEmployee {
    name: string;
    activityCount: number;
}

export interface AnalyticsData {
    summary: {
        customers: AnalyticsSummary;
        products: AnalyticsSummary;
        orders: AnalyticsSummary;
    };
    campaignPerformance: CampaignPerformancePoint[];
    ticketsByStatus: Record<string, number>;
    customersByLifecycle: Record<string, number>;
    ordersByShipping: Record<string, number>;
    topProducts: TopProduct[];
    supportOverview: {
        totalResolved: number;
        topEmployee: TopEmployee | null;
    };
    campaignConversions: number;
}

export const analyticsService = {
    async getAnalytics(): Promise<AnalyticsData> {
        const { data } = await apiClient.get("/analytics");
        return data?.data || data;
    },
};
