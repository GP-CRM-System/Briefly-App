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
    tags?: { id: string; name: string; color: string }[];
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
    websiteVisitsLastMonth?: number | null;
    cohortMonth?: string | null;
    customerEvents?: CustomerEvent[];
    productInteractions?: CustomerProductInteraction[];
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
    body: string;
    createdAt: string;
    author?: { id: string; name: string };
}

export interface CustomerEvent {
    id: string;
    eventType: string;
    description?: string;
    occurredAt: string;
    metadata?: Record<string, unknown>;
}

export interface CustomerProductInteraction {
    id: string;
    interactionType: string;
    rating?: number | null;
    device?: string | null;
    createdAt: string;
    product?: {
        id: string;
        name: string;
        imageUrl?: string | null;
    } | null;
}

/** Unified timeline entry combining events and product interactions */
export interface TimelineEntry {
    id: string;
    type: "event" | "interaction";
    label: string;
    description?: string;
    timestamp: string;
    icon: string;
    product?: {
        id: string;
        name: string;
        imageUrl?: string | null;
    } | null;
    rating?: number | null;
    device?: string | null;
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
    tags: Set<string>;
    ordersMin: number;
    ordersMax: number;
}
