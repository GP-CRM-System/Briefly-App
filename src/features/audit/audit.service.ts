import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";

export interface AuditLogEntry {
    id: string;
    organizationId: string;
    userId: string | null;
    action: string;
    targetId: string;
    targetType: string;
    createdAt: string;
    updatedAt: string;
    user?: { name: string; email: string } | null;
}

export interface PaginatedAuditLogs {
    data: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
}

export const auditService = {
    async getAll(params?: { page?: number; limit?: number; targetType?: string; action?: string }): Promise<PaginatedAuditLogs> {
        const { data: body } = await apiClient.get(ENDPOINTS.AUDIT_LOG.GET_ALL, { params });
        const items = body?.data || [];
        const pagination = body?.pagination || { total: 0, page: 1, limit: 20 };
        return { data: Array.isArray(items) ? items : [], total: pagination.total, page: pagination.page, limit: pagination.limit };
    },

    async getForUser(userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedAuditLogs> {
        const { data: body } = await apiClient.get(ENDPOINTS.AUDIT_LOG.GET_FOR_USER(userId), { params });
        const items = body?.data || [];
        const pagination = body?.pagination || { total: 0, page: 1, limit: 20 };
        return { data: Array.isArray(items) ? items : [], total: pagination.total, page: pagination.page, limit: pagination.limit };
    },
};
