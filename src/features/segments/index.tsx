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
        creator: "Omar Ali",
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
        creator: "Sarah Smith",
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
        creator: "John Doe",
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
        creator: "Omar Ali",
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
        creator: "Sarah Smith",
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
        creator: "John Doe",
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
    const { data: segments = [], isLoading, isError } = useSegments();
    const deleteMutation = useDeleteSegment();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load segments</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

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
        const matchesType = !typeFilter || s.type === typeFilter;
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
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px]" onClick={() => setFilterOpen(false)} />

                            {/* Dialog */}
                            <div 
                                className="relative w-[380px] max-w-full bg-[#f6f8fa] rounded-2xl shadow-2xl border border-gray-200/50 z-10 p-5 flex flex-col gap-4"
                                style={{ animation: "modalSlideIn 0.2s ease-out" }}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between w-full">
                                    <p className="font-['Poppins'] font-semibold text-[18px] text-[#1a1a1a]">
                                        Filter
                                    </p>
                                    <button 
                                        onClick={() => setFilterOpen(false)}
                                        className="bg-[#b3b3b3]/80 hover:bg-gray-400 rounded-full p-1 cursor-pointer transition-colors flex items-center justify-center size-[24px]"
                                    >
                                        <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="bg-gray-200 h-px w-full" />

                                {/* Filter inputs */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                                            Creator
                                        </p>
                                        <select
                                            value={creatorFilter}
                                            onChange={(e) => setCreatorFilter(e.target.value)}
                                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] px-3 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                                        >
                                            <option value="">All Creators</option>
                                            <option value="Menna Fathy">Menna Fathy</option>
                                            <option value="Omar Ali">Omar Ali</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                                            Type
                                        </p>
                                        <select
                                            value={typeFilter}
                                            onChange={(e) => setTypeFilter(e.target.value)}
                                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] px-3 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                                        >
                                            <option value="">All Types</option>
                                            <option value="Dynamic">Dynamic</option>
                                            <option value="Static">Static</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex gap-[16px] h-[40px] items-center w-full mt-1">
                                    <button 
                                        onClick={() => { setCreatorFilter(""); setTypeFilter(""); }}
                                        className="border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-all h-[40px] flex items-center justify-center rounded-[6px] flex-1 font-['Poppins'] font-semibold text-[14px] cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                    <button 
                                        onClick={() => setFilterOpen(false)}
                                        className="bg-[#4a90e2] text-white hover:bg-blue-600 hover:shadow-sm transition-all h-[40px] flex items-center justify-center rounded-[6px] flex-1 font-['Poppins'] font-semibold text-[14px] cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <style>{`
                                @keyframes modalSlideIn {
                                    from { opacity: 0; transform: translateY(-8px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>
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
