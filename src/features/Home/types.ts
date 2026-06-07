export type StatColor = "blue" | "green" | "red" | "amber" | string;

export interface StatItem {
  title: string;
  value: number;
  change: number;
  isPositive: boolean;
  icon: string;
  color: StatColor;
}

/* ── Dashboard Report (from /reports/dashboard) ── */
export interface RevenueStats {
  currentRevenue: number;
  lastRevenue: number;
  revenueGrowth: number;
  currentOrderCount: number;
  lastOrderCount: number;
  orderGrowth: number;
}

export interface AcquisitionEntry {
  month: string;
  count: number;
}

export interface SalesOverviewEntry {
  date: string;
  orders: number;
  revenue: number;
}

export interface TicketStats {
  open: number;
  pending: number;
  closed: number;
}

export interface DashboardReport {
  revenue: RevenueStats;
  acquisition: AcquisitionEntry[];
  salesOverview: SalesOverviewEntry[];
  ticketStats: TicketStats;
}

/* ── Audit Report (from /reports/audit) ── */
export interface AuditReport {
  logs?: AuditLogEntry[];
  total?: number;
  [key: string]: unknown;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  details?: Record<string, unknown>;
  createdAt?: string;
}
