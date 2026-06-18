import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
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

export const useConversationMessages = (id: string | undefined) =>
    useInfiniteQuery({
        queryKey: conversationKeys.messages(id!),
        queryFn: ({ pageParam = 1 }) => conversationService.getMessages(id!, pageParam as number),
        getNextPageParam: (lastPage) => {
            const totalLoaded = lastPage.page * lastPage.pageSize;
            return totalLoaded < lastPage.total ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
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

            const tempId = `temp-${Date.now()}`;

            // Inject tempId into metadata of the payload sent to the server
            newMessage.metadata = {
                ...(newMessage.metadata || {}),
                tempId
            };

            // Optimistically update to the new value
            qc.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    const tempMessage = {
                        id: tempId,
                        conversationId: conversationId,
                        content: newMessage.content,
                        direction: "OUTBOUND",
                        type: newMessage.type || "text",
                        status: "PENDING",
                        metadata: newMessage.metadata,
                        createdAt: new Date().toISOString()
                    };

                    if (!oldData) {
                        return {
                            pages: [
                                {
                                    data: [tempMessage],
                                    total: 1,
                                    page: 1,
                                    pageSize: 50
                                }
                            ],
                            pageParams: [1]
                        };
                    }

                    const newPages = [...oldData.pages];
                    if (newPages[0]) {
                        newPages[0] = {
                            ...newPages[0],
                            data: [...newPages[0].data, tempMessage],
                            total: (newPages[0].total || 0) + 1
                        };
                    }

                    return {
                        ...oldData,
                        pages: newPages
                    };
                }
            );

            // Return a context object with the snapshotted value and tempId
            return { previousMessages, tempId };
        },
        onError: (err: any, _variables, context) => {
            toast.error(err?.response?.data?.message || "Failed to send message");
            if (conversationId && context?.tempId) {
                // Mark the specific message as FAILED rather than reverting the entire list
                qc.setQueryData(
                    conversationKeys.messages(conversationId),
                    (oldData: any) => {
                        if (!oldData || !oldData.pages) return oldData;
                        const newPages = oldData.pages.map((page: any) => {
                            const pendingIndex = page.data.findIndex((m: any) => m.id === context.tempId);
                            if (pendingIndex > -1) {
                                const newData = [...page.data];
                                newData[pendingIndex] = {
                                    ...newData[pendingIndex],
                                    status: "FAILED",
                                    errorMessage: err?.response?.data?.message || "Failed to send"
                                };
                                return { ...page, data: newData };
                            }
                            return page;
                        });
                        return { ...oldData, pages: newPages };
                    }
                );
            }
        },
        onSuccess: (savedMessage, _variables, context) => {
            if (conversationId && savedMessage && context?.tempId) {
                // 1. Replace the temporary/optimistic message with the saved message
                qc.setQueryData(
                    conversationKeys.messages(conversationId),
                    (oldData: any) => {
                        if (!oldData || !oldData.pages) return oldData;
                        const newPages = oldData.pages.map((page: any) => {
                            let pendingIndex = page.data.findIndex((m: any) => m.id === context.tempId);
                            if (pendingIndex === -1) {
                                pendingIndex = page.data.findIndex((m: any) => m.id === savedMessage.id);
                            }
                            if (pendingIndex > -1) {
                                const newData = [...page.data];
                                const existingMsg = newData[pendingIndex];
                                // Preserve status and error message if already updated by socket
                                const mergedStatus = (existingMsg.status !== 'PENDING' && existingMsg.status !== 'UPLOADING' && existingMsg.status !== 'PROCESSING')
                                    ? existingMsg.status
                                    : savedMessage.status;
                                newData[pendingIndex] = {
                                    ...savedMessage,
                                    status: mergedStatus,
                                    errorMessage: existingMsg.errorMessage || savedMessage.errorMessage
                                };
                                return { ...page, data: newData };
                            }
                            return page;
                        });
                        return { ...oldData, pages: newPages };
                    }
                );

                // 2. Also update the conversation list to move this conversation to the top and update its last message
                qc.setQueryData(
                    conversationKeys.list(),
                    (oldConversations: any) => {
                        if (!oldConversations) return [];
                        const updated = oldConversations.map((c: any) => {
                            if (c.id === conversationId) {
                                return {
                                    ...c,
                                    lastMessage: savedMessage,
                                    lastMessageAt: savedMessage.createdAt,
                                    updatedAt: savedMessage.createdAt
                                };
                            }
                            return c;
                        });
                        // Sort conversations by lastMessageAt descending
                        return [...updated].sort((a: any, b: any) => {
                            const dateA = new Date(a.lastMessageAt || a.createdAt).getTime();
                            const dateB = new Date(b.lastMessageAt || b.createdAt).getTime();
                            return dateB - dateA;
                        });
                    }
                );
            }
        },
        onSettled: () => {
            if (conversationId) {
                // Only refresh conversation list (sidebar). Do NOT invalidate messages here —
                // the message cache is already precisely updated by onSuccess + socket events.
                // Invalidating messages causes a refetch race that can overwrite socket updates,
                // making outbound messages appear to vanish.
                qc.invalidateQueries({ queryKey: conversationKeys.list() });
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

export const useMarkAsRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (conversationId: string) =>
            conversationService.markAsRead(conversationId),
        onSuccess: (_, conversationId) => {
            qc.setQueryData(conversationKeys.list(), (oldConversations: any) => {
                if (!oldConversations) return [];
                return oldConversations.map((c: any) =>
                    c.id === conversationId ? { ...c, unreadCount: 0 } : c
                );
            });
        }
    });
};
