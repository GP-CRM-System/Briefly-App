import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { DashboardReport, AuditReport } from "./types";

export const dashboardService = {
  async getDashboard(): Promise<DashboardReport> {
    const { data } = await apiClient.get(ENDPOINTS.REPORT.DASHBOARD);

    return data?.data || data;
  },

  async getAudit(): Promise<AuditReport> {
    const { data } = await apiClient.get(ENDPOINTS.REPORT.AUDIT);
    return data?.data || data;
  },
};
