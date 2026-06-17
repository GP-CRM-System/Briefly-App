import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "./settings.service";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export const settingsKeys = {
    all: ["settings"] as const,
    roles: () => [...settingsKeys.all, "roles"] as const,
    connections: () => [...settingsKeys.all, "connections"] as const,
    syncLogs: (id: string) => [...settingsKeys.all, "syncLogs", id] as const,
    jobs: () => [...settingsKeys.all, "jobs"] as const,
    invoices: () => [...settingsKeys.all, "invoices"] as const,
    organization: () => [...settingsKeys.all, "organization"] as const,
    accounts: () => [...settingsKeys.all, "accounts"] as const,
    plans: () => [...settingsKeys.all, "plans"] as const,
    subscription: () => [...settingsKeys.all, "subscription"] as const,
};

// ──────────────────────────────────────────────
// Image Upload
// ──────────────────────────────────────────────

export const useUploadImage = () => {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type: "avatar" | "logo" }) =>
            settingsService.uploadImage(file, type),
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to upload image");
        },
    });
};

// ──────────────────────────────────────────────
// Profile Mutations
// ──────────────────────────────────────────────

export const useUpdateProfile = () => {
    const user = useAuthStore((s) => s.user);

    return useMutation({
        mutationFn: (payload: { name?: string; email?: string; image?: string | null }) =>
            settingsService.updateUser(payload),
        onSuccess: (_data, variables) => {
            // Optimistically update the auth store with the new profile data
            if (user) {
                useAuthStore.setState({
                    user: {
                        ...user,
                        name: variables.name ?? user.name,
                        email: variables.email ?? user.email,
                        image: variables.image !== undefined ? variables.image : user.image,
                    }
                });
            }
            toast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update profile");
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
            settingsService.changePassword(payload),
        onSuccess: () => {
            toast.success("Password changed successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to change password");
        },
    });
};

export const useChangeEmail = () => {
    return useMutation({
        mutationFn: (payload: { newEmail: string }) =>
            settingsService.changeEmail(payload),
        onSuccess: () => {
            toast.success("Verification email sent to your new address!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to request email change");
        },
    });
};

export const useDeleteUser = () => {
    const clearSession = useAuthStore((s) => s.clearSession);
    return useMutation({
        mutationFn: () => settingsService.deleteUser(),
        onSuccess: () => {
            toast.success("Account deleted successfully");
            clearSession();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete account");
        },
    });
};

// ──────────────────────────────────────────────
// Social Account Linking
// ──────────────────────────────────────────────

export const useLinkedAccounts = () => {
    return useQuery({
        queryKey: settingsKeys.accounts(),
        queryFn: settingsService.listAccounts,
    });
};

export const useLinkSocial = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (provider: string) => settingsService.linkSocial(provider),
        onSuccess: (data: any) => {
            qc.invalidateQueries({ queryKey: settingsKeys.accounts() });
            // If the backend returns a redirect URL for OAuth, redirect the browser
            if (data?.url) {
                window.location.href = data.url;
            } else {
                toast.success("Account linked successfully!");
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to link account");
        },
    });
};

export const useUnlinkAccount = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (providerId: string) => settingsService.unlinkAccount(providerId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.accounts() });
            toast.success("Account unlinked successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to unlink account");
        },
    });
};

// ──────────────────────────────────────────────
// Organization
// ──────────────────────────────────────────────

export const useOrganization = () => {
    return useQuery({
        queryKey: settingsKeys.organization(),
        queryFn: settingsService.getOrganization,
    });
};

export const useUpdateOrg = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { name: string; slug: string; logo?: string | null }) =>
            settingsService.updateOrganization(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.organization() });
            toast.success("Organization profile updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update organization");
        },
    });
};

export const useDeleteOrg = () => {
    const clearSession = useAuthStore((s) => s.clearSession);
    return useMutation({
        mutationFn: () => settingsService.deleteOrganization(),
        onSuccess: () => {
            toast.success("Organization deleted successfully");
            clearSession();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete organization");
        },
    });
};

// ──────────────────────────────────────────────
// Roles & Permissions
// ──────────────────────────────────────────────

export const useSettingsRoles = () => {
    return useQuery({
        queryKey: settingsKeys.roles(),
        queryFn: settingsService.listRoles,
    });
};

export const useCreateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { name: string; description: string; permissions: Record<string, any> }) =>
            settingsService.createRole(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roles() });
            toast.success("Role created successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to create role");
        },
    });
};

