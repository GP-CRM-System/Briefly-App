/* ── AI Intelligence feature types ── */

export interface ChurnResult {
    customerId: string;
    churnProbability: number;
    riskLevel: "stable" | "low" | "high";
}

export interface SegmentDistribution {
    segment: number;
    name: string;
    count: number;
    percentage: number;
}

export interface SegmentResult {
    customerId: string;
    segment: number;
    segmentName: string;
    distances: [number, number, number];
}

export interface SimilarItem {
    itemId: string;
    similarity: number;
}

export interface ProductRecommendation {
    productId: string;
    recommendations: SimilarItem[];
}

export interface AiHealth {
    churnModel: { available: boolean; features: number };
    segmentation: { available: boolean };
    recommendations: { available: boolean };
}

export interface ChurnSummary {
    totalCustomers: number;
    stable: number;
    atRisk: number;
    highRisk: number;
    threshold: number;
}

export interface ChurnCustomer {
    id: string;
    name: string;
    email: string;
    churnRiskScore: number;
    lifecycleStage: string;
    lastScoredAt: string;
    metrics: { churnProbability: number } | null;
}

export interface ChurnResultsData {
    customers: ChurnCustomer[];
    total: number;
}

export interface SegmentResultsData {
    totalCustomers: number;
    distribution: SegmentDistribution[];
}
