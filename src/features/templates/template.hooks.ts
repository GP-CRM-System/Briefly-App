import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService } from "./template.service";
import toast from "react-hot-toast";

export const templateKeys = {
    all:    ["templates"] as const,
    list:   () => [...templateKeys.all, "list"] as const,
    detail: (id: string) => [...templateKeys.all, "detail", id] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

export const useTemplates = () =>
    useQuery({
        queryKey: templateKeys.list(),
        queryFn: templateService.getAll,
    });

export const useTemplate = (id: string | undefined) =>
    useQuery({
        queryKey: templateKeys.detail(id!),
        queryFn: () => templateService.getOne(id!),
        enabled: !!id,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

export const useCreateTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => templateService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: templateKeys.all });
            toast.success("Template created!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create template");
        },
    });
};

export const useUpdateTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            templateService.update(id, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: templateKeys.all });
            qc.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
            toast.success("Template updated!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update template");
        },
    });
};

export const useDeleteTemplate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => templateService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: templateKeys.all });
            toast.success("Template deleted");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete template");
        },
    });
};
