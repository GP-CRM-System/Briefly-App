import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Campaign } from "./types";
import { useCampaigns, useDeleteCampaign, useSendCampaign } from "./campaign.hooks";
import { columns } from "./components/CampaignColumns";
import ActionMenu from "./components/ActionMenu";
import CampaignFormModal from "./components/CampaignFormModal";
import toast from "react-hot-toast";

// MOCK_CAMPAIGNS fallback data
export const MOCK_CAMPAIGNS: Campaign[] = [
    {
        id: "camp-1",
        name: "Welcome Onboarding Sequence",
        subject: "Welcome to Briefly! Here's how to get started",
        templateId: "tmpl-1",
        segmentId: "seg-1",
        segmentName: "Loyal Customers",
        templateName: "Welcome Email Template",
        status: "sent",
        sentAt: "2026-05-15T08:00:00Z",
        createdAt: "2026-05-14T10:00:00Z",
        updatedAt: "2026-05-15T08:00:00Z",
    },
    {
        id: "camp-2",
        name: "VIP Special Promo",
        subject: "Exclusive 25% discount for VIP members!",
        templateId: "tmpl-3",
        segmentId: "seg-3",
        segmentName: "VIP Members",
        templateName: "Loyalty Discount Offer",
        status: "sending",
        sentAt: null,
        createdAt: "2026-05-28T14:00:00Z",
        updatedAt: "2026-06-02T05:00:00Z",
    },
    {
        id: "camp-3",
        name: "June Newsletter",
        subject: "Briefly June Digest: Product Updates & Analytics Tips",
        templateId: "tmpl-2",
        segmentId: "all",
        segmentName: "All Customers",
        templateName: "Monthly Newsletter",
        status: "scheduled",
        scheduledAt: "2026-06-05T09:00:00Z",
        createdAt: "2026-05-30T11:00:00Z",
        updatedAt: "2026-05-30T11:00:00Z",
    },
    {
        id: "camp-4",
        name: "Abandoned Shopping Cart",
        subject: "Did you forget something? Your cart is waiting!",
        templateId: "tmpl-4",
        segmentId: "seg-8",
        segmentName: "Churn Risks",
        templateName: "Abandoned Cart Reminder",
        status: "draft",
        createdAt: "2026-06-01T16:00:00Z",
        updatedAt: "2026-06-01T16:00:00Z",
    },
    {
        id: "camp-5",
        name: "Shopify Sync Announcement",
        subject: "Sync Shopify directly with Briefly starting today",
        templateId: "tmpl-1",
        segmentId: "seg-6",
        segmentName: "Shopify Referrals",
        templateName: "Welcome Email Template",
        status: "sent",
        sentAt: "2026-04-20T10:00:00Z",
        createdAt: "2026-04-19T09:00:00Z",
        updatedAt: "2026-04-20T10:00:00Z",
    },
    {
        id: "camp-6",
        name: "Egypt Customer Survey",
        subject: "Tell us how we are doing and win 500 EGP",
        templateId: "tmpl-2",
        segmentId: "seg-2",
        segmentName: "High Spenders (Egypt)",
        templateName: "Monthly Newsletter",
        status: "failed",
        sentAt: "2026-05-20T12:00:00Z",
        createdAt: "2026-05-18T15:00:00Z",
        updatedAt: "2026-05-20T12:00:00Z",
    },
    {
        id: "camp-7",
        name: "Newsletter Re-engagement Campaign",
        subject: "We miss you! Re-opt in to receive Briefly tips",
        templateId: "tmpl-3",
        segmentId: "seg-4",
        segmentName: "Newsletter Subscribers",
        templateName: "Loyalty Discount Offer",
        status: "draft",
        createdAt: "2026-05-25T11:30:00Z",
        updatedAt: "2026-05-25T11:30:00Z",
    },
    {
        id: "camp-8",
        name: "Alexandria Branch Opening Promo",
        subject: "Join us at the new Alexandria branch this Thursday!",
        templateId: "tmpl-3",
        segmentId: "seg-5",
        segmentName: "Alexandria Leads",
        templateName: "Loyalty Discount Offer",
        status: "sent",
        sentAt: "2026-04-10T08:00:00Z",
        createdAt: "2026-04-08T10:00:00Z",
        updatedAt: "2026-04-10T08:00:00Z",
    },
];

const Campaigns = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);

    // Queries & Mutations
    const { data: campaigns = MOCK_CAMPAIGNS, isLoading } = useCampaigns();
    const deleteMutation = useDeleteCampaign();
    const sendMutation = useSendCampaign();

    // Handlers
    const handleView = (c: Campaign) => navigate(`/dashboard/campaigns/${c.id}`);
    const handleEdit = (c: Campaign) => {
        setCampaignToEdit(c);
        setModalOpen(true);
    };
    const handleCreate = () => {
        setCampaignToEdit(null);
        setModalOpen(true);
    };
    const handleSend = (c: Campaign) => {
        if (window.confirm(`Are you sure you want to send the campaign "${c.name}" now?`)) {
            sendMutation.mutate(c.id, {
                onSuccess: () => {
                    toast.success("Campaign dispatch started!");
                }
            });
        }
    };
    const handleDelete = (c: Campaign) => {
        if (window.confirm(`Are you sure you want to delete the campaign "${c.name}"?`)) {
            deleteMutation.mutate(c.id);
        }
    };

    // Client-side search filtering
    const filteredCampaigns = campaigns.filter((c) => {
        const query = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(query) ||
            c.subject.toLowerCase().includes(query)
        );
    });

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search campaigns..."
                onSearch={setSearch}
                onCreate={handleCreate}
                createLabel="Create Campaign"
            >
                <DataTable<Campaign>
                    columns={columns}
                    data={filteredCampaigns}
                    pageSize={9}
                    selectable
                    loading={isLoading}
                    rowKey="id"
                    renderRowAction={(row) => (
                        <ActionMenu
                            row={row}
                            onView={handleView}
                            onEdit={handleEdit}
                            onSend={handleSend}
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="No campaigns found"
                />
            </PageLayout>

            <CampaignFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                campaign={campaignToEdit}
            />
        </>
    );
};

export default Campaigns;
