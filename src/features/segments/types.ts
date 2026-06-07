export interface SegmentFilter {
    field: string;
    operator: string;
    value: string;
}

export interface SegmentRule {
    category: string;
    description: string;
    icon: "finance" | "geo" | "engagement";
}

export interface Segment {
    id: string;
    name: string;
    description?: string;
    filter: SegmentFilter;
    rules?: SegmentRule[];
    creator?: string;
    creatorRole?: string;
    creatorImage?: string;
    type?: string; // "Dynamic" | "Manual"
    status?: string; // "Active" | "Inactive"
    sizeTrend?: string; // e.g. "↑ + 5% Since last week"
    lastUpdated?: string; // e.g. "14m ago"
    createdAt: string;
    updatedAt: string;
    customerCount?: number;
}
