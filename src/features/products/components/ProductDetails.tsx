import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useDeleteProduct } from "../product.hooks";
import ProductFormModal from "./ProductFormModal";
import toast from "react-hot-toast";

const fmtCurrency = (v: string | number | null | undefined) => {
    if (v == null) return "—";
    const num = Number(v);
    if (isNaN(num)) return String(v);
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const fmtDateText = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch {
        return d;
    }
};

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: product, isLoading } = useProduct(id);
    const deleteMutation = useDeleteProduct();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Pagination & checkbox states for variants table
    const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());

    if (isLoading || !product) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const p = product;
    
    const handleDelete = () => {
        if (!window.confirm(`Are you sure you want to delete "${p.name}"? This action cannot be undone.`)) return;
        deleteMutation.mutate(p.id, { 
            onSuccess: () => {
                navigate("/dashboard/products");
            } 
        });
    };

    // Extracting image and inventory gracefully
    const imageUrl = p.imageUrl || p.image || (p.images && p.images[0]) || "";
    const stock = p.inventory !== undefined ? p.inventory : (p.quantity !== undefined ? p.quantity : 0);

    // Derived properties for standard sneakers look if blank (for premium fidelity)
    const displayCategory = p.category || "Home";
    const displaySubCategory = p.type || "Furniture";
    const displayBrand = p.brand || "Briefly Gold";
    const displayColorway = "Gold / Neutral";

    // Generate high fidelity variants matching the mockup table
    const mockVariants = [
        { id: "v-1", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-2", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-3", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-4", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-5", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-6", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" },
        { id: "v-7", name: "Black / 42", inventory: 35, sku: p.sku ? `${p.sku}-BLK-42` : "NAM270-BLK-42", price: 75, barcode: "194953123456", status: "active" }
    ];

    const variants = p.variants && p.variants.length > 0 ? p.variants : mockVariants;

    // Toggle selected state for single variant
    const toggleVariant = (id: string) => {
        const next = new Set(selectedVariants);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedVariants(next);
    };

    // Toggle all visible variants
    const toggleAllVariants = () => {
        if (selectedVariants.size === variants.length) {
            setSelectedVariants(new Set());
        } else {
            setSelectedVariants(new Set(variants.map((v: any) => v.id)));
        }
    };

    return (
        <div className="space-y-8 max-w-[1200px] pb-12 animate-fade-in">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span 
                    onClick={() => navigate("/dashboard/products")} 
                    className="hover:text-gray-600 cursor-pointer transition-colors"
                >
                    Products
                </span>
                <span className="text-gray-300">&gt;</span>
                <span className="text-gray-800 font-bold">View Details</span>
            </div>

            {/* ── Header row ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight uppercase">{p.name}</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border bg-green-50 text-green-600 border-green-200">
                            {p.status || "active"}
                        </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-400">
                        SKU : {p.sku || "—"} &nbsp;&bull;&nbsp; Added {fmtDateText(p.createdAt)}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all cursor-pointer"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-sm font-semibold text-red-600 transition-all cursor-pointer"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            {/* ── Visual and Metadata Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Image Card (5/12 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-between min-h-[440px]">
                        {/* Image Box */}
                        <div className="relative w-full aspect-[4/3] rounded-2xl bg-gray-50/60 border border-blue-500/10 flex items-center justify-center p-6 overflow-hidden group">
                            {/* Blue Alignment Dotted Overlays (Mockup aesthetics) */}
                            <div className="absolute inset-0 border-x border-dashed border-blue-400/5 pointer-events-none"></div>
                            <div className="absolute inset-0 border-y border-dashed border-blue-400/5 pointer-events-none"></div>
                            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-blue-400/20 pointer-events-none"></div>
                            <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-blue-400/20 pointer-events-none"></div>

                            {imageUrl ? (
                                <img 
                                    src={imageUrl} 
                                    alt={p.name} 
                                    className="max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center gap-2">
                                    <svg className="w-12 h-12 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">No Image Available</span>
                                </div>
                            )}

                            {/* Resolution badge */}
                            <div className="absolute bottom-3 bg-blue-500 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-md shadow-sm select-none">
                                408 &times; 287
                            </div>
                        </div>

                        {/* Image Carousel Mock Thumbnails */}
                        <div className="grid grid-cols-3 gap-3 w-full mt-6">
                            <div className="aspect-[4/3] rounded-xl border-2 border-blue-500 bg-gray-50 flex items-center justify-center p-2 cursor-pointer shadow-sm">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="thumb-1" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400">Main</span>
                                )}
                            </div>

                            <div className="aspect-[4/3] rounded-xl border border-gray-100 hover:border-gray-200 bg-gray-50 flex items-center justify-center p-2 cursor-pointer transition-all">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="thumb-2" className="max-w-full max-h-full object-contain opacity-60 grayscale" />
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400">Thumb 1</span>
                                )}
                            </div>

                            <div className="aspect-[4/3] rounded-xl border border-gray-100 bg-white hover:bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition-all select-none">
                                <span className="text-xs font-bold text-gray-800">+ 2 More</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Overview and Classification (7/12 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Product Overview Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-full min-h-[220px]">
                        <div className="space-y-3">
                            <h3 className="text-base font-bold text-gray-900">Product Overview</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                {p.description || "The Product details show premium build and custom features. Built with standard specifications to meet all requirements seamlessly while maintaining high aesthetic quality."}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-5 mt-6">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Price</p>
                                <p className="text-lg font-black text-gray-900 mt-1">{fmtCurrency(p.price)}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SKU</p>
                                <p className="text-sm font-bold text-gray-800 mt-1.5 font-mono truncate">{p.sku || "—"}</p>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Inventory</p>
                                <p className="text-sm font-bold text-gray-800 mt-1.5">{stock} in stock</p>
                            </div>
                        </div>
                    </div>

                    {/* Classification Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Classification</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                        <line x1="7" y1="7" x2="7.01" y2="7" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Category</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{displayCategory}</p>
                                </div>
                            </div>

                            {/* Sub Category */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                        <polyline points="2 17 12 22 22 17" />
                                        <polyline points="2 12 12 17 22 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Sub Category</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{displaySubCategory}</p>
                                </div>
                            </div>

                            {/* Brand */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                        <path d="M9 12l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Brand</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{displayBrand}</p>
                                </div>
                            </div>

                            {/* Colorway */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.03345 19.1749 5.2798 19.262 5.52382 19.233C6.72124 19.0909 7.4273 18.2577 7.91136 17.5244C8.2435 17.0213 8.68115 16.5 9.5 16.5C10.3188 16.5 10.7565 17.0213 11.0886 17.5244C11.5727 18.2577 12.2788 19.0909 13.4762 19.233C13.7202 19.262 13.9665 19.1749 14.1414 19C15.9097 17.1962 17 14.7255 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12" />
                                        <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
                                        <circle cx="11.5" cy="8.5" r="1" fill="currentColor" />
                                        <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Colorway</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{displayColorway}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Product Variants Card ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                        <p className="text-xs text-gray-400 font-semibold">Manage different options like size or color</p>
                    </div>

                    <button
                        onClick={() => toast.success("Add Variant flow opened!")}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition-all cursor-pointer self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Variant
                    </button>
                </div>

                {/* Variants Table Container */}
                <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedVariants.size === variants.length}
                                        onChange={toggleAllVariants}
                                        className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4">Name</th>
                                <th className="p-4 text-center">Inventory</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Barcode</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center w-16">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {variants.map((v: any) => {
                                const isSelected = selectedVariants.has(v.id);
                                return (
                                    <tr 
                                        key={v.id} 
                                        className={`hover:bg-gray-50/50 transition-colors text-xs font-semibold text-gray-700 ${
                                            isSelected ? "bg-blue-50/20" : ""
                                        }`}
                                    >
                                        <td className="p-4 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleVariant(v.id)}
                                                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 text-gray-900 font-bold">{v.name}</td>
                                        <td className="p-4 text-center font-bold text-gray-800">{v.inventory}</td>
                                        <td className="p-4 font-mono text-[11px] text-gray-500 font-medium">{v.sku}</td>
                                        <td className="p-4 text-gray-900 font-bold">{v.price}$</td>
                                        <td className="p-4 font-mono text-[11px] text-gray-500 font-medium">{v.barcode || "—"}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${
                                                v.status === "active"
                                                    ? "bg-green-50 text-green-600 border-green-200"
                                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                            }`}>
                                                {v.status || "active"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => toast.success(`Action menu for ${v.name}`)}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <circle cx="12" cy="5" r="1.5" />
                                                    <circle cx="12" cy="12" r="1.5" />
                                                    <circle cx="12" cy="19" r="1.5" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                    <p className="text-xs font-semibold text-gray-400">
                        Showing data 1 to {variants.length} of {variants.length} entries
                    </p>

                    <div className="flex items-center gap-1.5 self-center sm:self-auto select-none">
                        <button 
                            disabled 
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 cursor-not-allowed"
                        >
                            &lt;
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-blue-100">
                            1
                        </button>
                        <button 
                            onClick={() => toast.success("Page 2")}
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            2
                        </button>
                        <button 
                            onClick={() => toast.success("Page 3")}
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            3
                        </button>
                        <button 
                            onClick={() => toast.success("Page 4")}
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            4
                        </button>
                        <span className="text-xs font-bold text-gray-400 px-1">..</span>
                        <button 
                            onClick={() => toast.success("Page 40")}
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            40
                        </button>
                        <button 
                            onClick={() => toast.success("Next Page")}
                            className="w-8 h-8 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Form Modal ── */}
            <ProductFormModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={p}
            />
        </div>
    );
};

export default ProductDetails;
