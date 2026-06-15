import { useState, useRef, useEffect } from "react";
import type { FilterState } from "../types";
import { freshFilters, LIFECYCLE_OPTIONS } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
}

const FilterPanel = ({
    open,
    onClose,
    onApply,
}: FilterPanelProps) => {
    const [filters, setFilters] = useState<FilterState>(freshFilters());
    const [searchField, setSearchField] = useState("");
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ name: false, orders: true, spent: false, lifecycle: false });
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, onClose]);

    const toggleLifecycle = (lc: string) => {
        setFilters((prev) => {
            const next = new Set(prev.lifecycles);
            if (next.has(lc)) next.delete(lc);
            else next.add(lc);
            return { ...prev, lifecycles: next };
        });
    };

    const resetFilters = () => setFilters(freshFilters());

    const toggleSection = (key: string) =>
        setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

    if (!open) return null;

    const filteredSections = ["name", "orders", "spent", "lifecycle"].filter((s) =>
        !searchField || s.toLowerCase().includes(searchField.toLowerCase()) ||
        (s === "name" && "customer name".includes(searchField.toLowerCase())) ||
        (s === "spent" && "total spent".includes(searchField.toLowerCase())) ||
        (s === "lifecycle" && "lifecycle stage".includes(searchField.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px]" onClick={onClose} />

            {/* Dialog container */}
            <div ref={panelRef} className="relative w-80 max-w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-10 overflow-hidden" style={{ animation: "modalSlideIn 0.2s ease-out" }}>
                {/* Search filter fields */}
                <div className="px-4 pt-4 pb-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            placeholder="Search filter fields..."
                            className="w-full h-[36px] pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-1 focus:ring-[var(--color-primary-100)] transition-all"
                        />
                    </div>
                </div>

                <div className="max-h-[340px] overflow-y-auto px-4 pb-2 custom-modal-scroll">
                    {/* Customer Name */}
                    {filteredSections.includes("name") && (
                        <div className="mb-3">
                            <button onClick={() => toggleSection("name")} className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-800">
                                Customer Name
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${collapsed.name ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                            {!collapsed.name && (
                                <input
                                    type="text"
                                    value={filters.name}
                                    onChange={(e) => setFilters((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Menna Fathy"
                                    className="w-full h-[36px] px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] transition-all"
                                />
                            )}
                        </div>
                    )}

                    {/* Orders */}
                    {filteredSections.includes("orders") && (
                        <div className="mb-3">
                            <button onClick={() => toggleSection("orders")} className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-800">
                                Orders
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${collapsed.orders ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                        </div>
                    )}

                    {/* Total Spent Range */}
                    {filteredSections.includes("spent") && (
                        <div className="mb-3">
                            <button onClick={() => toggleSection("spent")} className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-800">
                                Total Spent
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${collapsed.spent ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                            {!collapsed.spent && (
                                <div className="pt-1 pb-2">
                                    <input
                                        type="range"
                                        min={0}
                                        max={50000}
                                        step={500}
                                        value={filters.spentMax}
                                        onChange={(e) => setFilters((p) => ({ ...p, spentMax: Number(e.target.value) }))}
                                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-primary-500)] bg-gray-200"
                                    />
                                    <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                                        <span>${filters.spentMin.toLocaleString()}</span>
                                        <span>${filters.spentMax >= 50000 ? "$50,000+" : `$${filters.spentMax.toLocaleString()}`}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lifecycle Stage Checkboxes */}
                    {filteredSections.includes("lifecycle") && (
                        <div className="mb-2">
                            <button onClick={() => toggleSection("lifecycle")} className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-800">
                                Lifecycle Stage
                                <svg className={`h-4 w-4 text-gray-400 transition-transform ${collapsed.lifecycle ? "" : "rotate-180"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                            </button>
                            {!collapsed.lifecycle && (
                                <div className="space-y-2 pt-1">
                                    {LIFECYCLE_OPTIONS.map((lc) => (
                                        <label key={lc} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={filters.lifecycles.has(lc)}
                                                onChange={() => toggleLifecycle(lc)}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-300)] accent-[var(--color-primary-500)] cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{lc}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                    <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        Reset
                    </button>
                    <button
                        onClick={() => {
                            onApply(filters);
                            onClose();
                        }}
                        className="h-[34px] px-5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-all"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            <style>{`
                .custom-modal-scroll::-webkit-scrollbar { width: 4px; }
                .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-modal-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FilterPanel;
