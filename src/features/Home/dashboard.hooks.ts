import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

/** Query key factory — keeps keys consistent and enables targeted invalidation */
export const dashboardKeys = {
    all:       ["dashboard"] as const,
    report:    () => [...dashboardKeys.all, "report"] as const,
    audit:     () => [...dashboardKeys.all, "audit"] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

/** Fetch the main dashboard report */
export const useDashboardReport = () =>
    useQuery({
        queryKey: dashboardKeys.report(),
        queryFn: dashboardService.getDashboard,
    });

/** Fetch the audit report */
export const useAuditReport = () =>
    useQuery({
        queryKey: dashboardKeys.audit(),
        queryFn: dashboardService.getAudit,
    });
