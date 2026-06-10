import { useRef, useEffect } from "react";
import {
    useNotifications,
    useUnreadCount,
    useMarkRead,
    useMarkAllRead,
    useDeleteNotification,
} from "../notification.hooks";
import type { Notification } from "../types";

/* ── Helpers ── */
const timeAgo = (dateStr: string): string => {
    const seconds = Math.floor(
        (Date.now() - new Date(dateStr).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const typeStyles: Record<Notification["type"], { dot: string; bg: string }> = {
    info: { dot: "bg-blue-500", bg: "bg-blue-50" },
    success: { dot: "bg-emerald-500", bg: "bg-emerald-50" },
    warning: { dot: "bg-amber-500", bg: "bg-amber-50" },
    error: { dot: "bg-red-500", bg: "bg-red-50" },
};

/* ── Component ── */
interface NotificationPanelProps {
    open: boolean;
    onClose: () => void;
}

const NotificationPanel = ({ open, onClose }: NotificationPanelProps) => {
    const panelRef = useRef<HTMLDivElement>(null);

    const { data: rawNotifications = [], isLoading } = useNotifications();
    const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
    const { data: unreadCount = 0 } = useUnreadCount();
    const markRead = useMarkRead();
    const markAllRead = useMarkAllRead();
    const deleteNotification = useDeleteNotification();

    /* Close on outside click */
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                panelRef.current &&
                !panelRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, onClose]);

    /* Close on Escape */
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-[400px] max-h-[480px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
            style={{
                animation: "notifSlideIn 0.2s ease-out",
            }}
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                    </h3>
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-primary-500)] text-[11px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllRead.mutate()}
                        disabled={markAllRead.isPending}
                        className="text-xs font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-700)] transition-colors disabled:opacity-50"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* ── List ── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                            <svg
                                className="w-6 h-6 text-gray-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                                />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">
                            No notifications yet
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            You're all caught up!
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const style = typeStyles[n.type] || typeStyles.info;
                        return (
                            <div
                                key={n.id}
                                className={`group flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 cursor-pointer transition-colors ${
                                    n.isRead
                                        ? "hover:bg-gray-50"
                                        : `${style.bg} hover:bg-gray-100`
                                }`}
                                onClick={() => {
                                    if (!n.isRead) markRead.mutate(n.id);
                                }}
                            >
                                {/* Type indicator dot */}
                                <div className="pt-1.5 flex-shrink-0">
                                    <span
                                        className={`block w-2 h-2 rounded-full ${
                                            n.isRead
                                                ? "bg-gray-300"
                                                : style.dot
                                        }`}
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm leading-snug ${
                                            n.isRead
                                                ? "text-gray-500"
                                                : "text-gray-900 font-medium"
                                        }`}
                                    >
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                        {n.message}
                                    </p>
                                    <p className="text-[11px] text-gray-300 mt-1">
                                        {timeAgo(n.createdAt)}
                                    </p>
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification.mutate(n.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                                    title="Delete notification"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Footer ── */}
            {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400 text-center">
                        Showing {notifications.length} notification
                        {notifications.length !== 1 ? "s" : ""}
                    </p>
                </div>
            )}

            {/* Inline keyframes */}
            <style>{`
                @keyframes notifSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
