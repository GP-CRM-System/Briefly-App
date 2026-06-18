import { useState, useMemo, useEffect, type ReactNode } from "react";
import { PackageIcon, ClipboardIcon } from "hugeicons-react";
import { useAiProducts, useProductRecommendations } from "../ai.hooks";
import type { AiProduct } from "../ai.service";

/* ══════════════════════════════════════════════════════
   Empty State
   ══════════════════════════════════════════════════════ */
const EmptyState = ({
    icon,
    title,
    subtitle,
}: {
    icon: ReactNode;
    title: string;
    subtitle: string;
}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="mb-4 text-gray-300">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-xs">{subtitle}</p>
    </div>
);

/* ══════════════════════════════════════════════════════
   Similar Item Card
   ══════════════════════════════════════════════════════ */
const SimilarCard = ({
    name,
    similarity,
    price,
    imageUrl,
}: {
    name: string;
    similarity: number;
    price?: string;
    imageUrl?: string;
}) => (
    <div className="border border-gray-100 rounded-xl p-6 bg-white hover:shadow-lg transition-shadow">
        <div className="flex gap-5">
            {imageUrl && (
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-1.5">
                    <span className="text-sm font-semibold text-gray-900 leading-snug">{name}</span>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700">
                            {(similarity * 100).toFixed(1)}%
                        </span>
                        {price && (
                            <span className="text-sm font-semibold text-gray-800">
                                ${price}
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-4 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                        className="bg-[var(--color-primary-500)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${similarity * 100}%` }}
                    />
                </div>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════ */
const AiCatalogIntelligence = () => {
    const { data: products = [], isLoading } = useAiProducts();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    const { data: recommendationData } = useProductRecommendations(selectedProductId ?? "");

    /* Group products by category */
    const categories = useMemo(() => {
        const map = new Map<string, AiProduct[]>();
        for (const p of products) {
            const cat = p.category || "Uncategorized";
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(p);
        }
        return Array.from(map.entries())
            .map(([name, items]) => ({ name, items }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    /* Items for the selected category */
    const selectedCategoryItems = useMemo(() => {
        if (!selectedCategory) return [];
        const cat = categories.find((c) => c.name === selectedCategory);
        return cat?.items ?? [];
    }, [categories, selectedCategory]);

    /* Selected product detail */
    const selectedProduct = useMemo(() => {
        if (!selectedProductId) return null;
        return products.find((p) => p.id === selectedProductId) ?? null;
    }, [products, selectedProductId]);

    /* Build a lookup map from products to enrich recommendation cards */
    const productMap = useMemo(() => {
        const map = new Map<string, AiProduct>();
        for (const p of products) {
            map.set(p.id, p);
        }
        return map;
    }, [products]);

    /* Auto-select first category if none selected */
    useEffect(() => {
        if (!selectedCategory && categories.length > 0) {
            setSelectedCategory(categories[0].name);
        }
    }, [selectedCategory, categories]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--color-primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div>
                <h1 className="text-lg font-bold text-gray-900">Product Catalog Intelligence</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    Navigate categories and items to analyze AI-driven cross-sell correlations.
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                    <EmptyState
                        icon={<PackageIcon size={48} />}
                        title="No Products Available"
                        subtitle="Import products or run a data sync to populate the catalog."
                    />
                </div>
            ) : (
                <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px]">
                    {/* ── Pane 1: Categories ── */}
                    <div className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Categories
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => {
                                        setSelectedCategory(cat.name);
                                        setSelectedProductId(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 ${
                                        selectedCategory === cat.name
                                            ? "bg-[var(--color-primary-50)] border-l-3 border-l-[var(--color-primary-500)] text-[var(--color-primary-600)] font-semibold"
                                            : "text-gray-600 hover:bg-gray-50 border-l-3 border-l-transparent"
                                    }`}
                                >
                                    <span className="text-sm">{cat.name}</span>
                                    <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                        {cat.items.length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Pane 2: Items ── */}
                    <div className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {selectedCategory || "Items"}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {selectedCategory ? (
                                selectedCategoryItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedProductId(item.id)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 ${
                                            selectedProductId === item.id
                                                ? "bg-[var(--color-primary-50)] border-l-3 border-l-[var(--color-primary-500)]"
                                                : "text-gray-600 hover:bg-gray-50 border-l-3 border-l-transparent"
                                        }`}
                                    >
                                        <span
                                            className={`text-sm ${
                                                selectedProductId === item.id
                                                    ? "font-semibold text-[var(--color-primary-600)]"
                                                    : "font-medium text-gray-800"
                                            }`}
                                        >
                                            {item.name || item.id}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ${typeof item.price === "number" ? item.price.toFixed(2) : Number(item.price).toFixed(2)}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-400">
                                    Select a category
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Pane 3: Detail Workspace ── */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto p-6">
                        {!selectedProduct ? (
                            <EmptyState
                                icon={<ClipboardIcon size={48} />}
                                title="No Product Selected"
                                subtitle="Select an item from the list to view its AI cross-sell correlations and metadata."
                            />
                        ) : (
                            <div className="space-y-6">
                                {/* Product Detail Card */}
                                <div>
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Selected Product
                                    </div>
                                    <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-5 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <h3 className="text-lg font-bold text-[var(--color-primary-600)]">
                                                {selectedProduct.name || selectedProduct.id}
                                            </h3>
                                            <span className="text-lg font-bold text-gray-900">
                                                ${typeof selectedProduct.price === "number"
                                                    ? selectedProduct.price.toFixed(2)
                                                    : Number(selectedProduct.price).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                                            <span>
                                                <strong className="text-gray-600">Category:</strong>{" "}
                                                {selectedProduct.category || "—"}
                                            </span>
                                            <span>
                                                <strong className="text-gray-600">Status:</strong>{" "}
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        selectedProduct.status === "active"
                                                            ? "bg-green-50 text-green-700"
                                                            : selectedProduct.status === "draft"
                                                              ? "bg-yellow-50 text-yellow-700"
                                                              : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {selectedProduct.status || "—"}
                                                </span>
                                            </span>
                                        </div>
                                        {selectedProduct.description && (
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {selectedProduct.description}
                                            </p>
                                        )}
                                        {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {selectedProduct.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Recommendations */}
                                <div>
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">
                                                Correlated Cross-Sell Recommendations
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Items frequently bought or viewed together based on Item-Based Collaborative Filtering.
                                            </p>
                                        </div>
                                    </div>

                                    {!recommendationData?.recommendations ||
                                    recommendationData.recommendations.length === 0 ? (
                                        <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">
                                            No significant correlations found for this item yet.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            {recommendationData.recommendations.map((sim) => {
                                                const matched = productMap.get(sim.itemId);
                                                return (
                                                    <SimilarCard
                                                        key={sim.itemId}
                                                        name={matched?.name || matched?.id || sim.itemId}
                                                        similarity={sim.similarity}
                                                        price={matched?.price != null ? (typeof matched.price === "number" ? matched.price.toFixed(2) : Number(matched.price).toFixed(2)) : undefined}
                                                        imageUrl={matched?.imageUrl || matched?.image || undefined}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiCatalogIntelligence;
