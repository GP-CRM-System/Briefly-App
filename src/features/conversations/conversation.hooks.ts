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
        onMutate: async (newMessage) => {
            if (!conversationId) return;

            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await qc.cancelQueries({ queryKey: conversationKeys.messages(conversationId) });

            // Snapshot the previous value
            const previousMessages = qc.getQueryData(conversationKeys.messages(conversationId));

            // Optimistically update to the new value
            qc.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    const tempId = `temp-${Date.now()}`;
                    const tempMessage = {
                        id: tempId,
                        conversationId: conversationId,
                        content: newMessage.content,
                        direction: "OUTBOUND",
                        type: newMessage.type || "text",
                        status: "PENDING",
                        metadata: newMessage.metadata || {},
                        createdAt: new Date().toISOString()
                    };

                    if (!oldData) {
                        return {
                            data: [tempMessage],
                            total: 1
                        };
                    }

                    return {
                        ...oldData,
                        data: [...oldData.data, tempMessage],
                        total: (oldData.total || 0) + 1
                    };
                }
            );

            // Return a context object with the snapshotted value
            return { previousMessages };
        },
        onError: (err: any, _variables, context) => {
            toast.error(err?.response?.data?.message || "Failed to send message");
            if (conversationId && context?.previousMessages) {
                qc.setQueryData(conversationKeys.messages(conversationId), context.previousMessages);
            }
        },
        onSuccess: () => {
            if (conversationId) {
                qc.invalidateQueries({ queryKey: conversationKeys.all });
            }
        },
        onSettled: () => {
            if (conversationId) {
                qc.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
            }
        }
    });
};

export const useAssignConversation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ conversationId, assignedAgentId }: { conversationId: string; assignedAgentId: string | null }) =>
            conversationService.assignConversation(conversationId, assignedAgentId),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: conversationKeys.all });
            qc.invalidateQueries({ queryKey: conversationKeys.messages(variables.conversationId) });
            toast.success("Conversation assignment updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to assign conversation");
        },
    });
};
