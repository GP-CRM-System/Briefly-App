export interface DashboardCustomerEvent {
    id: string;
    customer: { name: string; id: string };
    eventType: string;
    occurredAt: string;
    description: string;
}

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
    customerEvents?: DashboardCustomerEvent[];
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

export interface RevenueStats {
    currentRevenue: number;
    lastRevenue: number;
    revenueGrowth: number;
    currentOrderCount: number;
    lastOrderCount: number;
    orderGrowth: number;
}

export interface AcquisitionDataPoint {
    month: string;
    count: number;
}

export interface DashboardData {
    stats: DashboardStats;
    salesOverview: SalesDataPoint[];
    ticketBreakdown: TicketBreakdown;
    ticketStats: TicketBreakdown;
    revenue: RevenueStats;
    acquisition: AcquisitionDataPoint[];
}
