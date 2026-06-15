import { useState } from "react";
import type { TicketFilterState } from "../types";
import { freshTicketFilters } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: TicketFilterState) => void;
}

const FilterPanel = ({ open, onClose, onApply }: FilterPanelProps) => {
    const [status, setStatus] = useState<Set<string>>(new Set());
    const [priority, setPriority] = useState<Set<string>>(new Set());

    if (!open) return null;

    const handleApply = () => {
        onApply({
            status,
            priority,
            search: "",
        });
        onClose();
    };

    const handleReset = () => {
        setStatus(new Set());
        setPriority(new Set());
        onApply(freshTicketFilters());
        onClose();
    };

    const toggleStatus = (st: string) => {
        const next = new Set(status);
        if (next.has(st)) next.delete(st);
        else next.add(st);
        setStatus(next);
    };

    const togglePriority = (pr: string) => {
        const next = new Set(priority);
        if (next.has(pr)) next.delete(pr);
        else next.add(pr);
        setPriority(next);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px]" onClick={onClose} />

            {/* Dialog */}
            <div className="relative w-80 max-w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl z-10 flex flex-col gap-4" style={{ animation: "modalSlideIn 0.2s ease-out" }}>
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                        {["open", "pending", "resolved", "closed"].map((st) => {
                            const isSelected = status.has(st);
                            return (
                                <button
                                    key={st}
                                    onClick={() => toggleStatus(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                                        isSelected
                                            ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {st}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</h4>
                    <div className="flex flex-wrap gap-2">
                        {["low", "medium", "high"].map((pr) => {
                            const isSelected = priority.has(pr);
                            return (
                                <button
                                    key={pr}
                                    onClick={() => togglePriority(pr)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                                        isSelected
                                            ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {pr}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    <button
                        onClick={handleReset}
                        className="flex-1 h-[36px] rounded-lg border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 h-[36px] rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] transition-all shadow-sm"
                    >
                        Apply Filters
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
