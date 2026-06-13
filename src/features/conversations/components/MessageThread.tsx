import { useRef, useEffect, useMemo } from "react";
import type { Message } from "../types";
import { formatMessageTime } from "../utils";
import { useUploadStore } from "@/store/upload.store";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface MessageThreadProps {
    messages: Message[];
    loading?: boolean;
    onRetry?: (message: Message) => void;
}

const formatBytes = (bytes: number | undefined, decimals = 1) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const getFriendlyDateHeader = (dateStr: string) => {
    const today = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return dateStr;
};

const MessageThread = ({ messages, loading, onRetry }: MessageThreadProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const { id: conversationId } = useParams<{ id: string }>();
    const uploadStore = useUploadStore((state) => state.uploads);
    const cancelUpload = useUploadStore((state) => state.cancelUpload);
    const retryUpload = useUploadStore((state) => state.retryUpload);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    // Group messages by date
    const groupedMessages = useMemo(() => {
        const groups: { [dateStr: string]: Message[] } = {};
        messages.forEach((msg) => {
            const date = new Date(msg.createdAt);
            const dateStr = date.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(msg);
        });
        return groups;
    }, [messages]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!messages.length) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400">No messages yet. Send a message to start the conversation.</p>
            </div>
        );
    }

        const renderMessageContent = (msg: Message) => {
        const metadata = msg.metadata as any;
        const mimeType = metadata?.mimeType || "";

        const uploadItem = uploadStore[msg.id];
        const progress = uploadItem ? uploadItem.progress : (metadata?.uploadProgress || 0);
        const status = uploadItem ? uploadItem.status : msg.status;
        const isUploading = status === "UPLOADING" || status === "PROCESSING" || msg.status === "PENDING";
        const previewUrl = metadata?.localPreviewUrl || msg.content;

        if (msg.type === "image") {
            return (
                <div className="relative max-w-xs mt-1 rounded-xl overflow-hidden shadow-xs border border-gray-200 bg-black/5">
                    <img
                        src={previewUrl}
                        alt="Attachment"
                        className={`max-w-full max-h-60 object-cover hover:opacity-95 transition-opacity cursor-pointer ${isUploading ? "opacity-60 blur-xs" : ""}`}
                        onClick={() => !isUploading && window.open(msg.content, "_blank")}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2 p-2">
                            <span className="text-[10px] font-bold tracking-wide uppercase">{status === 'PROCESSING' ? 'Processing...' : `Uploading ${progress}%`}</span>
                            <div className="w-24 bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <button
                                onClick={() => cancelUpload(conversationId!, msg.id, queryClient)}
                                className="text-[9px] bg-red-600/90 text-white hover:bg-red-750 px-2 py-0.5 rounded-md font-bold cursor-pointer transition-all shadow-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (msg.type === "audio") {
            return (
                <div className="flex flex-col gap-2 p-3 bg-white/10 rounded-xl w-64 mt-1 border border-white/5 shadow-xs relative">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{metadata?.originalName || "Voice Record"}</div>
                            <div className="text-[10px] text-white/60 mt-0.5">{formatBytes(metadata?.size)}</div>
                        </div>
                    </div>
                    <audio src={previewUrl} controls className="w-full mt-1 accent-blue-500" style={{ height: '32px' }} />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-between px-4 rounded-xl">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{status === 'PROCESSING' ? 'Processing...' : `Uploading ${progress}%`}</span>
                            <button
                                onClick={() => cancelUpload(conversationId!, msg.id, queryClient)}
                                className="text-[9px] bg-red-600/90 text-white hover:bg-red-750 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (msg.type === "video") {
            return (
                <div className="relative max-w-xs mt-1 rounded-xl overflow-hidden shadow-xs border border-gray-200 bg-black/5">
                    <video
                        src={previewUrl}
                        controls={!isUploading}
                        className={`max-w-full max-h-60 ${isUploading ? "opacity-60 blur-xs" : ""}`}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2 p-2">
                            <span className="text-[10px] font-bold tracking-wide uppercase">{status === 'PROCESSING' ? 'Processing...' : `Uploading ${progress}%`}</span>
                            <div className="w-24 bg-white/20 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <button
                                onClick={() => cancelUpload(conversationId!, msg.id, queryClient)}
                                className="text-[9px] bg-red-600/90 text-white hover:bg-red-755 px-2 py-0.5 rounded-md font-bold cursor-pointer transition-all shadow-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (msg.type === "document") {
            if (mimeType.startsWith("audio/")) {
                return (
                    <audio
                        src={previewUrl}
                        controls
                        className="max-w-xs mt-1 bg-transparent rounded-lg"
                    />
                );
            }
            if (mimeType.startsWith("video/")) {
                return (
                    <video
                        src={previewUrl}
                        controls
                        className="max-w-xs rounded-xl shadow-xs border border-gray-200 mt-1 max-h-60"
                    />
                );
            }
            const extension = metadata?.originalName?.split(".").pop() || "doc";
            return (
                <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl max-w-xs mt-1 border border-white/10 relative">
                    <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center flex-shrink-0 font-bold text-[10px] uppercase tracking-wider">
                        {extension}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">{metadata?.originalName || "Attachment"}</div>
                        <div className="text-[10px] text-white/60 mt-0.5">{formatBytes(metadata?.size)}</div>
                    </div>
                    {!isUploading ? (
                        <a
                            href={msg.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors flex-shrink-0 cursor-pointer"
                            title="Download file"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </a>
                    ) : (
                        <button
                            onClick={() => cancelUpload(conversationId!, msg.id, queryClient)}
                            className="text-[9px] bg-red-600/90 text-white hover:bg-red-750 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                    {isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden rounded-b-xl">
                            <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </div>
            );
        }

        // Default or WhatsApp template text content
        return <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>;
    };

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {Object.entries(groupedMessages).map(([dateStr, dayMessages]) => (
                <div key={dateStr} className="space-y-3">
                    {/* Date Divider */}
                    <div className="flex justify-center my-4">
                        <span className="bg-white/80 backdrop-blur-xs text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs border border-gray-100 uppercase tracking-wider">
                            {getFriendlyDateHeader(dateStr)}
                        </span>
                    </div>

                    {dayMessages.map((msg) => {
                        const isInbound = msg.direction === "INBOUND";
                        const isFailed = msg.status === "FAILED";
                        const isPending = msg.status === "PENDING";

                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                            >
                                <div className="flex flex-col max-w-[70%] group">
                                    <div
                                        className={`rounded-2xl px-4 py-2.5 shadow-xs ${
                                            isInbound
                                                ? "bg-white text-gray-900 rounded-tl-xs border border-gray-100"
                                                : isFailed
                                                  ? "bg-red-50 text-red-900 border border-red-200 rounded-tr-xs"
                                                  : "bg-[var(--color-primary-500)] text-white rounded-tr-xs"
                                        }`}
                                    >
                                        {renderMessageContent(msg)}

                                        <div className={`flex items-center gap-1.5 mt-1.5 ${isInbound ? "justify-start" : "justify-end"}`}>
                                            <span className={`text-[9px] ${isInbound ? "text-gray-400" : "text-white/60"}`}>
                                                {formatMessageTime(msg.createdAt)}
                                            </span>

                                            {/* Status ticks / alerts */}
                                            {!isInbound && (
                                                <span className="flex items-center">
                                                    {isPending && (
                                                        <svg className="h-3 w-3 animate-spin text-white/50" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    )}
                                                    {msg.status === "SENT" && (
                                                        <svg className="h-3.5 w-3.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 6L9 17l-5-5" />
                                                        </svg>
                                                    )}
                                                    {msg.status === "DELIVERED" && (
                                                        <svg className="h-3.5 w-4.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17 6L8.5 14.5L5 11" />
                                                            <path d="M22 6l-8.5 8.5L12 13" />
                                                        </svg>
                                                    )}
                                                    {msg.status === "READ" && (
                                                        <svg className="h-3.5 w-4.5 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17 6L8.5 14.5L5 11" />
                                                            <path d="M22 6l-8.5 8.5L12 13" />
                                                        </svg>
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action row for failed messages */}
                                    {isFailed && (
                                        <div className="flex items-center gap-2 mt-1 self-end animate-fade-in">
                                            <span className="text-[10px] text-red-500 font-medium">{msg.errorMessage || "Delivery failed"}</span>
                                            {uploadStore[msg.id] ? (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => retryUpload(conversationId!, msg.id, queryClient)}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
                                                    >
                                                        Retry
                                                    </button>
                                                    <button
                                                        onClick={() => cancelUpload(conversationId!, msg.id, queryClient)}
                                                        className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                onRetry && (
                                                    <button
                                                        onClick={() => onRetry(msg)}
                                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-2 py-0.5 rounded-lg shadow-xs cursor-pointer hover:bg-gray-50 transition-all"
                                                    >
                                                        Retry
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default MessageThread;
