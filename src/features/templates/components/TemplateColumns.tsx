import { type Column } from "@/core/components/DataTable";
import type { Template } from "../types";

export const columns: Column<Template>[] = [
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
        key: "subject",
        header: "Subject",
        width: "min-w-[250px]",
        render: (row) => (
            <span className="text-gray-600 text-sm font-medium truncate block max-w-[300px]">
                {row.subject || "—"}
            </span>
        ),
    },
    {
        key: "variables",
        header: "Variables",
        align: "center",
        width: "w-[120px]",
        render: (row) => (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                {row.variables?.length ?? 0}
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
