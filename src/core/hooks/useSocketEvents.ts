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
        // Do not register event listeners when there is no auth token
        if (!token) return;

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
                console.log("=========================================================");
                console.log(`[Socket] 📥 RECEIVED INBOUND MESSAGE: "${message.content}"`);
                console.log(`         Sender ID: ${message.externalId || "Customer"}`);
                console.log(`         Conversation ID: ${message.conversationId}`);
                console.log("=========================================================");
                playChime();
            } else {
                console.log(`[Socket] Outbound message processed: "${message.content}"`);
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
                        if (!oldData || !oldData.pages) return oldData;

                        // Check if message already exists in any page
                        const alreadyExists = oldData.pages.some((page: any) =>
                            page.data.some((m: any) => m.id === message.id)
                        );
                        if (alreadyExists) {
                            console.log("[Socket] Message already exists in cache, skipping duplicate append.");
                            return oldData;
                        }

                        const newPages = [...oldData.pages];

                        // Match and replace any pending optimistic message to prevent duplication
                        if (message.direction === "OUTBOUND" && newPages[0]) {
                            const eventTempId = message.metadata?.tempId;

                            // 1. Try exact tempId match first
                            let pendingIndex = -1;
                            if (eventTempId) {
                                pendingIndex = newPages[0].data.findIndex(
                                    (m: any) => m.id === eventTempId
                                );
                            }

                            // 2. Try exact content match as fallback
                            if (pendingIndex === -1) {
                                pendingIndex = newPages[0].data.findIndex(
                                    (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND" && m.content === message.content
                                );
                            }
                            
                            // 3. Fallback to trimmed content match
                            if (pendingIndex === -1) {
                                pendingIndex = newPages[0].data.findIndex(
                                    (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND" && m.content.trim() === message.content.trim()
                                );
                            }

                            // 4. Fallback to matching the first pending outbound message
                            if (pendingIndex === -1) {
                                pendingIndex = newPages[0].data.findIndex(
                                    (m: any) => m.status === "PENDING" && m.direction === "OUTBOUND"
                                );
                            }

                            if (pendingIndex > -1) {
                                console.log("[Socket] Found matching pending optimistic message in first page, replacing it.");
                                const newPageData = [...newPages[0].data];
                                const existingMsg = newPageData[pendingIndex];
                                // Preserve status if already updated by status update socket event
                                const mergedStatus = (existingMsg.status !== 'PENDING' && existingMsg.status !== 'UPLOADING' && existingMsg.status !== 'PROCESSING')
                                    ? existingMsg.status
                                    : message.status;
                                newPageData[pendingIndex] = {
                                    ...message,
                                    status: mergedStatus,
                                    errorMessage: existingMsg.errorMessage || message.errorMessage
                                };
                                newPages[0] = {
                                    ...newPages[0],
                                    data: newPageData
                                };
                                return {
                                    ...oldData,
                                    pages: newPages
                                };
                            }
                        }

                        // Append to the first page (newest page)
                        if (newPages[0]) {
                            newPages[0] = {
                                ...newPages[0],
                                data: [...newPages[0].data, message],
                                total: (newPages[0].total || 0) + 1
                            };
                        }
                        const updated = {
                            ...oldData,
                            pages: newPages
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
            tempId?: string;
        }) => {
            const { conversationId, messageId, status, errorMessage, message, tempId } = data;

            // Update message status in the thread cache (map over pages)
            queryClient.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((m: any) =>
                                (m.id === messageId || (tempId && m.id === tempId))
                                    ? message
                                        ? { ...m, ...message, status, errorMessage }
                                        : { ...m, status, errorMessage }
                                    : m
                            )
                        }))
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
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((m: any) =>
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
                        }))
                    };
                }
            );
        };

        const handleConversationReadReceipt = (data: {
            conversationId: string;
            status: "DELIVERED" | "READ";
        }) => {
            const { conversationId, status } = data;
            console.log(`[Socket] Received conversation:read_receipt event for conversation: ${conversationId} with status: ${status}`);

            queryClient.setQueryData(
                conversationKeys.messages(conversationId),
                (oldData: any) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((m: any) => {
                                if (m.direction === 'OUTBOUND') {
                                    if (status === 'READ' && (m.status === 'SENT' || m.status === 'DELIVERED' || m.status === 'PENDING')) {
                                        return { ...m, status: 'READ' };
                                    }
                                    if (status === 'DELIVERED' && (m.status === 'SENT' || m.status === 'PENDING')) {
                                        return { ...m, status: 'DELIVERED' };
                                    }
                                }
                                return m;
                            })
                        }))
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

        const handleConnectError = (err: any) => {
            console.error("[Socket] Connection error:", err.message);
            if (
                err.message === "Authentication failed" ||
                err.message === "No active organization selected" ||
                err.message === "Authentication error"
            ) {
                console.warn("[Socket] Unauthenticated connection attempt, disconnecting to prevent retry loop.");
                disconnectSocket();
            }
        };

        // Hook up event listeners
        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("presence:update", handlePresenceUpdate);
        socket.on("typing:status", handleTypingStatus);
        socket.on("message:created", handleMessageCreated);
        socket.on("message:status_updated", handleMessageStatusUpdated);
        socket.on("upload:progress", handleUploadProgress);
        socket.on("conversation:assigned", handleConversationAssigned);
        socket.on("inbox:updated", handleInboxUpdated);
        socket.on("conversation:read_receipt", handleConversationReadReceipt);

        // If socket is already connected when hook mounts, trigger sync
        if (socket.connected) {
            syncOnlineList();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("presence:update", handlePresenceUpdate);
            socket.off("typing:status", handleTypingStatus);
            socket.off("message:created", handleMessageCreated);
            socket.off("message:status_updated", handleMessageStatusUpdated);
            socket.off("upload:progress", handleUploadProgress);
            socket.off("conversation:assigned", handleConversationAssigned);
            socket.off("inbox:updated", handleInboxUpdated);
            socket.off("conversation:read_receipt", handleConversationReadReceipt);
        };
    }, [queryClient, token]);
};

