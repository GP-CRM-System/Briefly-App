import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Customer, FilterState } from "./types";
import { useCustomers, useDeleteCustomer } from "./customer.hooks";
import { freshFilters, filterCustomers, countActiveFilters } from "./utils";

import { columns } from "./components/CustomerColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import CustomerFormModal from "./components/CustomerFormModal";
import ImportExportModal from "@/features/imports/ImportExportModal";

const Customers = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterState>(freshFilters());

    /* Modal state */
    const [modalOpen, setModalOpen] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    /* ── Data ── */
    const { data: customers = [], isLoading, isError } = useCustomers();
    const deleteMutation = useDeleteCustomer();


    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto animate-scaleUp">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load customers</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

    /* ── Row actions ── */
    const handleView   = (c: Customer) => navigate(`/dashboard/customers/${c.id}`);
    const handleEdit   = (c: Customer) => { setCustomerToEdit(c); setModalOpen(true); };
    const handleCreate = ()            => { setCustomerToEdit(null); setModalOpen(true); };

    const handleDelete = (c: Customer) => {
        if (!window.confirm(`Delete "${c.name}"?`)) return;
        deleteMutation.mutate(c.id);
    };

    /* ── Derived data ── */
    const filtered = filterCustomers(customers, search, activeFilters);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search"
                onSearch={setSearch}
                filterCount={countActiveFilters(activeFilters)}
                onFilter={() => setFilterOpen((p) => !p)}
                onExport={() => setExportOpen(true)}
                onImport={() => setImportOpen(true)}
                onCreate={handleCreate}
                createLabel="Create Customer"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                    />
                }
            >
                <DataTable<Customer>
                    columns={columns}
                    data={filtered}
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
                    emptyMessage="No customers found"
                />
            </PageLayout>

            <CustomerFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                customer={customerToEdit}
            />

            <ImportExportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                mode="import"
                entityType="customer"
            />
            <ImportExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                mode="export"
                entityType="customer"
            />
        </>
    );
};

export default Customers;