export const useUpdateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string; name?: string; description?: string; permissions?: Record<string, any> }) =>
            settingsService.updateRole(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roles() });
            toast.success("Role updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update role");
        },
    });
};

export const useDeleteRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => settingsService.deleteRole(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.roles() });
            toast.success("Role deleted successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to delete role");
        },
    });
};

// ──────────────────────────────────────────────
// Connections (Shopify Integration)
// ──────────────────────────────────────────────

export const useConnections = () => {
    return useQuery({
        queryKey: settingsKeys.connections(),
        queryFn: settingsService.getConnections,
    });
};

export const useConnectMeta = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { channel: string; accessToken: string; name?: string; metadata: Record<string, string> }) =>
            settingsService.connectMeta(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.connections() });
            toast.success("Meta channel connected successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to connect Meta channel");
        },
    });
};

export const useConnectShopify = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { shopDomain: string; accessToken: string; name?: string }) =>
            settingsService.connectShopify(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.connections() });
            toast.success("Shopify store connected successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to connect Shopify store");
        },
    });
};

export const useTestConnection = () => {
    return useMutation({
        mutationFn: (id: string) => settingsService.testConnection(id),
        onSuccess: (data: any) => {
            toast.success(data?.message || "Connection tested successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to test connection");
        },
    });
};

export const useSyncConnection = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => settingsService.syncConnection(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.connections() });
            toast.success("Synchronization triggered successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to sync connection");
        },
    });
};

export const useUpdateIntegration = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
            settingsService.updateIntegration(id, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.connections() });
            toast.success("Integration updated successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update integration");
        },
    });
};

export const useDeleteIntegration = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => settingsService.deleteIntegration(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.connections() });
            toast.success("Integration disconnected successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to disconnect integration");
        },
    });
};

export const useSyncLogs = (id: string, enabled = false) => {
    return useQuery({
        queryKey: settingsKeys.syncLogs(id),
        queryFn: () => settingsService.getSyncLogs(id),
        enabled: enabled && !!id,
    });
};

// ──────────────────────────────────────────────
// Imports & Exports
// ──────────────────────────────────────────────

export const useImportExportJobs = () => {
    return useQuery({
        queryKey: settingsKeys.jobs(),
        queryFn: settingsService.getImportExportJobs,
    });
};

export const useCreateImport = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ file, entityType }: { file: File; entityType: string }) =>
            settingsService.createImport(file, entityType),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.jobs() });
            toast.success("Import started successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to start import");
        },
    });
};

export const useCreateExport = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ entityType, format }: { entityType: string; format?: string }) =>
            settingsService.createExport(entityType, format),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.jobs() });
            toast.success("Export started successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to start export");
        },
    });
};

export const useDownloadExport = () => {
    return useMutation({
        mutationFn: (id: string) => settingsService.downloadExport(id),
        onSuccess: (blob, id) => {
            // Trigger browser download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `export-${id}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success("Export downloaded!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to download export");
        },
    });
};

// ──────────────────────────────────────────────
// Subscription & Billing
// ──────────────────────────────────────────────

export const usePlans = () => {
    return useQuery({
        queryKey: settingsKeys.plans(),
        queryFn: settingsService.getPlans,
    });
};

export const useCurrentSubscription = () => {
    return useQuery({
        queryKey: settingsKeys.subscription(),
        queryFn: settingsService.getCurrentSubscription,
    });
};

export const useInitializeSubscription = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ planId, billingCycle }: { planId: string; billingCycle?: string }) =>
            settingsService.initializeSubscription(planId, billingCycle),
        onSuccess: (data: any) => {
            qc.invalidateQueries({ queryKey: settingsKeys.subscription() });
            // If Paymob returns a payment URL, redirect to it
            const paymentUrl = data?.paymob?.paymentUrl || data?.paymentUrl || data?.redirectUrl;
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                toast.success("Subscription activated!");
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to initialize subscription");
        },
    });
};

export const useCancelSubscription = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (immediately: boolean) => settingsService.cancelSubscription(immediately),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: settingsKeys.subscription() });
            toast.success("Subscription cancelled");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to cancel subscription");
        },
    });
};

export const useBillingInvoices = () => {
    return useQuery({
        queryKey: settingsKeys.invoices(),
        queryFn: settingsService.getBillingInvoices,
    });
};
