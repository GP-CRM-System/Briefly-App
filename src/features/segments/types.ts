export interface SegmentCondition {
    field: string;
    operator: string;
    value?: string | number | boolean;
}

export interface SegmentAndGroup {
    and: SegmentFilter[];
}

export interface SegmentOrGroup {
    or: SegmentFilter[];
}

export type SegmentFilter = SegmentCondition | SegmentAndGroup | SegmentOrGroup;

export interface Segment {
    id: string;
    name: string;
    description?: string | null;
    filter: SegmentFilter;
    size?: number;
    customerCount?: number;
    creatorId?: string | null;
    creator?: string | null;
    creatorRole?: string | null;
    creatorImage?: string | null;
    status?: string | null;
    type?: string | null;
    sizeTrend?: string | null;
    lastUpdated?: string | null;
    rules?: Array<{ icon: string; category: string; description: string }> | null;
    conditions?: Array<{ field: string; operator: string; value: string }> | null;
    createdAt: string;
    updatedAt: string;
}
