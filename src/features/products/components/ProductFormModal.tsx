import { useState } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import type { Product, ProductFormData } from "../types";
import { useCreateProduct, useUpdateProduct } from "../product.hooks";
import { EMPTY_PRODUCT_FORM, productToFormData, productFormDataToPayload, CATEGORY_OPTIONS, STATUS_OPTIONS } from "../utils";

/* ── Section Icons ── */
const BoxIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const DollarIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const WarehouseIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12H2" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        <line x1="6" y1="16" x2="6.01" y2="16" />
        <line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
);

const TagIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

/* ── Props ── */
interface ProductFormModalProps {
    open: boolean;
    onClose: () => void;
    product?: Product | null;
}

const ProductFormModal = ({ open, onClose, product }: ProductFormModalProps) => {
    const isEditing = !!product;
    const [form, setForm] = useState<ProductFormData>({ ...EMPTY_PRODUCT_FORM });

    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const [prevOpen, setPrevOpen] = useState(open);
    const [prevProduct, setPrevProduct] = useState(product);

    if (open !== prevOpen || product !== prevProduct) {
        setPrevOpen(open);
        setPrevProduct(product);
        if (open) {
            setForm(product ? productToFormData(product) : { ...EMPTY_PRODUCT_FORM });
        }
    }

    const update = (key: keyof ProductFormData, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = () => {
        if (!form.name.trim()) {
            toast.error("Product name is required");
            return;
        }
        if (!form.price || Number(form.price) <= 0) {
            toast.error("Price must be greater than 0");
            return;
        }

        const payload = productFormDataToPayload(form);

        if (isEditing) {
            updateMutation.mutate({ id: product!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Product" : "Create New Product"}
            subtitle={isEditing ? "Update existing product details." : "Add a new product to your catalog."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
        >
            {/* ── Basic Information ── */}
            <FormCard title="Product Details" icon={<BoxIcon />}>
                <FormField label="Product Name" required>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="e.g. Premium Wireless Headphones"
                        className={inputClasses}
                    />
                </FormField>
                <FormField label="Description">
                    <textarea
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        placeholder="Describe this product…"
                        rows={3}
                        className={inputClasses + " resize-none"}
                    />
                </FormField>
                <FormField label="Image URL">
                    <input
                        type="url"
                        value={form.imageUrl || ""}
                        onChange={(e) => update("imageUrl", e.target.value)}
                        placeholder="e.g. https://example.com/image.png"
                        className={inputClasses}
                    />
                </FormField>
                <FormRow>
                    <FormField label="Category">
                        <select
                            value={form.category}
                            onChange={(e) => update("category", e.target.value)}
                            className={selectClasses}
                        >
                            {CATEGORY_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Product Type">
                        <input
                            type="text"
                            value={form.type}
                            onChange={(e) => update("type", e.target.value)}
                            placeholder="e.g. Physical, Digital"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Vendor">
                        <input
                            type="text"
                            value={form.vendor}
                            onChange={(e) => update("vendor", e.target.value)}
                            placeholder="e.g. TechNova"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Brand">
                        <input
                            type="text"
                            value={form.brand}
                            onChange={(e) => update("brand", e.target.value)}
                            placeholder="e.g. NovaTech"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Pricing ── */}
            <FormCard title="Pricing" icon={<DollarIcon />}>
                <FormRow>
                    <FormField label="Price" required>
                        <input
                            type="number"
                            value={form.price}
                            onChange={(e) => update("price", e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Compare-at Price">
                        <input
                            type="number"
                            value={form.compareAtPrice}
                            onChange={(e) => update("compareAtPrice", e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
                <FormField label="Cost Price">
                    <input
                        type="number"
                        value={form.costPrice}
                        onChange={(e) => update("costPrice", e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={inputClasses}
                    />
                </FormField>
            </FormCard>

            {/* ── Inventory ── */}
            <FormCard title="Inventory" icon={<WarehouseIcon />}>
                <FormRow>
                    <FormField label="SKU">
                        <input
                            type="text"
                            value={form.sku}
                            onChange={(e) => update("sku", e.target.value)}
                            placeholder="e.g. SKU-1001"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Barcode">
                        <input
                            type="text"
                            value={form.barcode}
                            onChange={(e) => update("barcode", e.target.value)}
                            placeholder="e.g. 8901234500001"
                            className={inputClasses}
                        />
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Quantity">
                        <input
                            type="number"
                            value={form.quantity}
                            onChange={(e) => update("quantity", e.target.value)}
                            placeholder="0"
                            min="0"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Track Inventory">
                        <select
                            value={form.trackInventory}
                            onChange={(e) => update("trackInventory", e.target.value)}
                            className={selectClasses}
                        >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </FormField>
                </FormRow>
                <FormRow>
                    <FormField label="Weight">
                        <input
                            type="number"
                            value={form.weight}
                            onChange={(e) => update("weight", e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.01"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Weight Unit">
                        <select
                            value={form.weightUnit}
                            onChange={(e) => update("weightUnit", e.target.value)}
                            className={selectClasses}
                        >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="g">Grams (g)</option>
                            <option value="lb">Pounds (lb)</option>
                            <option value="oz">Ounces (oz)</option>
                        </select>
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Status ── */}
            <FormCard title="Status & Organization" icon={<TagIcon />}>
                <FormField label="Status">
                    <select
                        value={form.status}
                        onChange={(e) => update("status", e.target.value)}
                        className={selectClasses}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.toLowerCase()} value={s.toLowerCase()}>{s}</option>
                        ))}
                    </select>
                </FormField>
            </FormCard>
        </Modal>
    );
};

export default ProductFormModal;
