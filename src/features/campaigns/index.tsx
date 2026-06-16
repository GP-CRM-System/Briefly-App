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

const ManageTemplatesButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
    >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Manage Templates
    </button>
);

const Campaigns = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);

    // Queries & Mutations
    const { data: campaigns = [], isLoading } = useCampaigns();
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
            c.subject?.toLowerCase().includes(query)
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
                extraActions={<ManageTemplatesButton onClick={() => navigate("/dashboard/templates")} />}
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
