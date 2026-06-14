import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Ticket } from "./types";

const normalizeTicket = (item: Record<string, any>): Ticket => ({
    id: item.id,
    customerName: item.customer?.name || item.customerName || "",
    customerEmail: item.customer?.email,
    customerPhone: item.customer?.phone,
    customerId: item.customer?.id || item.customerId,
    orderId: item.order?.id || item.orderId,
    subject: item.subject || "",
    description: item.description || "",
    status: item.status?.toLowerCase() || "open",
    priority: item.priority?.toLowerCase() || "medium",
    assignee: item.assignedTo?.name || item.assignee,
    name: item.name || item.subject || "",
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
});

export const ticketService = {
    async getAll(): Promise<Ticket[]> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ALL, {
            params: { limit: 1000 }
        });
        const items: any[] = data?.data || data || [];
        return items.map(normalizeTicket);
    },

    async getOne(id: string): Promise<Ticket> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ONE(id));
        return normalizeTicket(data?.data || data);
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
