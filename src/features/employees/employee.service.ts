import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Employee } from "./types";

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const { data } = await apiClient.get(ENDPOINTS.ORGANIZATION.LIST_MEMBERS);
        // Better Auth or custom member lists usually wrap members in a 'members' or 'data' array
        return data?.members || data?.data || data || [];
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
