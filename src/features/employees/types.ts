export interface ActivityLog {
    id: string;
    type: "lead_update" | "campaign_create" | "ticket_resolve" | "meeting_schedule" | string;
    title: string;
    description?: string;
    createdAt: string;
    metadata?: Record<string, any>;
}

export interface Employee {
    id: string;
    userId?: string;
    name?: string;
    email: string;
    phone?: string;
    role: string;
    location?: string;
    status?: "active" | "pending" | "inactive";
    createdAt?: string;
    updatedAt?: string;
    dealsWon?: number;
    revenueTarget?: number;
    activityLogs?: ActivityLog[];
}

export interface EmployeeFormData {
    email: string;
    role: string;
}

export interface EmployeeFilterState {
    role: Set<string>;
    status: Set<string>;
    search: string;
}
