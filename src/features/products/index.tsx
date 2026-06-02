import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Product, ProductFilterState } from "./types";
import { useProducts, useDeleteProduct } from "./product.hooks";
import { freshProductFilters, filterProducts, countActiveProductFilters, MOCK_PRODUCTS } from "./utils";

import { columns } from "./components/ProductColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import ProductFormModal from "./components/ProductFormModal";

const Products = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<ProductFilterState>(freshProductFilters());

    /* Modal state */
    const [modalOpen, setModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    /* ── Data ── */
    const { data: products = MOCK_PRODUCTS, isLoading } = useProducts();
    const deleteMutation = useDeleteProduct();

    /* ── Row actions ── */
    const handleView   = (p: Product) => navigate(`/dashboard/products/${p.id}`);
    const handleEdit   = (p: Product) => { setProductToEdit(p); setModalOpen(true); };
    const handleCreate = ()           => { setProductToEdit(null); setModalOpen(true); };

    const handleDelete = (p: Product) => {
        if (!window.confirm(`Delete "${p.name}"?`)) return;
        deleteMutation.mutate(p.id);
    };

    /* ── Derived data ── */
    const filtered = filterProducts(products, search, activeFilters);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search products…"
                onSearch={setSearch}
                filterCount={countActiveProductFilters(activeFilters)}
                onFilter={() => setFilterOpen((p) => !p)}
                onExport={() => {}}
                onImport={() => {}}
                onCreate={handleCreate}
                createLabel="Create Product"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                    />
                }
            >
                <DataTable<Product>
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
                    emptyMessage="No products found"
                />
            </PageLayout>

            <ProductFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                product={productToEdit}
            />
        </>
    );
};

export default Products;
