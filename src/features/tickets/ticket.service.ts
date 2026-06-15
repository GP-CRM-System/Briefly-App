import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Ticket } from "./types";

function normalizeTicket(t: any): Ticket {
    if (!t) return t;
    return {
        ...t,
        customerName: t.customer?.name || t.customerName || "",
        customerEmail: t.customer?.email || t.customerEmail || "",
        customerPhone: t.customer?.phone || t.customerPhone || "",
        customerId: t.customerId || t.customer?.id || "",
        orderId: t.orderId || t.order?.id || "",
        status: (t.status || "open").toLowerCase(),
        priority: (t.priority || "medium").toLowerCase(),
        createdAt: t.createdAt || t.updatedAt,
        assignee: t.assignedTo?.name || t.assignee || "Admin User",
        notes: (t.notes || []).map((n: any) => ({
            id: n.id,
            content: n.body || n.content,
            createdAt: n.createdAt,
            author: n.author?.name || (typeof n.author === "string" ? n.author : undefined) || "Sarah Ahmed"
        }))
    };
}

export const ticketService = {
    async getAll(): Promise<Ticket[]> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ALL);
        const rawTickets = data?.data || data || [];
        return rawTickets.map(normalizeTicket);
    },

    async getOne(id: string): Promise<Ticket> {
        const { data } = await apiClient.get(ENDPOINTS.TICKET.GET_ONE(id));
        return normalizeTicket(data?.data || data);
    },

    async create(payload: Record<string, unknown>): Promise<Ticket> {
        const { data } = await apiClient.post(ENDPOINTS.TICKET.CREATE, payload);
        return normalizeTicket(data?.data || data);
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Ticket> {
        const { data } = await apiClient.patch(ENDPOINTS.TICKET.UPDATE(id), payload);
        return normalizeTicket(data?.data || data);
    },

    async delete(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.TICKET.DELETE(id));
    },

    async addNote(id: string, content: string): Promise<any> {
        const { data } = await apiClient.post(ENDPOINTS.TICKET.ADD_NOTE(id), { content });
        return data?.data || data;
    }
};
