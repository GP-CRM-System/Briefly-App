import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "./order.service";
import toast from "react-hot-toast";

export const orderKeys = {
    all: ["orders"] as const,
    list: () => [...orderKeys.all, "list"] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export const useOrders = () =>
    useQuery({
        queryKey: orderKeys.list(),
        queryFn: orderService.getAll,
    });

export const useOrder = (id: string | undefined) =>
    useQuery({
        queryKey: orderKeys.detail(id!),
        queryFn: () => orderService.getOne(id!),
        enabled: !!id,
    });

export const useCreateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => orderService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
            toast.success("Order created successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create order");
        },
    });
};

export const useUpdateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            orderService.update(id, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
            qc.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
            toast.success("Order updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update order");
        },
    });
};

export const useDeleteOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => orderService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
            toast.success("Order deleted successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete order");
        },
    });
};

export const useAddOrderNote = (orderId: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => orderService.addNote(orderId!, content),
        onSuccess: () => {
            if (orderId) qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
            toast.success("Note added successfully!");
        },
        onError: () => {
            toast.error("Failed to add note");
        },
    });
};
