import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Order, OrderFilterState } from "./types";
import { useOrders, useDeleteOrder } from "./order.hooks";
import { freshOrderFilters, filterOrders, countActiveFilters } from "./utils";

import { columns } from "./components/OrderColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import OrderFormModal from "./components/OrderFormModal";
import ImportExportModal from "@/features/imports/ImportExportModal";

const Orders = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<OrderFilterState>(freshOrderFilters());

    /* Modal state */
    const [modalOpen, setModalOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);

    /* ── Data ── */
    const { data: orders = [], isLoading, isError } = useOrders();
    const deleteMutation = useDeleteOrder();



    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load orders</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

    /* ── Row actions ── */
    const handleView   = (o: Order) => navigate(`/dashboard/orders/${o.id}`);
    const handleDelete = (o: Order) => {
        if (!window.confirm(`Delete Order #${o.id?.replace("ORD-", "")}?`)) return;
        deleteMutation.mutate(o.id);
    };

    /* ── Derived data ── */
    const filtered = filterOrders(orders, search, activeFilters);

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
                onCreate={() => setModalOpen(true)}
                createLabel="Create Order"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                    />
                }
            >
                <DataTable<Order>
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
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="No orders found"
                />
            </PageLayout>

            <OrderFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />

            <ImportExportModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                mode="import"
                entityType="order"
            />
            <ImportExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                mode="export"
                entityType="order"
            />
        </>
    );
};

export default Orders;

