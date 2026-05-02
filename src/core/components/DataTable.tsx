import { useState, useMemo, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
   DataTable — generic, reusable table for all dashboard pages.

   Usage:
     <DataTable
       columns={[
         { key: "name", header: "Name", render: (row) => <NameCell row={row} /> },
         { key: "orders", header: "Orders" },
         { key: "totalSpent", header: "Total Spent", render: (row) => <span className="text-green-600 font-semibold">${row.totalSpent}</span> },
       ]}
       data={customers}
       pageSize={9}
       selectable
       onRowAction={(row) => console.log(row)}
       emptyMessage="No customers found"
     />
   ───────────────────────────────────────────────────────────── */

export interface Column<T> {
    /** Unique key — also used to access row[key] when no render fn is given */
    key: string;
    /** Column header text */
    header: string;
    /** Optional custom cell renderer */
    render?: (row: T, index: number) => ReactNode;
    /** Tailwind width class, e.g. "w-[200px]" or "min-w-[120px]" */
    width?: string;
    /** Right-align the column */
    align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];

    /** Rows per page. Defaults to 10. */
    pageSize?: number;

    /** Show row checkboxes */
    selectable?: boolean;

    /** Called when selected rows change */
    onSelectionChange?: (selectedRows: T[]) => void;

    /** Render a three-dot action menu per row */
    onRowAction?: (row: T) => void;

    /** Custom action renderer (overrides default three-dot) */
    renderRowAction?: (row: T) => ReactNode;

    /** Message when data is empty */
    emptyMessage?: string;

    /** Loading skeleton */
    loading?: boolean;

    /** Unique row identifier key. Defaults to "id" */
    rowKey?: keyof T;

    /** Externally controlled page (1-indexed). If not provided, uses internal state. */
    currentPage?: number;

    /** Externally controlled total. If not provided, uses data.length */
    totalItems?: number;

    /** Called when page changes (1-indexed) */
    onPageChange?: (page: number) => void;
}

function DataTable<T extends Record<string, any>>({
    columns,
    data,
    pageSize = 10,
    selectable = false,
    onSelectionChange,
    onRowAction,
    renderRowAction,
    emptyMessage = "No data found",
    loading = false,
    rowKey = "id" as keyof T,
    currentPage: controlledPage,
    totalItems: controlledTotal,
    onPageChange,
}: DataTableProps<T>) {
    /* ── Internal pagination state ── */
    const [internalPage, setInternalPage] = useState(1);
    const page = controlledPage ?? internalPage;
    const setPage = (p: number) => {
        if (onPageChange) onPageChange(p);
        else setInternalPage(p);
    };

    const totalItems = controlledTotal ?? data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    /* If data is client-side, slice it. If server-side (controlledPage), use full data. */
    const pageData = controlledPage ? data : data.slice((page - 1) * pageSize, page * pageSize);

    /* ── Selection ── */
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const allOnPageSelected = pageData.length > 0 && pageData.every((r) => selectedIds.has(String(r[rowKey])));

    const toggleAll = () => {
        const next = new Set(selectedIds);
        if (allOnPageSelected) {
            pageData.forEach((r) => next.delete(String(r[rowKey])));
        } else {
            pageData.forEach((r) => next.add(String(r[rowKey])));
        }
        setSelectedIds(next);
        onSelectionChange?.(data.filter((r) => next.has(String(r[rowKey]))));
    };

    const toggleRow = (row: T) => {
        const next = new Set(selectedIds);
        const id = String(row[rowKey]);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
        onSelectionChange?.(data.filter((r) => next.has(String(r[rowKey]))));
    };

    /* ── Pagination numbers ── */
    const paginationRange = useMemo(() => {
        const range: (number | "dots")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            range.push(1);
            if (page > 3) range.push("dots");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) range.push(i);
            if (page < totalPages - 2) range.push("dots");
            range.push(totalPages);
        }
        return range;
    }, [page, totalPages]);

    /* ── Skeleton rows ── */
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                {selectable && <th className="w-[52px] p-4" />}
                                {columns.map((col) => (
                                    <th key={col.key} className={`p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.width || ""}`}>
                                        {col.header}
                                    </th>
                                ))}
                                {(onRowAction || renderRowAction) && <th className="w-[60px] p-4" />}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: pageSize }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    {selectable && <td className="p-4"><div className="h-4 w-4 bg-gray-100 rounded animate-pulse" /></td>}
                                    {columns.map((col) => (
                                        <td key={col.key} className="p-4">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                                        </td>
                                    ))}
                                    {(onRowAction || renderRowAction) && <td className="p-4"><div className="h-4 w-4 bg-gray-100 rounded animate-pulse" /></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (!data.length) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col items-center justify-center py-20 px-6">
                <svg className="w-16 h-16 text-gray-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                </svg>
                <p className="text-sm text-gray-400 font-medium">{emptyMessage}</p>
            </div>
        );
    }

    /* ── Table ── */
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="w-full">
                    {/* Header */}
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {selectable && (
                                <th className="w-[52px] px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allOnPageSelected}
                                        onChange={toggleAll}
                                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-300)] cursor-pointer accent-[var(--color-primary-500)]"
                                    />
                                </th>
                            )}
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.width || ""} ${
                                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                                    }`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {(onRowAction || renderRowAction) && (
                                <th className="w-[60px] px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {pageData.map((row, idx) => {
                            const id = String(row[rowKey]);
                            const isSelected = selectedIds.has(id);

                            return (
                                <tr
                                    key={id || idx}
                                    className={`border-b border-gray-50 transition-colors hover:bg-gray-50/50 ${
                                        isSelected ? "bg-blue-50/40" : ""
                                    }`}
                                >
                                    {selectable && (
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRow(row)}
                                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary-500)] focus:ring-[var(--color-primary-300)] cursor-pointer accent-[var(--color-primary-500)]"
                                            />
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 text-sm text-gray-700 ${col.width || ""} ${
                                                col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                                            }`}
                                        >
                                            {col.render ? col.render(row, idx) : row[col.key]}
                                        </td>
                                    ))}
                                    {(onRowAction || renderRowAction) && (
                                        <td className="px-4 py-3 text-center">
                                            {renderRowAction ? (
                                                renderRowAction(row)
                                            ) : (
                                                <button
                                                    onClick={() => onRowAction?.(row)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                                >
                                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <circle cx="12" cy="5" r="1.5" />
                                                        <circle cx="12" cy="12" r="1.5" />
                                                        <circle cx="12" cy="19" r="1.5" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Footer: Info + Pagination ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                    Showing data {Math.min((page - 1) * pageSize + 1, totalItems)} to{" "}
                    {Math.min(page * pageSize, totalItems)} of{" "}
                    <span className="font-semibold text-gray-600">{totalItems}</span> entries
                </p>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {/* Prev */}
                    <button
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>

                    {paginationRange.map((item, i) =>
                        item === "dots" ? (
                            <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
                                …
                            </span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => setPage(item as number)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                    page === item
                                        ? "bg-[var(--color-primary-500)] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {item}
                            </button>
                        )
                    )}

                    {/* Next */}
                    <button
                        onClick={() => page < totalPages && setPage(page + 1)}
                        disabled={page >= totalPages}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DataTable;
