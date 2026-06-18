import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "./ai.service";
import toast from "react-hot-toast";

export const aiKeys = {
    all: ["ai"] as const,
    churn: () => [...aiKeys.all, "churn"] as const,
    segments: () => [...aiKeys.all, "segments"] as const,
    recommendations: () => [...aiKeys.all, "recommendations"] as const,
    health: () => [...aiKeys.all, "health"] as const,
    products: () => [...aiKeys.all, "products"] as const,
    customers: () => [...aiKeys.all, "customers"] as const,
    customerDetail: (id: string) => [...aiKeys.all, "customer", id] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

/** Get AI health status */
export const useAiHealth = () =>
    useQuery({
        queryKey: aiKeys.health(),
        queryFn: aiService.getHealth,
        refetchInterval: 60_000,
    });

/** Get churn prediction results with optional risk level filter */
export const useChurnResults = (riskLevel?: string) =>
    useQuery({
        queryKey: [...aiKeys.churn(), riskLevel] as const,
        queryFn: () => aiService.getChurnResults(riskLevel),
    });

/** Get segmentation results (re-computes on read) */
export const useSegmentResults = () =>
    useQuery({
        queryKey: aiKeys.segments(),
        queryFn: aiService.getSegmentResults,
    });

/** Get recommendations for a specific product */
export const useProductRecommendations = (productId: string) =>
    useQuery({
        queryKey: [...aiKeys.recommendations(), productId] as const,
        queryFn: () => aiService.getProductRecommendations(productId),
        enabled: !!productId,
    });

/** Get all products for catalog view */
export const useAiProducts = () =>
    useQuery({
        queryKey: aiKeys.products(),
        queryFn: aiService.getAllProducts,
    });

/** Get all customers for the dropdown */
export const useAiCustomers = () =>
    useQuery({
        queryKey: aiKeys.customers(),
        queryFn: aiService.getAllCustomers,
    });

/** Get a single customer detail */
export const useAiCustomer = (id: string | undefined) =>
    useQuery({
        queryKey: aiKeys.customerDetail(id!),
        queryFn: () => aiService.getCustomerDetail(id!),
        enabled: !!id,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

/** Compute churn predictions */
export const useComputeChurn = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: aiService.computeChurn,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: aiKeys.churn() });
            toast.success(`Churn computed for ${data.totalCustomers} customers`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to compute churn");
        },
    });
};

/** Compute customer segments */
export const useComputeSegments = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: aiService.computeSegments,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: aiKeys.segments() });
            toast.success(`Segments computed for ${data.totalCustomers} customers`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to compute segments");
        },
    });
};

/** Compute product recommendations */
export const useComputeRecommendations = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: aiService.computeRecommendations,
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: aiKeys.recommendations() });
            toast.success(`Recommendations for ${data.totalItems} products`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to compute recommendations");
        },
    });
};
