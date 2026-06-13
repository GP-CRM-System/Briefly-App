import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket, connectSocket, disconnectSocket } from "@/lib/socket";
import { conversationKeys } from "@/features/conversations/conversation.hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePresenceStore } from "@/store/presence.store";

const playChime = () => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
        console.warn("Failed to play notification sound:", e);
    }
};

export const useSocketEvents = () => {
    const queryClient = useQueryClient();
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (token) {
            connectSocket();
        } else {
            disconnectSocket();
        }

        return () => {
            disconnectSocket();
        };
    }, [token]);

    useEffect(() => {
        const syncOnlineList = () => {
            socket.emit("presence:get_online", (users: string[]) => {
                usePresenceStore.getState().setOnlineUsers(users);
            });
        };

        const handleConnect = () => {
            console.log("[Socket] Socket client successfully connected. ID:", socket.id);
            syncOnlineList();
        };

        const handlePresenceUpdate = (data: { userId: string; status: "online" | "offline" }) => {
            const { userId, status } = data;
            if (status === "online") {
                usePresenceStore.getState().addOnlineUser(userId);
            } else {
                usePresenceStore.getState().removeOnlineUser(userId);
            }
        };

        const handleTypingStatus = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
            const { conversationId, userId, isTyping } = data;
            usePresenceStore.getState().setTyping(conversationId, userId, isTyping);
        };

        const handleMessageCreated = (data: { conversation: any; message: any }) => {
            console.log("[Socket] Received message:created event:", data);
            const { conversation, message } = data;
            
            if (!message) {
                console.warn("[Socket] message:created event received with empty message payload!");
                return;
            }

            // Play sound for inbound messages
            if (message.direction === "INBOUND") {
                console.log("[Socket] Playing chime for inbound message");
                playChime();
            }

            // 1. Update the message thread cache if it exists
            const messagesQueryKey = conversationKeys.messages(message.conversationId);
            const existingCache = queryClient.getQueryData(messagesQueryKey);

            if (!existingCache) {
                console.log("[Socket] No existing messages cache found, invalidating query to fetch latest thread.");
                queryClient.invalidateQueries({ queryKey: messagesQueryKey });
            } else {
                console.log(`[Socket] Updating message thread cache for conversation: ${message.conversationId}`);
                queryClient.setQueryData(
                    messagesQueryKey,
                    (oldData: any) => {
                        console.log("[Socket] Current messages cache state:", oldData);
                        if (!oldData) return oldData;
                        if (oldData.data.some((m: any) => m.id === message.id)) {
                            console.log("[Socket] Message already exists in cache, skipping duplicate append.");
                            return oldData;
                        }

                        // Match and replace any pending optimistic message to prevent duplication
                        if (message.direction === "OUTBOUND") {
                            // 1. Try exact content match first
                            let pendingIndex = oldData.data.findIndex(
                                (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND" && m.content === message.content
                            );
                            
                            // 2. Fallback to trimmed content match
                            if (pendingIndex === -1) {
                                pendingIndex = oldData.data.findIndex(
                                    (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND" && m.content.trim() === message.content.trim()
                                );
                            }

                            // 3. Fallback to matching the first pending outbound message
                            if (pendingIndex === -1) {
                                pendingIndex = oldData.data.findIndex(
                                    (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND"
                                );
                            }

                            if (pendingIndex > -1) {
                                console.log("[Socket] Found matching pending optimistic message, replacing it.");
                                const newData = [...oldData.data];
                                newData[pendingIndex] = message;
                                return {
                                    ...oldData,
                                    data: newData
                                };
                            }
                        }

                        const updated = {
                            ...oldData,
                            data: [...oldData.data, message],
                            total: (oldData.total || 0) + 1
                        };
                        console.log("[Socket] Updated messages cache state:", updated);
                        return updated;
                    }
                );
            }

            // 2. Update the conversations list cache
            if (conversation) {
                console.log("[Socket] Updating conversations list cache with conversation:", conversation);
                queryClient.setQueryData(
                    conversationKeys.list(),
                    (oldData: any) => {
                        if (!oldData) return [conversation];
                        const filtered = oldData.filter((c: any) => c.id !== conversation.id);
                        return [conversation, ...filtered];
                    }
                );
            } else {
                console.log("[Socket] No conversation payload present in message:created event (message-only event).");
            }
        };

        const handleMessageStatusUpdated = (data: {
            conversationId: string;
            messageId: string;
            status: string;
            errorMessage: string | null;
            message?: any;
        }) => {
            const { conversationId, messageId, status, errorMessage, message } = data;

            // Update message status in the thread cache
            queryClient.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((m: any) =>
                            m.id === messageId
                                ? message
                                    ? { ...m, ...message, status, errorMessage }
                                    : { ...m, status, errorMessage }
                                : m
                        )
                    };
                }
            );
        };

        const handleUploadProgress = (data: {
            conversationId: string;
            messageId: string;
            progress: number;
        }) => {
            const { conversationId, messageId, progress } = data;

            queryClient.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        data: oldData.data.map((m: any) =>
                            m.id === messageId
                                ? {
                                      ...m,
                                      status: progress === 100 ? 'PROCESSING' : 'UPLOADING',
                                      metadata: {
                                          ...(m.metadata || {}),
                                          uploadProgress: progress
                                      }
                                  }
                                : m
                        )
                    };
                }
            );
        };

        const handleConversationAssigned = (data: { conversation: any; assignedAgentId: string | null }) => {
            const { conversation } = data;
            if (conversation) {
                // Update the conversations list cache with new assigned conversation
                queryClient.setQueryData(
                    conversationKeys.list(),
                    (oldData: any) => {
                        if (!oldData) return [conversation];
                        return oldData.map((c: any) => c.id === conversation.id ? { ...c, ...conversation } : c);
                    }
                );
            }
        };

        const handleInboxUpdated = (data: { conversation: any }) => {
            const { conversation } = data;
            queryClient.setQueryData(
                conversationKeys.list(),
                (oldData: any) => {
                    if (!oldData) return [conversation];
                    const filtered = oldData.filter((c: any) => c.id !== conversation.id);
                    return [conversation, ...filtered];
                }
            );
        };

        // Hook up event listeners
        socket.on("connect", handleConnect);
        socket.on("presence:update", handlePresenceUpdate);
        socket.on("typing:status", handleTypingStatus);
        socket.on("message:created", handleMessageCreated);
        socket.on("message:status_updated", handleMessageStatusUpdated);
        socket.on("upload:progress", handleUploadProgress);
        socket.on("conversation:assigned", handleConversationAssigned);
        socket.on("inbox:updated", handleInboxUpdated);

        // If socket is already connected when hook mounts, trigger sync
        if (socket.connected) {
            syncOnlineList();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("presence:update", handlePresenceUpdate);
            socket.off("typing:status", handleTypingStatus);
            socket.off("message:created", handleMessageCreated);
            socket.off("message:status_updated", handleMessageStatusUpdated);
            socket.off("upload:progress", handleUploadProgress);
            socket.off("conversation:assigned", handleConversationAssigned);
            socket.off("inbox:updated", handleInboxUpdated);
        };
    }, [queryClient]);
};

