import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Segment } from "./types";
import { useSegments, useDeleteSegment } from "./segment.hooks";
import { columns } from "./components/SegmentColumns";
import ActionMenu from "./components/ActionMenu";
import SegmentFormModal from "./components/SegmentFormModal";

const Segments = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [segmentToEdit, setSegmentToEdit] = useState<Segment | null>(null);

    // Queries & Mutations
    const { data: segments = [], isLoading } = useSegments();
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
        return s.name.toLowerCase().includes(query) ||
               (s.description && s.description.toLowerCase().includes(query));
    });

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search segments..."
                onSearch={setSearch}
                onCreate={handleCreate}
                createLabel="Create Segment"
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
