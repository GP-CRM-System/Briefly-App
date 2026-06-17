import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProduct, useProducts, useDeleteProduct } from "../product.hooks";
import { useProductRecommendations } from "@/features/ai/ai.hooks";
import ProductFormModal from "./ProductFormModal";

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
    const { data: allProducts = [] } = useProducts();
    const { data: recommendations } = useProductRecommendations(id ?? "");
    const deleteMutation = useDeleteProduct();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());

    // Resolve recommended product IDs to full product objects (must be before any early returns)
    const recommendedProducts = useMemo(() => {
        if (!recommendations?.recommendations) return [];
        const raw = (recommendations.recommendations as unknown) as Array<Record<string, unknown>>;
        if (!Array.isArray(raw) || raw.length === 0) return [];
        const productMap = new Map(allProducts.map((p) => [p.id, p]));
        return raw
            .map((r) => ({
                itemId: String(r.itemId ?? r.item_id ?? ""),
                similarity: Number(r.similarity ?? 0),
            }))
            .filter((r) => r.itemId && r.itemId !== id) // exclude self
            .slice(0, 6) // limit to 6
            .map((r) => ({
                ...r,
                product: productMap.get(r.itemId) ?? null,
            }));
    }, [recommendations, allProducts, id]);

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

    const imageUrl = p.imageUrl || p.image || (p.images && p.images[0]) || "";
    const stock = p.inventory ?? 0;
    const displayCategory = p.category || "—";
    const weight = p.weight != null ? `${Number(p.weight).toFixed(1)} ${p.weightUnit || ""}` : "—";
    const orderItems = p.orderItems ?? [];
    const variants = p.variants ?? [];

    const toggleVariant = (vId: string) => {
        const next = new Set(selectedVariants);
        if (next.has(vId)) next.delete(vId);
        else next.add(vId);
        setSelectedVariants(next);
    };

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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                            p.status === "active" ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
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
                {/* Left Column: Image Card */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-between min-h-[440px]">
                        <div className="relative w-full aspect-[4/3] rounded-2xl bg-gray-50/60 border border-blue-500/10 flex items-center justify-center p-6 overflow-hidden group">
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
                        </div>

                        {/* Thumbnail strip */}
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

                {/* Right Column: Overview and Classification */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Product Overview Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-full min-h-[220px]">
                        <div className="space-y-3">
                            <h3 className="text-base font-bold text-gray-900">Product Overview</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                {p.description || "No description available."}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-5 mt-6">
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Price</p>
                                <p className="text-lg font-black text-gray-900 mt-1">{fmtCurrency(p.price)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SKU</p>
                                <p className="text-sm font-bold text-gray-800 mt-1.5 font-mono truncate">{p.sku || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Inventory</p>
                                <p className="text-sm font-bold text-gray-800 mt-1.5">{stock} in stock</p>
                            </div>
                        </div>
                    </div>

                    {/* Classification Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M12 8v8" />
                                        <path d="M8 12h8" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Barcode</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5 font-mono">{p.barcode || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <path d="M16 10a4 4 0 01-8 0" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Weight</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{weight}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5 capitalize">{p.status || "active"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Product Variants Card ── */}
            {variants.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                            <p className="text-xs text-gray-400 font-semibold">Manage different options like size or color</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="p-4 w-12 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedVariants.size === variants.length && variants.length > 0}
                                            onChange={toggleAllVariants}
                                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4 text-center">Inventory</th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Price</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {variants.map((v: any) => {
                                    const isSelected = selectedVariants.has(v.id);
                                    return (
                                        <tr
                                            key={v.id}
                                            className={`hover:bg-gray-50/50 transition-colors text-xs font-semibold text-gray-700 ${isSelected ? "bg-blue-50/20" : ""}`}
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
                                            <td className="p-4 text-center font-bold text-gray-800">{v.inventory ?? "—"}</td>
                                            <td className="p-4 font-mono text-[11px] text-gray-500 font-medium">{v.sku || "—"}</td>
                                            <td className="p-4 text-gray-900 font-bold">{fmtCurrency(v.price)}</td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize border ${v.status === "active" ? "bg-green-50 text-green-600 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                                                    {v.status || "active"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Recent Orders Card ── */}
            {orderItems.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                        <p className="text-xs text-gray-400 font-semibold">Orders containing this product ({orderItems.length})</p>
                    </div>

                    <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                    <th className="p-4">Order ID</th>
                                    <th className="p-4 text-center">Quantity</th>
                                    <th className="p-4 text-right">Price</th>
                                    <th className="p-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orderItems.slice(0, 10).map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors text-xs font-semibold text-gray-700 cursor-pointer"
                                        onClick={() => navigate(`/dashboard/orders/${item.orderId}`)}
                                    >
                                        <td className="p-4 text-blue-600 font-bold">#{item.orderId}</td>
                                        <td className="p-4 text-center font-bold text-gray-800">{item.quantity}</td>
                                        <td className="p-4 text-right text-gray-900 font-bold">{fmtCurrency(item.price)}</td>
                                        <td className="p-4 text-gray-500 font-medium">{fmtDateText(item.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Frequently Bought Together ── */}
            {recommendedProducts.length > 0 && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Frequently Bought Together</h3>
                            <p className="text-xs text-gray-400 font-semibold">Customers who bought this also purchased</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recommendedProducts.map((rec) => {
                            const prod = rec.product;
                            const img = prod?.imageUrl || prod?.image || (prod?.images && prod.images[0]) || "";
                            const similarityPct = Math.round(rec.similarity * 100);
                            return (
                                <div
                                    key={rec.itemId}
                                    onClick={() => navigate(`/dashboard/products/${rec.itemId}`)}
                                    className="group relative bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                                >
                                    {/* Similarity badge */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-600 border border-purple-200">
                                            {similarityPct}% match
                                        </span>
                                    </div>

                                    {/* Image */}
                                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                                        {img ? (
                                            <img
                                                src={img}
                                                alt={prod?.name || "Product"}
                                                className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <p className="text-xs font-bold text-gray-800 truncate">{prod?.name || "Unknown Product"}</p>
                                        <p className="text-sm font-black text-gray-900 mt-1">{prod ? fmtCurrency(prod.price) : "—"}</p>
                                        {prod?.category && (
                                            <p className="text-[10px] text-gray-400 font-semibold mt-1 truncate">{prod.category}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {recommendations && recommendations.recommendations.length === 0 && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm p-8">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </div>
                        <p className="text-sm font-semibold text-gray-500">No co-purchase data yet</p>
                        <p className="text-xs text-gray-400">Recommendations will appear once customers purchase multiple products together.</p>
                    </div>
                </div>
            )}

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

