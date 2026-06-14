import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Employee } from "./types";

const normalizeMember = (item: Record<string, any>): Employee => ({
    id: item.id,
    userId: item.userId,
    name: item.user?.name || item.name,
    email: item.user?.email || item.email,
    phone: item.phone,
    role: item.role,
    createdAt: item.createdAt,
    status: item.status,
    location: item.location,
});

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const { data } = await apiClient.get(ENDPOINTS.ORGANIZATION.LIST_MEMBERS, {
            params: { limit: 1000 }
        });
        const items: any[] = data?.members || data?.data || data || [];
        return items.map(normalizeMember);
    },

    async invite(payload: { email: string; role: string }): Promise<any> {
        const { data } = await apiClient.post(ENDPOINTS.ORGANIZATION.INVITE_MEMBER, payload);
        return data;
    },

    async updateRole(id: string, role: string): Promise<any> {
        const { data } = await apiClient.post(ENDPOINTS.ORGANIZATION.UPDATE_MEMBER_ROLE, { memberId: id, role });
        return data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.post(ENDPOINTS.ORGANIZATION.REMOVE_MEMBER, { memberId: id });
    }
};
