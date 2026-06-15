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
    metadata?: Record<string, any>;
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
