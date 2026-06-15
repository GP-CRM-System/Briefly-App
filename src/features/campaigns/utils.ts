import type { Campaign, CampaignStatus } from "./types";

export interface CampaignFilterState {
    name: string | null;
    types: Set<string>;
    statuses: Set<CampaignStatus>;
    minSent: number | null;
    minOpened: number | null;
    startDate: string | null;
    endDate: string | null;
}

export const freshCampaignFilters = (): CampaignFilterState => ({
    name: null,
    types: new Set<string>(),
    statuses: new Set<CampaignStatus>(),
    minSent: null,
    minOpened: null,
    startDate: null,
    endDate: null,
});

export const CAMPAIGN_TYPE_OPTIONS = ["E-mail", "SMS", "WhatsApp"];
export const CAMPAIGN_STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "sending", label: "Sending" },
    { value: "sent", label: "Completed" },
    { value: "failed", label: "Failed" },
];

export const filterCampaigns = (
    campaigns: Campaign[],
    search: string,
    filters: CampaignFilterState
): Campaign[] => {
    return campaigns.filter((c) => {
        // Search query filter (matches name or subject)
        if (search) {
            const query = search.toLowerCase();
            const matchesName = c.name?.toLowerCase().includes(query);
            const matchesSubject = c.subject?.toLowerCase().includes(query);
            if (!matchesName && !matchesSubject) return false;
        }

        // Campaign Name filter
        if (filters.name) {
            if (c.name !== filters.name) return false;
        }

        // Type filter
        if (filters.types && filters.types.size > 0) {
            const campaignType = c.type || "E-mail";
            let isMatched = false;
            filters.types.forEach((t) => {
                const normT = t.toLowerCase();
                const normC = campaignType.toLowerCase();
                if (normT === "e-mail" || normT === "email") {
                    if (normC === "email" || normC === "e-mail") {
                        isMatched = true;
                    }
                } else if (normC === normT) {
                    isMatched = true;
                }
            });
            if (!isMatched) return false;
        }

        // Status filter
        if (filters.statuses && filters.statuses.size > 0) {
            if (!filters.statuses.has(c.status)) return false;
        }

        // Sent filter (metrics.sent)
        if (filters.minSent !== null && filters.minSent !== undefined) {
            const sentVal = c.metrics?.sent ?? 3000;
            if (sentVal < filters.minSent) return false;
        }

        // Opened filter (metrics.opened)
        if (filters.minOpened !== null && filters.minOpened !== undefined) {
            const openedVal = c.metrics?.opened ?? 1800;
            if (openedVal < filters.minOpened) return false;
        }

        // Scheduled Time range filter
        if (filters.startDate || filters.endDate) {
            const dateStr = c.scheduledAt || c.createdAt;
            if (!dateStr) return false;
            const campaignDate = new Date(dateStr);
            if (isNaN(campaignDate.getTime())) return false;

            // Set times to midnight for date-only comparison
            campaignDate.setHours(0, 0, 0, 0);

            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                if (campaignDate < start) return false;
            }

            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(0, 0, 0, 0);
                if (campaignDate > end) return false;
            }
        }

        return true;
    });
};

export const countActiveCampaignFilters = (filters: CampaignFilterState): number => {
    let count = 0;
    if (filters.name) count += 1;
    if (filters.types && filters.types.size > 0) count += filters.types.size;
    if (filters.statuses && filters.statuses.size > 0) count += filters.statuses.size;
    if (filters.minSent !== null && filters.minSent !== undefined) count += 1;
    if (filters.minOpened !== null && filters.minOpened !== undefined) count += 1;
    if (filters.startDate || filters.endDate) count += 1;
    return count;
};
