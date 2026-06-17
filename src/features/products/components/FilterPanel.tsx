import { useState, useEffect } from "react";
import type { ProductFilterState } from "../types";
import { freshProductFilters, CATEGORY_OPTIONS, STATUS_OPTIONS } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: ProductFilterState) => void;
}

const FilterPanel = ({ open, onClose, onApply }: FilterPanelProps) => {
    const [local, setLocal] = useState<ProductFilterState>(freshProductFilters());

    useEffect(() => {
        if (open) setLocal(freshProductFilters());
    }, [open]);

    if (!open) return null;

    const toggleCategory = (cat: string) => {
        setLocal((prev) => {
            const next = new Set(prev.categories);
            if (next.has(cat)) { next.delete(cat); } else { next.add(cat); }
            return { ...prev, categories: next };
        });
    };

    const toggleStatus = (st: string) => {
        setLocal((prev) => {
            const next = new Set(prev.statuses);
            if (next.has(st)) { next.delete(st); } else { next.add(st); }
            return { ...prev, statuses: next };
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px]" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-[340px] max-w-full rounded-2xl shadow-2xl bg-white border border-gray-100 p-5 space-y-5 z-10" style={{ animation: "modalSlideIn 0.2s ease-out" }}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                    <button
                        onClick={() => { setLocal(freshProductFilters()); }}
                        className="text-xs text-[var(--color-primary-500)] hover:underline font-medium"
                    >
                        Reset All
                    </button>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Product Name</label>
                    <input
                        type="text"
                        value={local.name}
                        onChange={(e) => setLocal((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Search by name…"
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all"
                    />
                </div>

                {/* Price range */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Price Range: ${local.priceMin} — ${local.priceMax.toLocaleString()}
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={local.priceMin}
                            min={0}
                            onChange={(e) => setLocal((p) => ({ ...p, priceMin: Number(e.target.value) }))}
                            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[var(--color-primary-400)] transition-all"
                            placeholder="Min"
                        />
                        <span className="text-gray-300">—</span>
                        <input
                            type="number"
                            value={local.priceMax}
                            min={0}
                            onChange={(e) => setLocal((p) => ({ ...p, priceMax: Number(e.target.value) }))}
                            className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[var(--color-primary-400)] transition-all"
                            placeholder="Max"
                        />
                    </div>
                </div>

                {/* Category checkboxes */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => toggleCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    local.categories.has(cat)
                                        ? "bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)]"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status checkboxes */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((st) => (
                            <button
                                key={st}
                                onClick={() => toggleStatus(st.toLowerCase())}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    local.statuses.has(st.toLowerCase())
                                        ? "bg-[var(--color-primary-500)] text-white border-[var(--color-primary-500)]"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex-1 h-9 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onApply(local); onClose(); }}
                        className="flex-1 h-9 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-all"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FilterPanel;
