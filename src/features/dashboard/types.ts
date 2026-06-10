export interface DashboardStats {
    totalCustomers: number;
    activeCustomers?: number;
    activeCampaigns: number;
    totalProducts: number;
    totalOrders: number;
    /** Percentage changes compared to last period */
    customerChange?: number;
    campaignChange?: number;
    productChange?: number;
    orderChange?: number;
}

export interface SalesDataPoint {
    date: string;
    orders: number;
    revenue: number;
}

export interface TicketBreakdown {
    open: number;
    pending: number;
    closed: number;
}

export interface AuditLogEntry {
    id: string;
    action: string;
    entityType: string;
    entityId?: string;
    performedBy: string;
    performedByName?: string;
    details?: string;
    relatedTo?: string;
    createdAt: string;
}

export interface DashboardData {
    stats: DashboardStats;
    salesOverview: SalesDataPoint[];
    ticketBreakdown: TicketBreakdown;
}
