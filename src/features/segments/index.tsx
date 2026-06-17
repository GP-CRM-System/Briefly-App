import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Segment } from "./types";
import { useSegments, useDeleteSegment } from "./segment.hooks";
import { standardColumns, detailedColumns } from "./components/SegmentColumns";
import ActionMenu from "./components/ActionMenu";
import SegmentFormModal from "./components/SegmentFormModal";

/* ── View Mode Toggle ── */
const ViewToggle = ({
    mode,
    onChange,
}: {
    mode: "standard" | "detailed";
    onChange: (m: "standard" | "detailed") => void;
}) => (
    <div className="flex items-center rounded-[10px] border border-[rgba(179,179,179,0.27)] bg-white shadow-[2px_4px_5px_rgba(180,191,205,0.2)] p-[3px] h-[49px]">
        {(["standard", "detailed"] as const).map((opt) => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`relative h-full px-4 rounded-[8px] text-sm font-medium transition-all duration-200 ${
                    mode === opt
                        ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                {opt === "standard" ? (
                    <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Standard
                    </span>
                ) : (
                    <span className="flex items-center gap-2">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        Detailed
                    </span>
                )}
            </button>
        ))}
    </div>
);

const Segments = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [segmentToEdit, setSegmentToEdit] = useState<Segment | null>(null);
    const [viewMode, setViewMode] = useState<"standard" | "detailed">("detailed");
    const [filterOpen, setFilterOpen] = useState(false);
    const [creatorFilter, setCreatorFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    // Queries & Mutations
    const { data: segments = [], isLoading, isError } = useSegments();
    const deleteMutation = useDeleteSegment();

    // Derive unique creators from real API data
    const creatorOptions = useMemo(() => {
        const names = segments.map((s) => s.creator).filter(Boolean) as string[];
        return Array.from(new Set(names)).sort();
    }, [segments]);

    // Pick the active column set based on viewMode
    const activeColumns = viewMode === "standard" ? standardColumns : detailedColumns;

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
        const matchesSearch =
            s.name.toLowerCase().includes(query) ||
            (s.description && s.description.toLowerCase().includes(query));
        const matchesCreator = !creatorFilter || s.creator === creatorFilter;
        const matchesType = !typeFilter || s.type === typeFilter;
        return matchesSearch && matchesCreator && matchesType;
    });

    const activeFilterCount = [creatorFilter, typeFilter].filter(Boolean).length;

    return (
        <>
            <div data-tour="segments-page">
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search segments..."
                onSearch={setSearch}
                onCreate={handleCreate}
                createLabel="Create Segment"
                filterCount={activeFilterCount}
                onFilter={() => setFilterOpen((p) => !p)}
                extraActions={
                    <ViewToggle mode={viewMode} onChange={setViewMode} />
                }
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
                                    <p className="font-['Poppins'] font-semibold text-[18px] text-[#1a1a1a]">Filter</p>
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="bg-[#b3b3b3]/80 hover:bg-gray-400 rounded-full p-1 cursor-pointer transition-colors flex items-center justify-center size-[24px]"
                                    >
                                        <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="bg-gray-200 h-px w-full" />

                                {/* Filter inputs */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">Creator</p>
                                        <select
                                            value={creatorFilter}
                                            onChange={(e) => setCreatorFilter(e.target.value)}
                                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] px-3 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                                        >
                                            <option value="">All Creators</option>
                                            {creatorOptions.map((name) => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">Type</p>
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

                                <style>{`
                                    @keyframes modalSlideIn {
                                        from { opacity: 0; transform: translateY(-8px); }
                                        to { opacity: 1; transform: translateY(0); }
                                    }
                                `}</style>
                            </div>
                        </div>
                    )
                }
            >
                <DataTable<Segment>
                    columns={activeColumns}
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
            </div>

            <SegmentFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                segment={segmentToEdit}
            />
        </>
    );
};

export default Segments;
