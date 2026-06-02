export interface Template {
    id: string;
    name: string;
    subject?: string;
    content?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface Campaign {
    id: string;
    name: string;
    subject: string;
    templateId: string;
    segmentId: string;
    status: CampaignStatus;
    scheduledAt?: string | null;
    sentAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    segmentName?: string;
    templateName?: string;
    type?: string;
    segment?: {
        id: string;
        name: string;
        description?: string;
        size?: number;
    } | null;
    metrics?: {
        sent: number;
        opened: number;
        clicked: number;
        converted: number;
        delivered?: number;
    } | null;
}

export interface CampaignStats {
    campaignId: string;
    sentCount: number;
    openedCount: number;
    clickedCount: number;
    bouncedCount: number;
}
