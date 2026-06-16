import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Template } from "./types";
import { useTemplates, useDeleteTemplate } from "./template.hooks";
import { columns } from "./components/TemplateColumns";
import ActionMenu from "./components/ActionMenu";
import TemplateFormModal from "./components/TemplateFormModal";

const Templates = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);

    // Queries & Mutations
    const { data: templates = [], isLoading } = useTemplates();
    const deleteMutation = useDeleteTemplate();

    // Handlers
    const handleView = (t: Template) => navigate(`/dashboard/templates/${t.id}`);
    const handleEdit = (t: Template) => {
        setTemplateToEdit(t);
        setModalOpen(true);
    };
    const handleCreate = () => {
        setTemplateToEdit(null);
        setModalOpen(true);
    };
    const handleDelete = (t: Template) => {
        if (window.confirm(`Are you sure you want to delete the template "${t.name}"?`)) {
            deleteMutation.mutate(t.id);
        }
    };

    // Client-side search filtering
    const filteredTemplates = templates.filter((t) => {
        const query = search.toLowerCase();
        return (
            t.name.toLowerCase().includes(query) ||
            (t.subject && t.subject.toLowerCase().includes(query))
        );
    });

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search templates..."
                onSearch={setSearch}
                onCreate={handleCreate}
                createLabel="Create Template"
            >
                <DataTable<Template>
                    columns={columns}
                    data={filteredTemplates}
                    pageSize={10}
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
                    emptyMessage="No templates found"
                />
            </PageLayout>

            <TemplateFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                template={templateToEdit}
            />
        </>
    );
};

export default Templates;
