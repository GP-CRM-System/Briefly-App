import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Campaign } from "./types";
import { useCampaigns, useDeleteCampaign, useSendCampaign } from "./campaign.hooks";
import { columns } from "./components/CampaignColumns";
import ActionMenu from "./components/ActionMenu";
import CampaignFormModal from "./components/CampaignFormModal";
import FilterPanel from "./components/FilterPanel";
import { freshCampaignFilters, filterCampaigns, countActiveCampaignFilters, type CampaignFilterState } from "./utils";
import toast from "react-hot-toast";

const ManageTemplatesButton = ({ onClick }: { onClick: () => void }) => (
    <button
        onClick={onClick}
        className="inline-flex items-center gap-2 h-[49px] px-4 rounded-[9px] border border-[rgba(179,179,179,0.27)] bg-white text-sm font-medium text-gray-600 shadow-[2px_4px_5px_rgba(180,191,205,0.2)] hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
    >
        <svg className="h-5 w-5 opacity-65" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<CampaignFilterState>(freshCampaignFilters());
    const [modalOpen, setModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);

    // Queries & Mutations
    const { data: campaigns = [], isLoading, isError } = useCampaigns();
    const deleteMutation = useDeleteCampaign();
    const sendMutation = useSendCampaign();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto animate-scaleUp">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load campaigns</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

    const campaignNames = Array.from(new Set(campaigns.map((c) => c.name)));

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

    // Filter campaigns using utils
    const filteredCampaigns = filterCampaigns(campaigns, search, activeFilters);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search campaigns..."
                onSearch={setSearch}
                filterCount={countActiveCampaignFilters(activeFilters)}
                onFilter={() => setFilterOpen((prev) => !prev)}
                onCreate={handleCreate}
                createLabel="Create Campaign"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                        campaignNames={campaignNames}
                    />
                }
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
