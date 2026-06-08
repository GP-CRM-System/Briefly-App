import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Conversation, Message, SendMessagePayload, PaginatedResponse } from "./types";

export const conversationService = {
    async getAll(): Promise<Conversation[]> {
        const { data } = await apiClient.get(ENDPOINTS.CONVERSATION.GET_ALL);
        return data?.data || data || [];
    },

    async getMessages(id: string, page = 1, pageSize = 50): Promise<PaginatedResponse<Message>> {
        const { data } = await apiClient.get(ENDPOINTS.CONVERSATION.GET_MESSAGES(id), {
            params: { page, pageSize },
        });
        return {
            data: data?.data || [],
            total: data?.pagination?.total || 0,
            page: data?.pagination?.page || page,
            pageSize: data?.pagination?.limit || pageSize,
        };
    },

    async sendMessage(id: string, payload: SendMessagePayload): Promise<Message> {
        const { data } = await apiClient.post(ENDPOINTS.CONVERSATION.SEND_MESSAGE(id), payload);
        return data?.data || data;
    },
};
