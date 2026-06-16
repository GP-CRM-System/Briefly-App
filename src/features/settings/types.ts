export interface UserProfile {
    name: string;
    email: string;
    image: string | null;
    designation: string;
    linkedInConnected: boolean;
    twitterConnected: boolean;
}

export interface OrganizationProfile {
    name: string;
    slug: string;
    logo: string | null;
}

export type PermissionAction = "read" | "write" | "delete";

export interface ResourcePermissions {
    read: boolean;
    write: boolean;
    delete: boolean;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    userCount: number;
    permissions: Record<string, ResourcePermissions>;
}

export interface ConnectionDetails {
    id: string;
    provider: string;
    name: string;
    status: "active" | "inactive";
    url: string;
    connectedAt: string;
    connectedBy: string;
    autoSync: boolean;
    syncFrequency: string;
    syncDirection: string;
    conflictHandling: string;
    lastSyncAt: string;
    lastSyncStatus: "success" | "failed";
    metadata?: Record<string, unknown>;
}

export interface SyncLog {
    id: string;
    timestamp: string;
    level: "info" | "error" | "warning";
    message: string;
}

export interface ImportExportJob {
    id: string;
    type: "import" | "export";
    fileName: string;
    createdBy: string;
    createdAt: string;
    progress: number;
    status: "completed" | "pending" | "failed";
}

export interface BillingInvoice {
    id: string;
    date: string;
    amount: string;
    status: "paid" | "unpaid" | "failed";
}

export interface UsageMetric {
    used: number;
    limit: number;
    percentage: number;
}

export interface BackendRole {
    id: string;
    name?: string;
    role?: string;
    description?: string;
    userCount?: number;
    _count?: {
        members?: number;
    };
    permission?: Record<string, string[]>;
    permissions?: Record<string, string[]>;
}

export interface BackendIntegration {
    id: string;
    provider: string;
    name?: string;
    isActive?: boolean;
    shopDomain?: string;
    createdAt?: string;
    syncMode?: string;
    lastSyncedAt?: string;
    syncStatus?: string;
    metadata?: Record<string, unknown>;
}

export interface BackendSyncLog {
    id: string;
    startedAt?: string;
    createdAt?: string;
    status?: string;
    itemsFailed?: number;
    syncType?: string;
    entityType?: string;
    itemsProcessed?: number;
    itemsCreated?: number;
    itemsUpdated?: number;
}

export interface BackendImportExportJob {
    id: string;
    fileName?: string;
    createdAt?: string;
    status?: string;
    entityType?: string;
    format?: string;
    user?: {
        name?: string;
    };
}
