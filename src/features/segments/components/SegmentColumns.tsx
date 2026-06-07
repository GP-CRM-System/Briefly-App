import { type Column } from "@/core/components/DataTable";
import type { Segment } from "../types";

export const columns: Column<Segment>[] = [
    {
        key: "id",
        header: "Segment ID",
        width: "w-[150px]",
        render: (row) => (
            <span className="font-semibold text-gray-900">
                #{row.id}
            </span>
        ),
    },
    {
        key: "name",
        header: "Name",
        width: "min-w-[200px]",
        render: (row) => (
            <span className="font-bold text-gray-900 text-sm">
                {row.name}
            </span>
        ),
    },
    {
        key: "customerCount",
        header: "Size",
        align: "center",
        width: "w-[100px]",
        render: (row) => (
            <span className="text-gray-700 text-sm font-medium">
                {row.customerCount ?? 0}
            </span>
        ),
    },
    {
        key: "status",
        header: "Type",
        align: "center",
        width: "w-[120px]",
        render: (row) => {
            const statusVal = row.status || "Active";
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                    {statusVal}
                </span>
            );
        },
    },
    {
        key: "creator",
        header: "Creator",
        width: "min-w-[150px]",
        render: (row) => (
            <span className="text-gray-700 text-sm">
                {row.creator || "System"}
            </span>
        ),
    },
    {
        key: "createdAt",
        header: "Created At",
        width: "w-[150px]",
        render: (row) => {
            if (!row.createdAt) return <span className="text-gray-400">—</span>;
            const date = new Date(row.createdAt);
            if (isNaN(date.getTime())) return <span className="text-gray-700 text-sm">{row.createdAt}</span>;
            
            // Format like: "12 Apr 2026"
            return (
                <span className="text-gray-700 text-sm">
                    {date.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    })}
                </span>
            );
        },
    },
];
