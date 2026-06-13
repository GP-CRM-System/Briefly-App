import { create } from "zustand";
import axios from "axios";
import apiClient from "@/api/client";
import { socket } from "@/lib/socket";
import { conversationKeys } from "@/features/conversations/conversation.hooks";

export interface UploadItem {
    progress: number;
    status: 'UPLOADING' | 'PROCESSING' | 'FAILED' | 'SENT';
    file: File;
    abortController?: AbortController;
    error?: string;
    caption?: string;
    conversationId: string;
}

interface UploadState {
    uploads: Record<string, UploadItem>;
    startUpload: (
        conversationId: string,
        tempId: string,
        file: File,
        caption: string | undefined,
        queryClient: any
    ) => Promise<void>;
    cancelUpload: (conversationId: string, messageId: string, queryClient: any) => Promise<void>;
    retryUpload: (conversationId: string, messageId: string, queryClient: any) => Promise<void>;
}

export const useUploadStore = create<UploadState>((set, get) => ({
    uploads: {},

    startUpload: async (conversationId, tempId, file, caption, queryClient) => {
        let fileCategory: "image" | "video" | "audio" | "document" = "document";
        if (file.type.startsWith("image/")) {
            fileCategory = "image";
        } else if (file.type.startsWith("video/")) {
            fileCategory = "video";
        } else if (file.type.startsWith("audio/")) {
            fileCategory = "audio";
        }

        const abortController = new AbortController();

        set((state) => ({
            uploads: {
                ...state.uploads,
                [tempId]: {
                    progress: 0,
                    status: 'UPLOADING',
                    file,
                    abortController,
                    caption,
                    conversationId
                }
            }
        }));

        try {
            const response = await apiClient.post(
                `/messaging/conversations/${conversationId}/messages/upload-session`,
                {
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                    type: fileCategory
                }
            );

            const { uploadUrl, message } = response.data.data;
            const messageId = message.id;

            set((state) => {
                const updated = { ...state.uploads };
                delete updated[tempId];
                updated[messageId] = {
                    progress: 0,
                    status: 'UPLOADING',
                    file,
                    abortController,
                    caption,
                    conversationId
                };
                return { uploads: updated };
            });

            const messagesQueryKey = conversationKeys.messages(conversationId);
            queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((m: any) =>
                        m.id === tempId
                            ? {
                                  ...message,
                                  metadata: {
                                      ...message.metadata,
                                      localPreviewUrl: m.metadata?.localPreviewUrl
                                  }
                              }
                            : m
                    )
                };
            });

            const rawAxios = axios.create();
            await rawAxios.put(uploadUrl, file, {
                headers: {
                    "Content-Type": file.type
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    
                    set((state) => {
                        if (!state.uploads[messageId]) return state;
                        return {
                            uploads: {
                                ...state.uploads,
                                [messageId]: {
                                    ...state.uploads[messageId],
                                    progress,
                                    status: progress === 100 ? 'PROCESSING' : 'UPLOADING'
                                }
                            }
                        };
                    });

                    socket.emit("upload:progress", { conversationId, messageId, progress });

                    queryClient.setQueryData(messagesQueryKey, (oldData: any) => {
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
                    });
                },
                signal: abortController.signal
            });

            set((state) => {
                if (!state.uploads[messageId]) return state;
                return {
                    uploads: {
                        ...state.uploads,
                        [messageId]: {
                            ...state.uploads[messageId],
                            status: 'PROCESSING'
                        }
                    }
                };
            });

            await apiClient.post(`/messaging/messages/${messageId}/complete-upload`);

            set((state) => {
                const updated = { ...state.uploads };
                delete updated[messageId];
                return { uploads: updated };
            });

            queryClient.invalidateQueries({ queryKey: messagesQueryKey });

        } catch (err: any) {
            if (axios.isCancel(err)) {
                console.log(`Upload for message was aborted:`, tempId);
                return;
            }

            console.error("Direct S3 upload failed:", err);
            const errorMsg = err?.response?.data?.message || err?.message || "Failed to upload file";

            const activeId = get().uploads[tempId] ? tempId : Object.keys(get().uploads).find(key => get().uploads[key].file === file) || tempId;

            set((state) => {
                if (!state.uploads[activeId]) return state;
                return {
                    uploads: {
                        ...state.uploads,
                        [activeId]: {
                            ...state.uploads[activeId],
                            status: 'FAILED',
                            error: errorMsg
                        }
                    }
                };
            });

            queryClient.setQueryData(conversationKeys.messages(conversationId), (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    data: oldData.data.map((m: any) =>
                        m.id === activeId ? { ...m, status: 'FAILED', errorMessage: errorMsg } : m
                    )
                };
            });
        }
    },

    cancelUpload: async (conversationId, messageId, queryClient) => {
        const item = get().uploads[messageId];
        if (item?.abortController) {
            item.abortController.abort();
        }

        set((state) => {
            const updated = { ...state.uploads };
            delete updated[messageId];
            return { uploads: updated };
        });

        queryClient.setQueryData(conversationKeys.messages(conversationId), (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                data: oldData.data.filter((m: any) => m.id !== messageId),
                total: Math.max(0, (oldData.total || 0) - 1)
            };
        });

        if (!messageId.startsWith("temp-")) {
            try {
                await apiClient.delete(`/messaging/messages/${messageId}`);
            } catch (err) {
                console.error("Failed to delete cancelled message:", err);
            }
        }
    },

    retryUpload: async (conversationId, messageId, queryClient) => {
        const item = get().uploads[messageId];
        if (!item) return;

        const { file, caption } = item;

        await get().cancelUpload(conversationId, messageId, queryClient);

        const newTempId = `temp-${Date.now()}`;
        
        queryClient.setQueryData(conversationKeys.messages(conversationId), (oldData: any) => {
            const tempMessage = {
                id: newTempId,
                conversationId: conversationId,
                content: caption || `Pending upload: ${file.name}`,
                direction: "OUTBOUND",
                type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : file.type.startsWith("audio/") ? "audio" : "document",
                status: "PENDING",
                metadata: {
                    fileName: file.name,
                    mimeType: file.type,
                    size: file.size,
                    originalName: file.name,
                    localPreviewUrl: URL.createObjectURL(file)
                },
                createdAt: new Date().toISOString()
            };

            if (!oldData) {
                return { data: [tempMessage], total: 1 };
            }
            return {
                ...oldData,
                data: [...oldData.data, tempMessage],
                total: (oldData.total || 0) + 1
            };
        });

        get().startUpload(conversationId, newTempId, file, caption, queryClient);
    }
}));
