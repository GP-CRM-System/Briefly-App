import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "./ticket.service";
import toast from "react-hot-toast";

export const ticketKeys = {
    all: ["tickets"] as const,
    list: () => [...ticketKeys.all, "list"] as const,
    detail: (id: string) => [...ticketKeys.all, "detail", id] as const,
};

export const useTickets = () =>
    useQuery({
        queryKey: ticketKeys.list(),
        queryFn: ticketService.getAll,
    });

export const useTicket = (id: string | undefined) =>
    useQuery({
        queryKey: ticketKeys.detail(id!),
        queryFn: () => ticketService.getOne(id!),
        enabled: !!id,
    });

export const useCreateTicket = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => ticketService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ticketKeys.all });
            toast.success("Ticket created successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create ticket");
        },
    });
};

export const useUpdateTicket = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
            ticketService.update(id, payload),
        onSuccess: (_, variables) => {
            qc.invalidateQueries({ queryKey: ticketKeys.all });
            qc.invalidateQueries({ queryKey: ticketKeys.detail(variables.id) });
            toast.success("Ticket updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update ticket");
        },
    });
};

export const useAddTicketNote = (ticketId: string | undefined) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (content: string) => ticketService.addNote(ticketId!, content),
        onSuccess: () => {
            if (ticketId) qc.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) });
            toast.success("Note added successfully!");
        },
        onError: () => {
            toast.error("Failed to add note");
        },
    });
};

export const useDeleteTicket = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ticketService.delete(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ticketKeys.all });
            toast.success("Ticket deleted successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete ticket");
        },
    });
};

