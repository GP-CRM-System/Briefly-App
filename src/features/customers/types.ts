/* ── Customer feature types ── */

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    source?: string;
    acceptMarketing?: boolean;
    acceptsMarketing?: boolean;
    lifecycleStage?: string;
    tags?: string[];
    totalSpent?: string | number;
    totalOrders?: number;
    totalRefunded?: string | number;
    avgOrderValue?: string | number;
    firstOrderAt?: string | null;
    lastOrderAt?: string | null;
    avgDaysBetweenOrders?: number | null;
    churnRiskScore?: number | null;
    rfmScore?: string | null;
    rfmSegment?: string | null;
    rfmRecency?: number | null;
    rfmFrequency?: number | null;
    rfmMonetary?: number | null;
    isLoyaltyMember?: boolean;
    accountAgeMonths?: number;
    engagementScore?: number | null;
    satisfactionScore?: number | null;
    browsingFrequency?: string | null;
    cartAbandonmentRate?: number | null;
    supportTicketsCount?: number;
    lastSentimentScore?: number | null;
    priceSensitivityIndex?: number | null;
    cohortMonth?: string | null;
    customerEvents?: CustomerEvent[];
    notes?: CustomerNote[];
    orders?: CustomerOrder[];
    supportTickets?: any[];
    lastActivity?: string;
    lastActivityDate?: string;
    createdAt?: string;
    updatedAt?: string;
    image?: string;
}

export interface CustomerOrder {
    id: string;
    customerId: string;
    shippingStatus: string;
    paymentStatus: string;
    createdAt: string;
    updatedAt: string;
    subtotal: string;
    totalAmount: string;
    currency: string;
    discountAmount?: string;
    refundAmount?: string;
    taxAmount?: string | null;
    shippingAmount?: string | null;
    note?: string | null;
    source?: string | null;
    tags?: string[] | null;
}

export interface CustomerNote {
    id: string;
    content: string;
    createdAt: string;
    author?: string;
}

export interface CustomerEvent {
    id: string;
    type: string;
    description?: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

export interface CustomerFormData {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    source: string;
    acceptMarketing: string;
    lifecycleStage: string;
}

export interface FilterState {
    name: string;
    spentMin: number;
    spentMax: number;
    lifecycles: Set<string>;
}
