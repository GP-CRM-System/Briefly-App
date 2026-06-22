import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagService } from "./tag.service";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import toast from "react-hot-toast";

const tagKeys = {
    all:    ["tags"] as const,
    list:   () => [...tagKeys.all, "list"] as const,
};

export const useTags = () =>
    useQuery({
        queryKey: tagKeys.list(),
        queryFn: () => tagService.list(),
    });

export const useCreateTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { name: string; color: string }) => tagService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: tagKeys.all });
            toast.success("Tag created");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create tag");
        },
    });
};

export const useUpdateTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { name?: string; color?: string } }) =>
            tagService.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: tagKeys.all });
            toast.success("Tag updated");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update tag");
        },
    });
};

export const useDeleteTag = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tagService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: tagKeys.all });
            toast.success("Tag deleted");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete tag");
        },
    });
};

export const useSetCustomerTags = (customerId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tagIds: string[]) =>
            apiClient.put(ENDPOINTS.CUSTOMER.SET_TAGS(customerId), { tagIds }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["customers", "detail", customerId] });
            toast.success("Tags updated");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update tags");
        },
    });
};

export { tagKeys };
