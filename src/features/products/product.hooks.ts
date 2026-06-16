import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "./product.service";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

/** Query key factory — keeps keys consistent and enables targeted invalidation */
export const productKeys = {
    all:    ["products"] as const,
    list:   () => [...productKeys.all, "list"] as const,
    detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

/** Fetch the full product list */
export const useProducts = () =>
    useQuery({
        queryKey: productKeys.list(),
        queryFn: productService.getAll,
    });

/** Fetch a single product by ID */
export const useProduct = (id: string | undefined) =>
    useQuery({
        queryKey: productKeys.detail(id!),
        queryFn: () => productService.getOne(id!),
        enabled: !!id,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

/** Create a new product */
export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => productService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product created!");
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to create product");
        },
    });
};

/** Update an existing product */
export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            productService.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product updated!");
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to update product");
        },
    });
};

/** Delete a product */
export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => productService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: productKeys.all });
            toast.success("Product deleted");
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to delete product");
        },
    });
};

/** Create a product variant */
export const useCreateVariant = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, payload }: { productId: string; payload: Record<string, unknown> }) =>
            productService.createVariant(productId, payload),
        onSuccess: (_, { productId }) => {
            qc.invalidateQueries({ queryKey: productKeys.detail(productId) });
            toast.success("Variant created!");
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err?.response?.data?.message || "Failed to create variant");
        },
    });
};
