import { type ReactNode } from "react";
import { Icon } from "./Icon";
import { exportIcon, importIcon, filterIcon } from "@assets"


/* ─────────────────────────────────────────────────────────────
   PageLayout — reusable action bar for every dashboard page.

   Usage:
     <PageLayout
       searchPlaceholder="Search customers..."
       onSearch={setSearch}
       filterCount={2}
       onFilter={() => setFilterOpen(true)}
       onCreate={() => setCreateOpen(true)}
       createLabel="Create Customer"
       onExport={handleExport}
       onImport={handleImport}
     >
       <DataTable ... />
     </PageLayout>
   ───────────────────────────────────────────────────────────── */

interface PageLayoutProps {
    children: ReactNode;

    /* Search */
    searchValue?: string;
    searchPlaceholder?: string;
    onSearch?: (value: string) => void;

    /* Filter */
    filterCount?: number;
    onFilter?: () => void;

    /* Export / Import */
    onExport?: () => void;
    onImport?: () => void;

    /* Primary CTA */
    onCreate?: () => void;
    createLabel?: string;

    /* Extra actions slot (renders between Import and Create) */
    extraActions?: ReactNode;

    /* Filter dropdown content (rendered relative to the filter button) */
    filterContent?: ReactNode;
}

const PageLayout = ({
    children,
    searchValue = "",
    searchPlaceholder = "Search",
    onSearch,
    filterCount,
    onFilter,
    onExport,
    onImport,
    onCreate,
    createLabel = "Create",
    extraActions,
    filterContent,
}: PageLayoutProps) => {
    return (
        <div className="flex flex-col gap-5 h-full">
            {/* ── Action Bar ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full h-[40px] pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] transition-all"
                    />
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Filter */}
                    {onFilter && (
                        <div className="relative">
                            <button
                                onClick={onFilter}
                                className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                <Icon icon={filterIcon} className="w-4 h-4" />
                                Filter
                                {filterCount !== undefined && filterCount > 0 && (
                                    <span className="ml-0.5 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-primary-500)] text-white text-xs font-semibold flex items-center justify-center">
                                        {filterCount}
                                    </span>
                                )}
                            </button>
                            {filterContent}
                        </div>
                    )}

                    {/* Export */}
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <Icon icon={exportIcon}/>
                            Export
                        </button>
                    )}

                    {/* Import */}
                    {onImport && (
                        <button
                            onClick={onImport}
                            className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <Icon icon={importIcon}/>
                            Import
                        </button>
                    )}

                    {/* Extra slot */}
                    {extraActions}

                    {/* Primary CTA */}
                    {onCreate && (
                        <button
                            onClick={onCreate}
                            className="inline-flex items-center gap-2 h-[40px] px-5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm hover:shadow transition-all"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {createLabel}
                        </button>
                    )}
                </div>
            </div>

            {/* ── Content (Table goes here) ── */}
            <div className="flex-1 min-h-0">
                {children}
            </div>
        </div>
    );
};

export default PageLayout;
