import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type {
    Role,
    ConnectionDetails,
    ImportExportJob,
    BillingInvoice,
    SyncLog,
    BackendRole,
    BackendIntegration,
    BackendSyncLog,
    BackendImportExportJob,
    ResourcePermissions,
} from "./types";

export const settingsService = {
    // ─── File Upload (Avatar / Logo) ───
    async uploadImage(file: File, type: "avatar" | "logo" = "avatar"): Promise<{ url: string; publicId: string }> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const { data } = await apiClient.post(ENDPOINTS.UPLOAD, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data?.data || data;
    },

    // ─── My Profile ───
    async updateUser(payload: { name?: string; email?: string; image?: string | null }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.UPDATE_USER, payload);
        return data;
    },

    async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload);
        return data;
    },

    async deleteUser(): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.DELETE_USER);
        return data;
    },

    async changeEmail(payload: { newEmail: string }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.CHANGE_EMAIL, {
            newEmail: payload.newEmail,
            callbackURL: `${window.location.origin}/verify-email`,
        });
        return data;
    },

    // ─── Social Account Linking ───
    async linkSocial(provider: string): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.LINK_SOCIAL, {
            provider,
            callbackURL: window.location.href,
        });
        return data;
    },

    async unlinkAccount(providerId: string): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.AUTH.UNLINK_ACCOUNT, { providerId });
        return data;
    },

    async listAccounts(): Promise<unknown[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.AUTH.LIST_ACCOUNTS);
            return data?.data || data || [];
        } catch {
            return [];
        }
    },

    // ─── Organization Profile ───
    async getOrganization(): Promise<unknown> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.ORGANIZATION.GET_FULL);
            return data?.data || data;
        } catch {
            return null;
        }
    },

    async updateOrganization(payload: { name: string; slug: string; logo?: string | null }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.ORGANIZATION.UPDATE, { data: payload });
        return data;
    },

    async deleteOrganization(): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.ORGANIZATION.DELETE);
        return data;
    },

    // ─── Roles & Permissions ───
    async listRoles(): Promise<Role[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.ROLE.GET_ALL, {
                params: { limit: 1000 }
            });
            const rolesData = data?.data || data;
            const rolesList = Array.isArray(rolesData)
                ? rolesData
                : (rolesData?.all || rolesData?.custom || rolesData?.default || []);
            
            if (rolesList && rolesList.length > 0) {
                // Map backend array-based permissions { resource: ["read","write"] }
                // to frontend boolean-based { resource: { read: true, write: true, delete: false } }
                return rolesList.map((r: BackendRole) => ({
                    id: r.id,
                    name: r.name || r.role,
                    description: r.description || "",
                    userCount: r.userCount ?? r._count?.members ?? 0,
                    permissions: settingsService._mapPermissionsFromBackend(r.permission || r.permissions || {}),
                }));
            }
        } catch (err) {
            console.warn("API list-roles failed, using mock data", err);
        }

        // Return Mock Roles if API fails/not implemented
        return [
            {
                id: "role-admin",
                name: "Admin",
                description: "Full Access to all resources",
                userCount: 3,
                permissions: {
                    customers: { read: true, write: true, delete: true },
                    segments: { read: true, write: true, delete: true },
                    campaigns: { read: true, write: true, delete: true },
                    products: { read: true, write: true, delete: true },
                    tickets: { read: true, write: true, delete: true },
                    employees: { read: true, write: true, delete: true },
                }
            },
            {
                id: "role-manager",
                name: "Manager",
                description: "Manage campaigns, customer records, and review metrics",
                userCount: 5,
                permissions: {
                    customers: { read: true, write: true, delete: false },
                    segments: { read: true, write: true, delete: false },
                    campaigns: { read: true, write: true, delete: true },
                    products: { read: true, write: true, delete: false },
                    tickets: { read: true, write: true, delete: true },
                    employees: { read: true, write: false, delete: false },
                }
            },
            {
                id: "role-agent",
                name: "Support Agent",
                description: "Read-only access to customer data and write access to tickets",
                userCount: 12,
                permissions: {
                    customers: { read: true, write: false, delete: false },
                    segments: { read: true, write: false, delete: false },
                    campaigns: { read: false, write: false, delete: false },
                    products: { read: true, write: false, delete: false },
                    tickets: { read: true, write: true, delete: false },
                    employees: { read: false, write: false, delete: false },
                }
            }
        ];
    },

    async createRole(payload: { name: string; description: string; permissions: Record<string, ResourcePermissions> }): Promise<Role> {
        // Convert frontend boolean permissions to backend array format
        const backendPermissions = settingsService._mapPermissionsToBackend(payload.permissions);
        const { data } = await apiClient.post(ENDPOINTS.ROLE.CREATE, {
            name: payload.name.toLowerCase().replace(/\s+/g, "-"),
            description: payload.description,
            permissions: backendPermissions,
        });
        const role = data?.data || data;
        return {
            id: role.id || `role-${Date.now()}`,
            name: payload.name,
            description: payload.description,
            userCount: 0,
            permissions: payload.permissions,
        };
    },

    async updateRole(id: string, payload: { name?: string; description?: string; permissions?: Record<string, ResourcePermissions> }): Promise<unknown> {
        const body: Record<string, unknown> = {};
        if (payload.name) body.name = payload.name.toLowerCase().replace(/\s+/g, "-");
        if (payload.description) body.description = payload.description;
        if (payload.permissions) body.permissions = settingsService._mapPermissionsToBackend(payload.permissions);
        const { data } = await apiClient.patch(ENDPOINTS.ROLE.UPDATE(id), body);
        return data?.data || data;
    },

    async deleteRole(id: string): Promise<unknown> {
        const { data } = await apiClient.delete(ENDPOINTS.ROLE.DELETE(id));
        return data?.data || data || { success: true };
    },

    _mapPermissionsToBackend(frontendPerms: Record<string, { read?: boolean; write?: boolean; delete?: boolean }>): Record<string, string[]> {
        const result: Record<string, string[]> = {};
        for (const [resource, actions] of Object.entries(frontendPerms)) {
            const arr: string[] = [];
            if (actions.read) arr.push("read");
            
            let mappedKey = resource;
            if (resource === "tickets") {
                mappedKey = "supportTickets";
            } else if (resource === "employees") {
                mappedKey = "member";
            }

            if (mappedKey === "member") {
                if (actions.write) {
                    arr.push("create");
                    arr.push("update");
                }
            } else if (mappedKey === "organization") {
                if (actions.write) {
                    arr.push("update");
                }
            } else if (mappedKey === "invitation") {
                if (actions.write) {
                    arr.push("create");
                }
                if (actions.delete) {
                    arr.push("cancel");
                }
            } else {
                if (actions.write) arr.push("write");
            }
            
            if (actions.delete && mappedKey !== "invitation") {
                arr.push("delete");
            }

            if (arr.length > 0) result[mappedKey] = arr;
        }
        return result;
    },

    _mapPermissionsFromBackend(backendPerms: Record<string, string[]>): Record<string, { read: boolean; write: boolean; delete: boolean }> {
        const result: Record<string, { read: boolean; write: boolean; delete: boolean }> = {};
        for (const [resource, actions] of Object.entries(backendPerms)) {
            if (!Array.isArray(actions)) continue;
            let mappedKey = resource;
            if (resource === "supportTickets") {
                mappedKey = "tickets";
            } else if (resource === "member") {
                mappedKey = "employees";
            }

            const writeAction = resource === "member" 
                ? (actions.includes("create") || actions.includes("update"))
                : resource === "organization"
                ? actions.includes("update")
                : resource === "invitation"
                ? actions.includes("create")
                : actions.includes("write");

            const deleteAction = resource === "invitation"
                ? actions.includes("cancel")
                : actions.includes("delete");

            result[mappedKey] = {
                read: actions.includes("read"),
                write: writeAction,
                delete: deleteAction,
            };
        }
        return result;
    },

    // ─── Connections (Integrations) ───
    async getConnections(): Promise<ConnectionDetails[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.INTEGRATION.GET_ALL, {
                params: { limit: 1000 }
            });
            const integrations = data?.data || data;
            if (Array.isArray(integrations) && integrations.length > 0) {
                return integrations.map((i: BackendIntegration) => ({
                    id: i.id,
                    provider: i.provider,
                    name: i.name || i.provider || "Connection",
                    status: i.isActive ? "active" as const : "inactive" as const,
                    url: i.shopDomain || "",
                    connectedAt: i.createdAt ? new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown",
                    connectedBy: "Current User",
                    autoSync: i.syncMode === "webhook",
                    syncFrequency: i.syncMode === "webhook" ? "Real-time (Instant)" : "Manual",
                    syncDirection: "Import only",
                    conflictHandling: "Shopify wins",
                    lastSyncAt: i.lastSyncedAt ? new Date(i.lastSyncedAt).toLocaleString() : "Never",
                    lastSyncStatus: i.syncStatus === "completed" ? "success" as const : "success" as const,
                    metadata: i.metadata || {},
                }));
            }
        } catch (err) {
            console.warn("API get-connections failed, using mock connection details", err);
        }

        return [];
    },

    async connectMeta(payload: { channel: string; accessToken: string; name?: string; metadata: Record<string, string> }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.INTEGRATION.CONNECT_META, payload);
        return data?.data || data;
    },

    async connectShopify(payload: { shopDomain: string; accessToken: string; name?: string }): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.INTEGRATION.CONNECT_SHOPIFY, payload);
        return data?.data || data;
    },

    async testConnection(id: string): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.INTEGRATION.TEST_CONNECTION(id));
        return data?.data || data;
    },

    async syncConnection(id: string): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.INTEGRATION.FULL_SYNC(id), {});
        return data?.data || data;
    },

    async updateIntegration(id: string, payload: Record<string, unknown>): Promise<unknown> {
        const { data } = await apiClient.patch(ENDPOINTS.INTEGRATION.UPDATE(id), payload);
        return data?.data || data;
    },

    async deleteIntegration(id: string): Promise<unknown> {
        await apiClient.delete(ENDPOINTS.INTEGRATION.DELETE(id));
        return { success: true };
    },

    async getSyncLogs(id: string): Promise<SyncLog[]> {
        const { data } = await apiClient.get(ENDPOINTS.INTEGRATION.SYNC_LOGS(id), {
            params: { limit: 1000 }
        });
        const logs = data?.data || data;
        if (Array.isArray(logs)) {
            return logs.map((l: BackendSyncLog) => ({
                id: l.id,
                timestamp: l.startedAt || l.createdAt || new Date().toISOString(),
                level: l.status === "failed" ? "error" as const : (l.itemsFailed ?? 0) > 0 ? "warning" as const : "info" as const,
                message: `${l.syncType} sync for ${l.entityType}: ${l.itemsProcessed} processed, ${l.itemsCreated} created, ${l.itemsUpdated} updated${l.itemsFailed ? `, ${l.itemsFailed} failed` : ""}. Status: ${l.status}`,
            }));
        }
        return logs as SyncLog[];
    },

    // ─── Imports & Exports ───
    async getImportJobs(): Promise<ImportExportJob[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.IMPORT.GET_ALL, {
                params: { limit: 1000 }
            });
            const jobs = data?.data || data;
            if (Array.isArray(jobs)) {
                return jobs.map((j: BackendImportExportJob) => ({
                    id: j.id,
                    type: "import" as const,
                    fileName: j.fileName || "unknown",
                    createdBy: j.user?.name || "Admin User",
                    createdAt: j.createdAt || "",
                    progress: j.status === "COMPLETED" ? 100 : j.status === "PROCESSING" ? 50 : 0,
                    status: j.status === "COMPLETED" ? "completed" as const : j.status === "FAILED" || j.status === "PARTIALLY_FAILED" ? "failed" as const : "pending" as const,
                }));
            }
        } catch (err) {
            console.warn("API get import jobs failed", err);
        }
        return [];
    },

    async getExportJobs(): Promise<ImportExportJob[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.EXPORT.GET_ALL, {
                params: { limit: 1000 }
            });
            const jobs = data?.data || data;
            if (Array.isArray(jobs)) {
                return jobs.map((j: BackendImportExportJob) => ({
                    id: j.id,
                    type: "export" as const,
                    fileName: j.fileName || `export_${j.entityType}.${j.format || "csv"}`,
                    createdBy: j.user?.name || "Admin User",
                    createdAt: j.createdAt || "",
                    progress: j.status === "COMPLETED" ? 100 : j.status === "PROCESSING" ? 50 : 0,
                    status: j.status === "COMPLETED" ? "completed" as const : j.status === "FAILED" ? "failed" as const : "pending" as const,
                }));
            }
        } catch (err) {
            console.warn("API get export jobs failed", err);
        }
        return [];
    },

    async getImportExportJobs(): Promise<ImportExportJob[]> {
        const [imports, exports] = await Promise.all([
            settingsService.getImportJobs(),
            settingsService.getExportJobs(),
        ]);
        // Merge and sort by date descending
        return [...imports, ...exports].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    async createImport(file: File, entityType: string): Promise<unknown> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("entityType", entityType);
        const { data } = await apiClient.post(ENDPOINTS.IMPORT.CREATE, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data?.data || data;
    },

    async createExport(entityType: string, format: string = "csv"): Promise<{ id: string; status: string; [key: string]: any }> {
        const { data } = await apiClient.post(ENDPOINTS.EXPORT.CREATE, { entityType, format });
        return data?.data || data;
    },

    async getExportJob(id: string): Promise<any> {
        const { data } = await apiClient.get(ENDPOINTS.EXPORT.GET_ONE(id));
        return data?.data || data;
    },

    async downloadExport(id: string): Promise<Blob> {
        const { data } = await apiClient.get(ENDPOINTS.EXPORT.DOWNLOAD(id), { responseType: "blob" });
        return data;
    },

    // ─── Subscriptions & Billing ───
    async getPlans(): Promise<unknown[]> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.SUBSCRIPTION.LIST_PLANS, {
                params: { limit: 1000 }
            });
            return data?.data || data || [];
        } catch {
            return [];
        }
    },

    async getCurrentSubscription(): Promise<unknown> {
        try {
            const { data } = await apiClient.get(ENDPOINTS.SUBSCRIPTION.CURRENT);
            return data?.data || data;
        } catch {
            return null;
        }
    },

    async initializeSubscription(planId: string, billingCycle: string = "monthly"): Promise<unknown> {
        const { data } = await apiClient.post(ENDPOINTS.SUBSCRIPTION.INITIALIZE, { planId, billingCycle });
        return data?.data || data;
    },

    async cancelSubscription(immediately: boolean = false): Promise<unknown> {
        const { data } = await apiClient.patch(ENDPOINTS.SUBSCRIPTION.CANCEL, { immediately });
        return data?.data || data;
    },

    async getBillingInvoices(): Promise<BillingInvoice[]> {
        // Backend doesn't have a dedicated invoices endpoint yet.
        return [];
    }
};

