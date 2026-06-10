import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "./notification.service";
import toast from "react-hot-toast";

export const notificationKeys = {
    all: ["notifications"] as const,
    list: () => [...notificationKeys.all, "list"] as const,
    detail: (id: string) => [...notificationKeys.all, "detail", id] as const,
    unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

/** Fetch all notifications */
export const useNotifications = () =>
    useQuery({
        queryKey: notificationKeys.list(),
        queryFn: notificationService.getAll,
    });

/** Fetch single notification */
export const useNotification = (id: string | undefined) =>
    useQuery({
        queryKey: notificationKeys.detail(id!),
        queryFn: () => notificationService.getOne(id!),
        enabled: !!id,
    });

/** Fetch unread count — polls every 30 s */
export const useUnreadCount = () =>
    useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 30_000,
    });

/** Mark a single notification as read */
export const useMarkRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
};

/** Mark all notifications as read */
export const useMarkAllRead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success("All notifications marked as read");
        },
        onError: () => {
            toast.error("Failed to mark notifications as read");
        },
    });
};

/** Delete a notification */
export const useDeleteNotification = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => notificationService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: notificationKeys.all });
            toast.success("Notification deleted");
        },
        onError: () => {
            toast.error("Failed to delete notification");
        },
    });
};
