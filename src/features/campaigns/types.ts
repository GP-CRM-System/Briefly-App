export type { Template } from "@/features/templates/types";

export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "failed";

export interface Campaign {
    id: string;
    name: string;
    subject?: string | null;
    description?: string | null;
    templateId?: string | null;
    segmentId?: string | null;
    segmentName?: string | null;
    status: CampaignStatus;
    scheduledAt?: string | null;
    sentAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    recipientCount?: number;
    type?: string | null;
    segment?: {
        id: string;
        name: string;
        description?: string;
        size?: number;
    } | null;
    template?: {
        id: string;
        name: string;
        subject?: string;
        htmlBody?: string;
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
