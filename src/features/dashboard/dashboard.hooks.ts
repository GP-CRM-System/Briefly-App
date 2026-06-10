import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

export const dashboardKeys = {
    all: ["dashboard"] as const,
    stats: () => [...dashboardKeys.all, "stats"] as const,
    audit: () => [...dashboardKeys.all, "audit"] as const,
};

/** Fetch all dashboard data (stats, sales overview, ticket breakdown) */
export const useDashboardData = () =>
    useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: dashboardService.getDashboard,
    });

/** Fetch recent audit log entries */
export const useAuditLogs = () =>
    useQuery({
        queryKey: dashboardKeys.audit(),
        queryFn: dashboardService.getAuditLogs,
    });
