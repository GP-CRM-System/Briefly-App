import { useQuery } from "@tanstack/react-query";
import { auditService } from "./audit.service";

export const auditKeys = {
    all: ["audit"] as const,
    list: () => [...auditKeys.all, "list"] as const,
    forUser: (userId: string) => [...auditKeys.all, "user", userId] as const,
};

export const useAuditLogs = (params?: { page?: number; limit?: number; targetType?: string; action?: string }) =>
    useQuery({
        queryKey: [...auditKeys.list(), params],
        queryFn: () => auditService.getAll(params),
    });

export const useAuditLogsForUser = (userId: string, params?: { page?: number; limit?: number }) =>
    useQuery({
        queryKey: auditKeys.forUser(userId),
        queryFn: () => auditService.getForUser(userId, params),
        enabled: !!userId,
    });
