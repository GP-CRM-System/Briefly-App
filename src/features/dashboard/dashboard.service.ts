import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { DashboardData, AuditLogEntry } from "./types";

export const dashboardService = {
    async getDashboard(): Promise<DashboardData> {
        const { data } = await apiClient.get(ENDPOINTS.REPORT.DASHBOARD);
        return data?.data || data;
    },

    async getAuditLogs(): Promise<AuditLogEntry[]> {
        const { data } = await apiClient.get(ENDPOINTS.AUDIT_LOG.GET_ALL);
        const list = data?.data ?? data;
        return Array.isArray(list) ? list : [];
    },
};
