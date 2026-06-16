import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Order, OrderFilterState } from "./types";
import { useOrders, useDeleteOrder } from "./order.hooks";
import { freshOrderFilters, filterOrders, countActiveFilters, MOCK_ORDERS } from "./utils";

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
    const { data: orders = MOCK_ORDERS, isLoading } = useOrders();
    const deleteMutation = useDeleteOrder();

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
