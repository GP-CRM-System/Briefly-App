import { type Column } from "@/core/components/DataTable";
import type { Segment } from "../types";

const StatusBadge = ({ status }: { status?: string }) => {
    const isActive = !status || status.toLowerCase() === "active";
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-['Poppins'] ${
                isActive
                    ? "bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0]"
                    : "bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]"
            }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                    isActive ? "bg-[#22c55e]" : "bg-[#94a3b8]"
                }`}
            />
            {isActive ? "Active" : "Inactive"}
        </span>
    );
};

/* ── Standard Columns (Node 3157-32779) ── */
export const standardColumns: Column<Segment>[] = [
    {
        key: "id",
        header: "Segment ID",
        width: "w-[120px]",
        render: (row) => (
            <span className="font-['Poppins'] text-sm text-[#64748b] font-mono tracking-tight">
                #{row.id.slice(0, 8)}
            </span>
        ),
    },
    {
        key: "name",
        header: "Name",
        width: "min-w-[180px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.name}
            </span>
        ),
    },
    {
        key: "size",
        header: "Size",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.size ?? 0}
            </span>
        ),
    },
    {
        key: "type",
        header: "Type",
        align: "center",
        width: "w-[110px]",
        render: (row) => {
            const isActive = !row.status || row.status.toLowerCase() === "active";
            return <StatusBadge status={isActive ? "Active" : (row.status ?? undefined)} />;
        },
    },
    {
        key: "creator",
        header: "Creator",
        width: "min-w-[130px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.creator || "System"}

            </span>
        ),
    },

    {
        key: "createdAt",
        header: "Created at",
        width: "w-[170px]",
        render: (row) => {
            const d = row.createdAt;
            if (!d) return <span className="text-gray-400 text-sm">—</span>;
            const date = new Date(d);
            if (isNaN(date.getTime()))
                return (
                    <span className="font-['Poppins'] text-sm text-[#1a1a1a]">{d}</span>
                );
            return (
                <span className="font-['Poppins'] text-sm text-[#1a1a1a]">
                    {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>
            );
        },
    },
];

/* ── Detailed Columns (Node 3686-12190) ── */
export const detailedColumns: Column<Segment>[] = [
    {
        key: "name",
        header: "Name",
        width: "min-w-[180px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.name}
            </span>
        ),
    },
    {
        key: "size",
        header: "Size",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.size ?? 0}
            </span>
        ),
    },
    {
        key: "type",
        header: "Type",
        align: "center",
        width: "w-[110px]",
        render: (row) => {
            const isActive = !row.status || row.status.toLowerCase() === "active";
            return <StatusBadge status={isActive ? "Active" : (row.status ?? undefined)} />;
        },
    },
    {
        key: "filter",
        header: "Object",
        align: "center",
        width: "w-[100px]",
        render: (row) => (
            <span className="font-['Poppins'] text-sm text-[#45464d]">
                {(row as any).object || "Contact"}
            </span>
        ),
    },
    {
        key: "updatedAt",
        header: "Last update",
        width: "w-[170px]",
        render: (row) => {
            const d = row.updatedAt || row.createdAt;
            if (!d) return <span className="text-gray-400 text-sm">—</span>;
            const date = new Date(d);
            if (isNaN(date.getTime()))
                return (
                    <span className="font-['Poppins'] text-sm text-[#1a1a1a]">{d}</span>
                );
            return (
                <span className="font-['Poppins'] text-sm text-[#1a1a1a]">
                    {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })}
                </span>
            );
        },
    },
    {
        key: "creator",
        header: "Creator",
        width: "min-w-[130px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.creator || "System"}
            </span>
        ),
    },
    {
        key: "usedInCount",
        header: "Used in",
        align: "center",
        width: "w-[90px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.usedInCount ?? 0}
            </span>
        ),
    },
];

/* ── Default export kept as detailedColumns for backward compat ── */
export const columns = detailedColumns;
