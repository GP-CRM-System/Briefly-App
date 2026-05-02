import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "./customer.service";
import toast from "react-hot-toast";

/** Query key factory — keeps keys consistent and enables targeted invalidation */
export const customerKeys = {
    all:    ["customers"] as const,
    list:   () => [...customerKeys.all, "list"] as const,
    detail: (id: string) => [...customerKeys.all, "detail", id] as const,
};

/* ═══════════════════════════════════════════
   Queries
   ═══════════════════════════════════════════ */

/** Fetch the full customer list */
export const useCustomers = () =>
    useQuery({
        queryKey: customerKeys.list(),
        queryFn: customerService.getAll,
    });

/** Fetch a single customer by ID */
export const useCustomer = (id: string | undefined) =>
    useQuery({
        queryKey: customerKeys.detail(id!),
        queryFn: () => customerService.getOne(id!),
        enabled: !!id,
    });

/* ═══════════════════════════════════════════
   Mutations
   ═══════════════════════════════════════════ */

/** Create a new customer */
export const useCreateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => customerService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer created!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create customer");
        },
    });
};

/** Update an existing customer */
export const useUpdateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            customerService.update(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer updated!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update customer");
        },
    });
};

/** Delete a customer */
export const useDeleteCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => customerService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: customerKeys.all });
            toast.success("Customer deleted");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete customer");
        },
    });
};

/** Add a note to a customer */
export const useAddCustomerNote = (customerId: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => customerService.addNote(customerId!, content),
        onSuccess: () => {
            if (customerId) qc.invalidateQueries({ queryKey: customerKeys.detail(customerId) });
            toast.success("Note added");
        },
        onError: () => {
            toast.error("Failed to add note");
        },
    });
};
