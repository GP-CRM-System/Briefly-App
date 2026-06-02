import { useState } from "react";
import type { EmployeeFilterState } from "../types";
import { freshEmployeeFilters } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: EmployeeFilterState) => void;
}

const FilterPanel = ({ open, onClose, onApply }: FilterPanelProps) => {
    const [roles, setRoles] = useState<Set<string>>(new Set());
    const [statuses, setStatuses] = useState<Set<string>>(new Set());

    if (!open) return null;

    const handleApply = () => {
        onApply({
            role: roles,
            status: statuses,
            search: "",
        });
        onClose();
    };

    const handleReset = () => {
        setRoles(new Set());
        setStatuses(new Set());
        onApply(freshEmployeeFilters());
        onClose();
    };

    const toggleRole = (role: string) => {
        const next = new Set(roles);
        if (next.has(role)) next.delete(role);
        else next.add(role);
        setRoles(next);
    };

    const toggleStatus = (st: string) => {
        const next = new Set(statuses);
        if (next.has(st)) next.delete(st);
        else next.add(st);
        setStatuses(next);
    };

    return (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl z-50 flex flex-col gap-4">
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Role</h4>
                <div className="flex flex-wrap gap-2">
                    {["Administrator", "Manager", "UIUX Designer", "Member"].map((r) => {
                        const isSelected = roles.has(r);
                        return (
                            <button
                                key={r}
                                onClick={() => toggleRole(r)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                        ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {r}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</h4>
                <div className="flex flex-wrap gap-2">
                    {["active", "pending"].map((st) => {
                        const isSelected = statuses.has(st);
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
    );
};

export default FilterPanel;
