import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "./conversation.service";
import type { SendMessagePayload, StartConversationPayload } from "./types";
import toast from "react-hot-toast";

export const conversationKeys = {
    all:        ["conversations"] as const,
    list:       () => [...conversationKeys.all, "list"] as const,
    messages:   (id: string) => [...conversationKeys.all, "messages", id] as const,
};

export const useConversations = () =>
    useQuery({
        queryKey: conversationKeys.list(),
        queryFn: conversationService.getAll,
    });

export const useConversationMessages = (id: string | undefined, page = 1) =>
    useQuery({
        queryKey: conversationKeys.messages(id!),
        queryFn: () => conversationService.getMessages(id!, page),
        enabled: !!id,
    });

export const useStartConversation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: StartConversationPayload) =>
            conversationService.startConversation(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: conversationKeys.all });
            toast.success("Message sent!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to start conversation");
        },
    });
};

export const useSendMessage = (conversationId: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: SendMessagePayload) =>
            conversationService.sendMessage(conversationId!, payload),
        onSuccess: () => {
            if (conversationId) {
                qc.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
                qc.invalidateQueries({ queryKey: conversationKeys.all });
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to send message");
        },
    });
};
