import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";

export const dashboardKeys = {
    all: ["dashboard"] as const,
    stats: () => [...dashboardKeys.all, "stats"] as const,
};

/** Fetch all dashboard data (stats, sales overview, ticket breakdown, customer events) */
export const useDashboardData = () =>
    useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: dashboardService.getDashboard,
    });
