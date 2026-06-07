import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import { useCustomers } from "@/features/customers/customer.hooks";
import { useProducts } from "@/features/products/product.hooks";
import { useCreateOrder } from "../order.hooks";
import toast from "react-hot-toast";

interface OrderFormModalProps {
    open: boolean;
    onClose: () => void;
}

interface SelectedItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
    sku?: string;
    imageUrl?: string;
}

/* Icons */
const UserIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const ItemsIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const DetailsIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const OrderFormModal = ({ open, onClose }: OrderFormModalProps) => {
    const createMutation = useCreateOrder();
    const { data: customers = [] } = useCustomers();
    const { data: products = [] } = useProducts();

    const [customerId, setCustomerId] = useState("");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [leadSource, setLeadSource] = useState("Direct Referral");
    const [referringSite, setReferringSite] = useState("");
    const [notes, setNotes] = useState("");
    const [discount, setDiscount] = useState<number>(0);

    useEffect(() => {
        if (open) {
            setCustomerId("");
            setSelectedItems([]);
            setLeadSource("Direct Referral");
            setReferringSite("");
            setNotes("");
            setDiscount(0);
        }
    }, [open]);

    // Subtotal calculation
    const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxRate = 0.085; // 8.5%
    const tax = Math.max(0, subtotal - discount) * taxRate;
    const grandTotal = Math.max(0, subtotal - discount + tax);

    const handleAddProduct = () => {
        if (products.length === 0) {
            toast.error("No products available to add");
            return;
        }
        const defaultProd = products[0];
        const exists = selectedItems.find((item) => item.productId === defaultProd.id);
        if (exists) {
            toast.error("Product already added. Increase quantity instead.");
            return;
        }

        setSelectedItems([
            ...selectedItems,
            {
                productId: defaultProd.id,
                quantity: 1,
                price: Number(defaultProd.price || 0),
                name: defaultProd.name,
                sku: defaultProd.sku,
                imageUrl: defaultProd.imageUrl || defaultProd.image,
            },
        ]);
    };

    const handleProductChange = (index: number, prodId: string) => {
        const prod = products.find((p) => p.id === prodId);
        if (!prod) return;

        const exists = selectedItems.find((item, idx) => item.productId === prodId && idx !== index);
        if (exists) {
            toast.error("Product already added in another row.");
            return;
        }

        const updated = [...selectedItems];
        updated[index] = {
            productId: prod.id,
            quantity: updated[index].quantity,
            price: Number(prod.price || 0),
            name: prod.name,
            sku: prod.sku,
            imageUrl: prod.imageUrl || prod.image,
        };
        setSelectedItems(updated);
    };

    const handleQtyChange = (index: number, val: number) => {
        const updated = [...selectedItems];
        const newQty = Math.max(1, updated[index].quantity + val);
        updated[index].quantity = newQty;
        setSelectedItems(updated);
    };

    const handleRemoveItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (!customerId) {
            toast.error("Please select a customer");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Please add at least one product");
            return;
        }

        const payload = {
            customerId,
            shippingStatus: "processing",
            paymentStatus: "pending",
            subtotal: subtotal.toFixed(2),
            discountAmount: discount.toFixed(2),
            taxAmount: tax.toFixed(2),
            shippingAmount: "0.00",
            totalAmount: grandTotal.toFixed(2),
            currency: "USD",
            source: "Web Store",
            note: notes,
            items: selectedItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price.toFixed(2),
            })),
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create New Order"
            subtitle="Configure customer details and products for a new transaction."
            onSubmit={handleSubmit}
            submitLabel="Create"
            loading={createMutation.isPending}
            width="max-w-[853px]"
        >
            {/* ── Customer Information ── */}
            <FormCard title="Customer Information" icon={<UserIcon />}>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <FormField label="Customer Name" required>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className={selectClasses}
                                required
                            >
                                <option value="">Select or write name</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.email})
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <button
                        type="button"
                        onClick={() => toast.success("Redirecting to create customer...")}
                        className="h-[44px] px-4 rounded-lg border border-dashed border-blue-200 text-blue-500 bg-blue-50/50 hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0"
                    >
                        <span>+</span> New Customer
                    </button>
                </div>
            </FormCard>

            {/* ── Order Items ── */}
            <FormCard
                title="Order Items"
                icon={<ItemsIcon />}
                children={
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
                            >
                                + Add Product
                            </button>
                        </div>

                        {selectedItems.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-gray-100 rounded-xl bg-gray-50/30">
                                <p className="text-xs text-gray-400 font-medium">No products added. Click "+ Add Product" to add products.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 bg-gray-50/50 border border-gray-100 p-3 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>📦</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleProductChange(index, e.target.value)}
                                                className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none border-none p-0 focus:ring-0 cursor-pointer"
                                            >
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{item.sku || "No SKU"} / ${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 border border-gray-200 bg-white rounded-lg px-2 py-1 shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(index, -1)}
                                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 font-semibold text-sm focus:outline-none"
                                            >
                                                -
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold text-gray-800">
                                                {item.quantity.toString().padStart(2, "0")}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleQtyChange(index, 1)}
                                                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 font-semibold text-sm focus:outline-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-right min-w-[70px]">
                                            <span className="text-sm font-bold text-gray-800">
                                                ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                }
            />

            {/* ── Additional Details & Summary ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Additional Details */}
                <FormCard title="Additional Details" icon={<DetailsIcon />}>
                    <FormField label="Lead Source">
                        <select
                            value={leadSource}
                            onChange={(e) => setLeadSource(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="Direct Referral">Direct Referral</option>
                            <option value="Google Search">Google Search</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Email Campaign">Email Campaign</option>
                        </select>
                    </FormField>
                    <FormField label="Referring Site">
                        <input
                            type="text"
                            value={referringSite}
                            onChange={(e) => setReferringSite(e.target.value)}
                            placeholder="linkedin.com/sales-gen"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Order Notes">
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add instruction"
                            rows={3}
                            className={`${inputClasses} h-[90px] py-2 resize-none`}
                        />
                    </FormField>
                </FormCard>

                {/* Summary Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between gap-6 shadow-sm">
                    <div className="space-y-4">
                        <h3 className="text-[15px] font-semibold text-gray-900 pb-2 border-b border-gray-100">Order Summary</h3>
                        <div className="space-y-3 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-700">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <span>Discount</span>
                                <input
                                    type="number"
                                    value={discount || ""}
                                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value || 0)))}
                                    placeholder="0.00"
                                    className="w-20 h-[30px] px-2 rounded-lg border border-gray-200 bg-white text-right text-xs font-semibold text-gray-700 outline-none focus:border-blue-400 transition-all"
                                />
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (8.5%)</span>
                                <span className="font-semibold text-gray-700">${tax.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">GRAND TOTAL</span>
                                <p className="text-2xl font-black text-gray-900 mt-0.5">${grandTotal.toFixed(2)}</p>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 uppercase">
                                USD
                            </span>
                        </div>
                        <div className="bg-blue-500 text-white rounded-xl p-3 flex items-center justify-between text-xs font-semibold mt-1">
                            <span>Need Help?</span>
                            <span className="underline cursor-pointer">Docs →</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default OrderFormModal;
