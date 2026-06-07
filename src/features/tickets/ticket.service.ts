import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Ticket } from "./types";

export const ticketService = {
    async getAll(): Promise<Ticket[]> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ALL);
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Ticket> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Ticket> {
        const { data } = await apiClient.post(ENDPOINTS.TICKET.CREATE, payload);
        return data?.data || data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Ticket> {
        const { data } = await apiClient.patch(ENDPOINTS.TICKET.UPDATE(id), payload);
        return data?.data || data;
    },

    async addNote(id: string, content: string): Promise<any> {
        const { data } = await apiClient.post(ENDPOINTS.TICKET.ADD_NOTE(id), { content });
        return data?.data || data;
    }
};
