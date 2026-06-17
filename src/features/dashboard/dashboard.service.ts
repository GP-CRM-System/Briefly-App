import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { DashboardData } from "./types";

export const dashboardService = {
    async getDashboard(): Promise<DashboardData> {
        const { data } = await apiClient.get(ENDPOINTS.REPORT.DASHBOARD);
        return data?.data || data;
    },
};
