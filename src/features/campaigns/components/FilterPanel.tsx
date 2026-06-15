import { useState, useRef, useEffect } from "react";
import type { CampaignStatus } from "../types";
import { type CampaignFilterState, freshCampaignFilters, CAMPAIGN_TYPE_OPTIONS, CAMPAIGN_STATUS_OPTIONS } from "../utils";

interface FilterPanelProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: CampaignFilterState) => void;
    campaignNames: string[];
}

const FilterPanel = ({
    open,
    onClose,
    onApply,
    campaignNames,
}: FilterPanelProps) => {
    const [filters, setFilters] = useState<CampaignFilterState>(freshCampaignFilters());
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (open) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open, onClose]);

    useEffect(() => {
        const handleDropdownClickOutside = (e: MouseEvent) => {
            if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener("mousedown", handleDropdownClickOutside);
        return () => document.removeEventListener("mousedown", handleDropdownClickOutside);
    }, [activeDropdown]);

    if (!open) return null;

    const toggleDropdown = (field: string) => {
        setActiveDropdown(prev => prev === field ? null : field);
    };

    const selectName = (name: string | null) => {
        setFilters(prev => ({ ...prev, name }));
        setActiveDropdown(null);
    };

    const selectType = (type: string | null) => {
        setFilters(prev => {
            const next = new Set<string>();
            if (type) next.add(type);
            return { ...prev, types: next };
        });
        setActiveDropdown(null);
    };

    const selectStatus = (status: CampaignStatus | null) => {
        setFilters(prev => {
            const next = new Set<CampaignStatus>();
            if (status) next.add(status);
            return { ...prev, statuses: next };
        });
        setActiveDropdown(null);
    };

    const selectSent = (val: number | null) => {
        setFilters(prev => ({ ...prev, minSent: val }));
        setActiveDropdown(null);
    };

    const selectOpened = (val: number | null) => {
        setFilters(prev => ({ ...prev, minOpened: val }));
        setActiveDropdown(null);
    };

    const resetFilters = () => {
        setFilters(freshCampaignFilters());
        setActiveDropdown(null);
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    };

    const currentTypeLabel = filters.types.size > 0 
        ? Array.from(filters.types)[0] 
        : "Select type";

    const currentStatusLabel = filters.statuses.size > 0 
        ? CAMPAIGN_STATUS_OPTIONS.find(st => st.value === Array.from(filters.statuses)[0])?.label || "Select status"
        : "Select status";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1.5px]" onClick={onClose} />

            {/* Dialog container */}
            <div 
                ref={panelRef} 
                className="relative w-[380px] max-w-full bg-[#f6f8fa] rounded-2xl shadow-2xl border border-gray-200/50 z-10 p-5 flex flex-col gap-4"
                style={{ animation: "modalSlideIn 0.2s ease-out" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                    <p className="font-['Poppins'] font-semibold text-[18px] text-[#1a1a1a]">
                        Filter
                    </p>
                    <button 
                        onClick={onClose}
                        className="bg-[#b3b3b3]/80 hover:bg-gray-400 rounded-full p-1 cursor-pointer transition-colors flex items-center justify-center size-[24px]"
                    >
                        <svg className="w-[12px] h-[12px] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                
                {/* Divider */}
                <div className="bg-gray-200 h-px w-full" />

                {/* Inputs list */}
                <div className="flex flex-col gap-4 max-h-[320px] overflow-y-auto pr-1.5 custom-modal-scroll">
                    
                    {/* Name Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Name
                        </p>
                        <div 
                            onClick={() => toggleDropdown("name")}
                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] flex items-center justify-between px-3 cursor-pointer hover:border-gray-400 transition-colors select-none"
                        >
                            <span className={`font-['Poppins'] text-[14px] truncate pr-2 ${filters.name ? 'text-[#1a1a1a] font-medium' : 'text-gray-400'}`}>
                                {filters.name || "Select name"}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeDropdown === "name" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        {activeDropdown === "name" && (
                            <div ref={dropdownRef} className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-[6px] shadow-lg max-h-[160px] overflow-y-auto py-1">
                                <div 
                                    onClick={() => selectName(null)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${!filters.name ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-750 hover:bg-gray-55'}`}
                                >
                                    All Names
                                </div>
                                {campaignNames.map((name) => {
                                    const isSelected = filters.name === name;
                                    return (
                                        <div 
                                            key={name}
                                            onClick={() => selectName(name)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {name}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Type Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Type
                        </p>
                        <div 
                            onClick={() => toggleDropdown("type")}
                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] flex items-center justify-between px-3 cursor-pointer hover:border-gray-400 transition-colors select-none"
                        >
                            <span className={`font-['Poppins'] text-[14px] ${filters.types.size > 0 ? 'text-[#1a1a1a] font-medium' : 'text-gray-400'}`}>
                                {currentTypeLabel}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeDropdown === "type" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        {activeDropdown === "type" && (
                            <div ref={dropdownRef} className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-[6px] shadow-lg py-1">
                                <div 
                                    onClick={() => selectType(null)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${filters.types.size === 0 ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-55'}`}
                                >
                                    All Types
                                </div>
                                {CAMPAIGN_TYPE_OPTIONS.map((t) => {
                                    const isSelected = filters.types.has(t);
                                    return (
                                        <div 
                                            key={t}
                                            onClick={() => selectType(t)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {t}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Status
                        </p>
                        <div 
                            onClick={() => toggleDropdown("status")}
                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] flex items-center justify-between px-3 cursor-pointer hover:border-gray-400 transition-colors select-none"
                        >
                            <span className={`font-['Poppins'] text-[14px] ${filters.statuses.size > 0 ? 'text-[#1a1a1a] font-medium' : 'text-gray-400'}`}>
                                {currentStatusLabel}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeDropdown === "status" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        {activeDropdown === "status" && (
                            <div ref={dropdownRef} className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-[6px] shadow-lg py-1">
                                <div 
                                    onClick={() => selectStatus(null)}
                                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${filters.statuses.size === 0 ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-55'}`}
                                >
                                    All Statuses
                                </div>
                                {CAMPAIGN_STATUS_OPTIONS.map((st) => {
                                    const isSelected = filters.statuses.has(st.value);
                                    return (
                                        <div 
                                            key={st.value}
                                            onClick={() => selectStatus(st.value)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {st.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sent Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Sent
                        </p>
                        <div 
                            onClick={() => toggleDropdown("sent")}
                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] flex items-center justify-between px-3 cursor-pointer hover:border-gray-400 transition-colors select-none"
                        >
                            <span className={`font-['Poppins'] text-[14px] ${filters.minSent !== null ? 'text-[#1a1a1a] font-medium' : 'text-gray-400'}`}>
                                {filters.minSent !== null ? `>= ${filters.minSent}` : "Select sent count"}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeDropdown === "sent" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        {activeDropdown === "sent" && (
                            <div ref={dropdownRef} className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-[6px] shadow-lg py-1">
                                {[null, 10, 50, 100, 500, 1000, 2000].map((val) => {
                                    const isSelected = filters.minSent === val;
                                    return (
                                        <div 
                                            key={val ?? "all"}
                                            onClick={() => selectSent(val)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-55'}`}
                                        >
                                            {val === null ? "All" : `>= ${val}`}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Opened Dropdown */}
                    <div className="relative flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Opened
                        </p>
                        <div 
                            onClick={() => toggleDropdown("opened")}
                            className="border border-gray-300 bg-white h-[40px] rounded-[6px] flex items-center justify-between px-3 cursor-pointer hover:border-gray-400 transition-colors select-none"
                        >
                            <span className={`font-['Poppins'] text-[14px] ${filters.minOpened !== null ? 'text-[#1a1a1a] font-medium' : 'text-gray-400'}`}>
                                {filters.minOpened !== null ? `>= ${filters.minOpened}` : "Select opened count"}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${activeDropdown === "opened" ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                        {activeDropdown === "opened" && (
                            <div ref={dropdownRef} className="absolute top-[68px] left-0 right-0 z-50 bg-white border border-gray-200 rounded-[6px] shadow-lg py-1">
                                {[null, 10, 50, 100, 500, 1000].map((val) => {
                                    const isSelected = filters.minOpened === val;
                                    return (
                                        <div 
                                            key={val ?? "all"}
                                            onClick={() => selectOpened(val)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-55'}`}
                                        >
                                            {val === null ? "All" : `>= ${val}`}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Scheduled Time Inputs */}
                    <div className="flex flex-col gap-1.5">
                        <p className="font-['Poppins'] font-semibold text-[12px] text-gray-500 uppercase tracking-wider">
                            Scheduled Time
                        </p>
                        <div className="flex items-center gap-[6px]">
                            {/* Start Date */}
                            <div className="relative border border-gray-300 bg-white h-[36px] w-[130px] flex items-center justify-center p-[6px] rounded-[6px] cursor-pointer hover:border-gray-400 transition-colors">
                                <div className="flex gap-[4px] items-center pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className="font-['Poppins'] text-[11px] text-gray-650 text-center whitespace-nowrap">
                                        {filters.startDate ? formatDate(filters.startDate) : "Start Date"}
                                    </span>
                                </div>
                                <input 
                                    type="date"
                                    value={filters.startDate || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value || null }))}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    style={{ colorScheme: 'light' }}
                                />
                            </div>

                            {/* Hyphen */}
                            <p className="font-['Poppins'] text-[12px] text-gray-400 text-center w-[12px]">
                                -
                            </p>

                            {/* End Date */}
                            <div className="relative border border-gray-300 bg-white h-[36px] w-[130px] flex items-center justify-center p-[6px] rounded-[6px] cursor-pointer hover:border-gray-400 transition-colors">
                                <div className="flex gap-[4px] items-center pointer-events-none">
                                    <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span className="font-['Poppins'] text-[11px] text-gray-650 text-center whitespace-nowrap">
                                        {filters.endDate ? formatDate(filters.endDate) : "End Date"}
                                    </span>
                                </div>
                                <input 
                                    type="date"
                                    value={filters.endDate || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value || null }))}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    style={{ colorScheme: 'light' }}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex gap-[16px] h-[40px] items-center w-full mt-1">
                    <button 
                        onClick={resetFilters}
                        className="border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400 transition-all h-[40px] flex items-center justify-center rounded-[6px] flex-1 font-['Poppins'] font-semibold text-[14px] cursor-pointer"
                    >
                        Clear
                    </button>
                    <button 
                        onClick={() => {
                            onApply(filters);
                            onClose();
                        }}
                        className="bg-[#4a90e2] text-white hover:bg-blue-600 hover:shadow-sm transition-all h-[40px] flex items-center justify-center rounded-[6px] flex-1 font-['Poppins'] font-semibold text-[14px] cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </div>

            <style>{`
                .custom-modal-scroll::-webkit-scrollbar { width: 4px; }
                .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-modal-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default FilterPanel;
