import { useRef, useEffect } from "react";
import type { Message } from "../types";
import { formatMessageTime, getMessageStatusBadge } from "../utils";

interface MessageThreadProps {
    messages: Message[];
    loading?: boolean;
}

const MessageThread = ({ messages, loading }: MessageThreadProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messages.map((msg) => {
                const isInbound = msg.direction === "INBOUND";
                const statusBadge = msg.status === "FAILED" ? getMessageStatusBadge(msg.status) : null;

                return (
                    <div
                        key={msg.id}
                        className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                isInbound
                                    ? "bg-gray-100 text-gray-900 rounded-tl-sm"
                                    : msg.status === "FAILED"
                                        ? "bg-red-50 text-gray-900 border border-red-200 rounded-tr-sm"
                                        : "bg-[var(--color-primary-500)] text-white rounded-tr-sm"
                            }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                            <div className={`flex items-center gap-1.5 mt-1 ${isInbound ? "justify-start" : "justify-end"}`}>
                                <span className={`text-[10px] ${isInbound ? "text-gray-400" : "text-white/70"}`}>
                                    {formatMessageTime(msg.createdAt)}
                                </span>
                                {statusBadge && (
                                    <span className={`text-[10px] font-semibold ${statusBadge.classes}`}>
                                        {statusBadge.label}
                                    </span>
                                )}
                                {!isInbound && msg.status !== "FAILED" && (
                                    <svg className={`h-3 w-3 ${msg.status === "READ" ? "text-emerald-300" : "text-white/50"}`} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageThread;
