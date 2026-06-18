import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Customer } from "./types";

/** Thin service layer — keeps API logic out of components */
export const customerService = {

    async getAll(): Promise<Customer[]> {
        const { data } = await apiClient.get(ENDPOINTS.CUSTOMER.GET_ALL, {
            params: { limit: 1000 }
        });
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Customer> {
        const { data } = await apiClient.get(ENDPOINTS.CUSTOMER.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Customer> {
        const { data } = await apiClient.post(ENDPOINTS.CUSTOMER.CREATE, payload);
        return data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Customer> {
        const { data } = await apiClient.patch(ENDPOINTS.CUSTOMER.UPDATE(id), payload);
        return data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.CUSTOMER.DELETE(id));
    },

    async addNote(id: string, content: string): Promise<void> {
        await apiClient.post(ENDPOINTS.CUSTOMER.CREATE_NOTE(id), { body: content });
    },
};
