import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { segmentService } from "./segment.service";
import toast from "react-hot-toast";

export const segmentKeys = {
    all:    ["segments"] as const,
    list:   () => [...segmentKeys.all, "list"] as const,
    detail: (id: string) => [...segmentKeys.all, "detail", id] as const,
    customers: (id: string) => [...segmentKeys.all, "customers", id] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

export const useSegments = () =>
    useQuery({
        queryKey: segmentKeys.list(),
        queryFn: segmentService.getAll,
    });

export const useSegment = (id: string | undefined) =>
    useQuery({
        queryKey: segmentKeys.detail(id!),
        queryFn: () => segmentService.getOne(id!),
        enabled: !!id,
    });

export const useSegmentCustomers = (id: string | undefined) =>
    useQuery({
        queryKey: segmentKeys.customers(id!),
        queryFn: () => segmentService.getCustomers(id!),
        enabled: !!id,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

export const useCreateSegment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => segmentService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: segmentKeys.all });
            toast.success("Segment created!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create segment");
        },
    });
};

export const useUpdateSegment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            segmentService.update(id, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: segmentKeys.all });
            qc.invalidateQueries({ queryKey: segmentKeys.detail(variables.id) });
            toast.success("Segment updated!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update segment");
        },
    });
};

export const useDeleteSegment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => segmentService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: segmentKeys.all });
            toast.success("Segment deleted");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete segment");
        },
    });
};
