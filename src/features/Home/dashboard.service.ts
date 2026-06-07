import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { DashboardReport, AuditReport } from "./types";

/** Thin service layer — keeps API logic out of components */
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
