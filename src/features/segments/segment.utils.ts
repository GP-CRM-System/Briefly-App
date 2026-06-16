import type { SegmentFilter, SegmentCondition, SegmentAndGroup, SegmentOrGroup } from "./types";

// ── Type Guards ──

export function isCondition(filter: SegmentFilter): filter is SegmentCondition {
    return "field" in filter && "operator" in filter && !("and" in filter) && !("or" in filter);
}

export function isAndGroup(filter: SegmentFilter): filter is SegmentAndGroup {
    return "and" in filter && Array.isArray((filter as SegmentAndGroup).and);
}

export function isOrGroup(filter: SegmentFilter): filter is SegmentOrGroup {
    return "or" in filter && Array.isArray((filter as SegmentOrGroup).or);
}

// ── Labels ──

const FIELD_LABELS: Record<string, string> = {
    name: "Name",
    phone: "Phone",
    email: "Email",
    city: "City",
    address: "Address",
    source: "Source",
    lifecycleStage: "Lifecycle Stage",
    totalOrders: "Total Orders",
    totalSpent: "Total Spent",
    totalRefunded: "Total Refunded",
    avgOrderValue: "Avg Order Value",
    firstOrderAt: "First Order",
    lastOrderAt: "Last Order",
    avgDaysBetweenOrders: "Avg Days Between Orders",
    churnRiskScore: "Churn Risk Score",
    rfmScore: "RFM Score",
    rfmSegment: "RFM Segment",
    rfmRecency: "RFM Recency",
    rfmFrequency: "RFM Frequency",
    rfmMonetary: "RFM Monetary",
    cohortMonth: "Cohort Month",
    acceptsMarketing: "Accepts Marketing",
    isLoyaltyMember: "Loyalty Member",
    accountAgeMonths: "Account Age (Months)",
    engagementScore: "Engagement Score",
    satisfactionScore: "Satisfaction Score",
    supportTicketsCount: "Support Tickets",
};

const OPERATOR_LABELS: Record<string, string> = {
    eq: "equals",
    neq: "does not equal",
    gt: "is greater than",
    gte: "is at least",
    lt: "is less than",
    lte: "is at most",
    contains: "contains",
    startsWith: "starts with",
    endsWith: "ends with",
    in: "is in",
    notIn: "is not in",
    isNull: "is empty",
    isNotNull: "is not empty",
};

export function getFieldLabel(field: string): string {
    return FIELD_LABELS[field] || field;
}

export function getOperatorLabel(operator: string): string {
    return OPERATOR_LABELS[operator] || operator;
}

export function formatValue(value: string | number | boolean | undefined | null): string {
    if (value === undefined || value === null) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
}

// ── Display formatting ──

export function formatCondition(condition: SegmentCondition): string {
    const field = getFieldLabel(condition.field);
    const op = getOperatorLabel(condition.operator);

    if (condition.operator === "isNull") return `${field} is empty`;
    if (condition.operator === "isNotNull") return `${field} is not empty`;

    return `${field} ${op} ${formatValue(condition.value)}`;
}

export function formatFilter(filter: SegmentFilter | null | undefined): string {
    if (!filter) return "No filter defined";

    if (isCondition(filter)) {
        return formatCondition(filter);
    }

    if (isAndGroup(filter)) {
        const parts = filter.and.map((f) => formatFilter(f));
        return parts.join(" AND ");
    }

    if (isOrGroup(filter)) {
        const parts = filter.or.map((f) => formatFilter(f));
        return parts.join(" OR ");
    }

    return "Unknown filter";
}

/**
 * Returns the number of leaf conditions in a filter tree.
 */
export function countConditions(filter: SegmentFilter): number {
    if (isCondition(filter)) return 1;
    if (isAndGroup(filter)) return filter.and.reduce((sum, f) => sum + countConditions(f), 0);
    if (isOrGroup(filter)) return filter.or.reduce((sum, f) => sum + countConditions(f), 0);
    return 0;
}
