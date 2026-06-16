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
    creatorId?: string | null;
    createdAt: string;
    updatedAt: string;
}
