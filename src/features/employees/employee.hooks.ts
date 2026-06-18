import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "./employee.service";
import toast from "react-hot-toast";

export const employeeKeys = {
    all: ["employees"] as const,
    list: () => [...employeeKeys.all, "list"] as const,
};

export const useEmployees = () =>
    useQuery({
        queryKey: employeeKeys.list(),
        queryFn: employeeService.getAll,
    });

export const useOrgRoles = () =>
    useQuery({
        queryKey: [...employeeKeys.all, "org-roles"],
        queryFn: employeeService.listOrgRoles,
        staleTime: 5 * 60 * 1000, // roles change infrequently
    });

export const useInviteEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { email: string; role: string }) => employeeService.invite(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: employeeKeys.all });
            toast.success("Invitation sent successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to send invitation");
        },
    });
};

export const useUpdateEmployeeRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) => employeeService.updateRole(id, role),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: employeeKeys.all });
            toast.success("Employee role updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update role");
        },
    });
};

export const useRemoveEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => employeeService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: employeeKeys.all });
            toast.success("Employee removed from organization successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to remove employee");
        },
    });
};
