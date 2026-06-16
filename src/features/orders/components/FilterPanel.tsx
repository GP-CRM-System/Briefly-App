import { useState } from "react";
import type { OrderFilterState } from "../types";
import { freshOrderFilters } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: OrderFilterState) => void;
}

const FilterPanel = ({ open, onClose, onApply }: FilterPanelProps) => {
    const [shipping, setShipping] = useState<Set<string>>(new Set());
    const [payment, setPayment] = useState<Set<string>>(new Set());
    const [source, setSource] = useState("");

    if (!open) return null;

    const handleApply = () => {
        onApply({
            fulfillmentStatus: shipping,
            paymentStatus: payment,
            source,
            search: "",
        });
        onClose();
    };

    const handleReset = () => {
        setShipping(new Set());
        setPayment(new Set());
        setSource("");
        onApply(freshOrderFilters());
        onClose();
    };

    const toggleShipping = (status: string) => {
        const next = new Set(shipping);
        if (next.has(status)) next.delete(status);
        else next.add(status);
        setShipping(next);
    };

    const togglePayment = (status: string) => {
        const next = new Set(payment);
        if (next.has(status)) next.delete(status);
        else next.add(status);
        setPayment(next);
    };

    return (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-xl z-50 flex flex-col gap-4">
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fulfillment Status</h4>
                <div className="flex flex-wrap gap-2">
                    {["processing", "shipped", "delivered", "cancelled"].map((st) => {
                        const isSelected = shipping.has(st);
                        return (
                            <button
                                key={st}
                                onClick={() => toggleShipping(st)}
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Status</h4>
                <div className="flex flex-wrap gap-2">
                    {["paid", "pending", "failed"].map((st) => {
                        const isSelected = payment.has(st);
                        return (
                            <button
                                key={st}
                                onClick={() => togglePayment(st)}
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
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Source</h4>
                <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full h-[38px] px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                >
                    <option value="">All Sources</option>
                    <option value="Web Store">Web Store</option>
                    <option value="Mobile App">Mobile App</option>
                </select>
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
