import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Segment } from "./types";
import { useSegments, useDeleteSegment } from "./segment.hooks";
import { columns } from "./components/SegmentColumns";
import ActionMenu from "./components/ActionMenu";
import SegmentFormModal from "./components/SegmentFormModal";

// MOCK_SEGMENTS fallback data - matching the first screenshot for Segment ID, Name, Size, Type, Creator, Created At
export const MOCK_SEGMENTS: Segment[] = [
    {
        id: "124578954",
        name: "VIP Customers",
        description: "This segment encapsulates the premium tier of our customer base, specifically identifying those who have demonstrated high loyalty through sustained purchasing behavior. Requirements focus on a Lifetime Value exceeding $1,000 and a minimum threshold of 3 completed orders, ensuring inclusion of only our most reliable recurring revenue drivers.",
        filter: {
            field: "totalSpent",
            operator: "gte",
            value: "4000",
        },
        rules: [
            { category: "Financial Performance", description: "Total Spent is greater than or equal to $4,000.00", icon: "finance" },
            { category: "Geographic Targeting", description: "City is within New York, London", icon: "geo" },
            { category: "Engagement Level", description: "Order Count is greater than or equal to 3 transactions", icon: "engagement" },
            { category: "Engagement Level", description: "Order Count is greater than or equal to 3 transactions", icon: "engagement" }
        ],
        customerCount: 0, // 0 as in the segments list screenshot (will display 1,200 in details)
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        creatorRole: "Lead Strategist",
        creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", // Omar Ali avatar for details page
        sizeTrend: "↑ + 5% Since last week",
        lastUpdated: "Last updated 14m ago",
        createdAt: "2026-04-12T00:00:00Z", // Displays as "12 Apr 2026"
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578955",
        name: "High Spenders (Egypt)",
        description: "Customers who spent more than 1000 EGP total.",
        filter: {
            field: "totalSpent",
            operator: "gt",
            value: "1000",
        },
        customerCount: 8,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578956",
        name: "Alexandria Leads",
        description: "All customers located in Alexandria city.",
        filter: {
            field: "city",
            operator: "eq",
            value: "Alexandria",
        },
        customerCount: 12,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578957",
        name: "Newsletter Subscribers",
        description: "Subscribers who opted in for email marketing.",
        filter: {
            field: "acceptsMarketing",
            operator: "eq",
            value: "true",
        },
        customerCount: 28,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578958",
        name: "VIP Members (Egypt)",
        description: "VIP tagged customers who are highly engaged.",
        filter: {
            field: "tags",
            operator: "contains",
            value: "VIP",
        },
        customerCount: 5,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578959",
        name: "Shopify Leads",
        description: "Referrals synced from Shopify store integration.",
        filter: {
            field: "source",
            operator: "eq",
            value: "shopify",
        },
        customerCount: 22,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578960",
        name: "New Accounts",
        description: "Fresh accounts registered under 3 months ago.",
        filter: {
            field: "lifecycleStage",
            operator: "eq",
            value: "New",
        },
        customerCount: 7,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
    {
        id: "124578961",
        name: "Churn Risks",
        description: "Customers who are classified as Churn Risks.",
        filter: {
            field: "lifecycleStage",
            operator: "eq",
            value: "Churn Risk",
        },
        customerCount: 4,
        type: "Dynamic",
        status: "Active",
        creator: "Menna Fathy",
        createdAt: "2026-04-12T00:00:00Z",
        updatedAt: "2026-04-12T00:00:00Z",
    },
];

const Segments = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [segmentToEdit, setSegmentToEdit] = useState<Segment | null>(null);

    // Filters state
    const [filterOpen, setFilterOpen] = useState(false);
    const [creatorFilter, setCreatorFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // Queries & Mutations
    const { data: segments = MOCK_SEGMENTS, isLoading } = useSegments();
    const deleteMutation = useDeleteSegment();

    // Handlers
    const handleView = (s: Segment) => navigate(`/dashboard/segments/${s.id}`);
    const handleEdit = (s: Segment) => {
        setSegmentToEdit(s);
        setModalOpen(true);
    };
    const handleCreate = () => {
        setSegmentToEdit(null);
        setModalOpen(true);
    };
    const handleDelete = (s: Segment) => {
        if (window.confirm(`Are you sure you want to delete the segment "${s.name}"?`)) {
            deleteMutation.mutate(s.id);
        }
    };

    // Client-side filtering & search
    const filteredSegments = segments.filter((s) => {
        const query = search.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(query) || 
                              (s.description && s.description.toLowerCase().includes(query));
        const matchesCreator = !creatorFilter || s.creator === creatorFilter;
        const matchesType = !typeFilter || s.status === typeFilter;
        return matchesSearch && matchesCreator && matchesType;
    });

    const activeFilterCount = (creatorFilter ? 1 : 0) + (typeFilter ? 1 : 0);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search segments..."
                onSearch={setSearch}
                filterCount={activeFilterCount}
                onFilter={() => setFilterOpen((p) => !p)}
                onCreate={handleCreate}
                createLabel="Create Segment"
                filterContent={
                    filterOpen && (
                        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-5 flex flex-wrap gap-4 shadow-sm">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Creator</label>
                                <select
                                    value={creatorFilter}
                                    onChange={(e) => setCreatorFilter(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none"
                                >
                                    <option value="">All Creators</option>
                                    <option value="Menna Fathy">Menna Fathy</option>
                                    <option value="Omar Ali">Omar Ali</option>
                                </select>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status/Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none"
                                >
                                    <option value="">All States</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => { setCreatorFilter(""); setTypeFilter(""); }}
                                    className="h-10 px-4 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )
                }
            >
                <DataTable<Segment>
                    columns={columns}
                    data={filteredSegments}
                    pageSize={9}
                    selectable
                    loading={isLoading}
                    rowKey="id"
                    renderRowAction={(row) => (
                        <ActionMenu
                            row={row}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="No segments found"
                />
            </PageLayout>

            <SegmentFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                segment={segmentToEdit}
            />
        </>
    );
};

export default Segments;
