import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Product } from "./types";

/** Thin service layer — keeps API logic out of components */
export const productService = {

    async getAll(): Promise<Product[]> {
        const { data } = await apiClient.get(ENDPOINTS.PRODUCT.GET_ALL);
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Product> {
        const { data } = await apiClient.get(ENDPOINTS.PRODUCT.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Product> {
        const { data } = await apiClient.post(ENDPOINTS.PRODUCT.CREATE, payload);
        return data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Product> {
        const { data } = await apiClient.patch(ENDPOINTS.PRODUCT.UPDATE(id), payload);
        return data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.PRODUCT.DELETE(id));
    },
};
