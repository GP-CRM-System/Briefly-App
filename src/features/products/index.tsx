import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Product, ProductFilterState } from "./types";
import { useProducts, useDeleteProduct } from "./product.hooks";
import { useCreateImport } from "@/features/settings/settings.hooks";
import { freshProductFilters, filterProducts, countActiveProductFilters } from "./utils";

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
    const { data: products = [], isLoading, isError } = useProducts();
    const deleteMutation = useDeleteProduct();
    const createImportMutation = useCreateImport();

    const handleExport = () => {
        if (!filtered.length) {
            toast.error("No products to export");
            return;
        }
        
        const csvData = filtered.map(p => ({
            ID: p.id,
            Name: p.name,
            SKU: p.sku || "",
            Price: p.price || 0,
            Stock: p.quantity ?? 0,
            Status: p.status || "",
            CreatedAt: p.createdAt
        }));

        const headers = Object.keys(csvData[0]);
        const csvRows = [
            headers.join(","),
            ...csvData.map(row =>
                headers.map(h => {
                    const val = row[h as keyof typeof row];
                    const escaped = ('' + (val ?? '')).replace(/"/g, '""');
                    return `"${escaped}"`;
                }).join(",")
            )
        ];

        const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Products exported successfully!");
    };

    const handleImport = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".csv";
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                createImportMutation.mutate({ file, entityType: "product" }, {
                    onSuccess: () => {
                        toast.success("Products import job created! You can check progress in Settings -> Imports & Exports.");
                    }
                });
            }
        };
        input.click();
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto animate-scaleUp">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load products</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

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
                onExport={handleExport}
                onImport={handleImport}
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
