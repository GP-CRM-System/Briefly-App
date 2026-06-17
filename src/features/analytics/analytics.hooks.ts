import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "./analytics.service";

export const analyticsKeys = {
    all: ["analytics"] as const,
    data: () => [...analyticsKeys.all, "data"] as const,
};

export const useAnalytics = () =>
    useQuery({
        queryKey: analyticsKeys.data(),
        queryFn: analyticsService.getAnalytics,
    });
