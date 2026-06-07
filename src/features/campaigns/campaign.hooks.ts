import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "./campaign.service";
import toast from "react-hot-toast";

export const campaignKeys = {
    all:        ["campaigns"] as const,
    list:       () => [...campaignKeys.all, "list"] as const,
    detail:     (id: string) => [...campaignKeys.all, "detail", id] as const,
    stats:      (id: string) => [...campaignKeys.all, "stats", id] as const,
    templates:  () => [...campaignKeys.all, "templates"] as const,
    segments:   () => [...campaignKeys.all, "segments"] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

export const useCampaigns = () =>
    useQuery({
        queryKey: campaignKeys.list(),
        queryFn: campaignService.getAll,
    });

export const useCampaign = (id: string | undefined) =>
    useQuery({
        queryKey: campaignKeys.detail(id!),
        queryFn: () => campaignService.getOne(id!),
        enabled: !!id,
    });

export const useCampaignStats = (id: string | undefined) =>
    useQuery({
        queryKey: campaignKeys.stats(id!),
        queryFn: () => campaignService.getStats(id!),
        enabled: !!id,
    });

export const useTemplates = () =>
    useQuery({
        queryKey: campaignKeys.templates(),
        queryFn: campaignService.getTemplates,
    });

export const useSegmentsForDropdown = () =>
    useQuery({
        queryKey: campaignKeys.segments(),
        queryFn: campaignService.getSegments,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

export const useCreateCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => campaignService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            toast.success("Campaign created!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create campaign");
        },
    });
};

export const useUpdateCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            campaignService.update(id, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            qc.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
            toast.success("Campaign updated!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update campaign");
        },
    });
};

export const useDeleteCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            toast.success("Campaign deleted");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete campaign");
        },
    });
};

export const useSendCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => campaignService.sendCampaign(id),
        onSuccess: (_, id) => {
            qc.invalidateQueries({ queryKey: campaignKeys.all });
            qc.invalidateQueries({ queryKey: campaignKeys.detail(id) });
            qc.invalidateQueries({ queryKey: campaignKeys.stats(id) });
            toast.success("Campaign dispatch started!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to send campaign");
        },
    });
};
