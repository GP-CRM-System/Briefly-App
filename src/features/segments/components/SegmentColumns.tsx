import { type Column } from "@/core/components/DataTable";
import type { Segment } from "../types";

export const columns: Column<Segment>[] = [
    {
        key: "id",
        header: "Segment ID",
        width: "w-[150px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                #{row.id}
            </span>
        ),
    },
    {
        key: "name",
        header: "Name",
        width: "min-w-[200px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
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
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
                {row.customerCount ?? 0}
            </span>
        ),
    },
    {
        key: "type",
        header: "Type",
        align: "center",
        width: "w-[120px]",
        render: (row) => {
            const typeVal = row.type || "Dynamic";
            return (
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-['Poppins'] font-medium bg-[#eff6ff] text-[#4a90e2] border border-[#bedbff] capitalize">
                    {typeVal}
                </span>
            );
        },
    },
    {
        key: "creator",
        header: "Creator",
        width: "min-w-[150px]",
        render: (row) => (
            <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
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
            if (isNaN(date.getTime())) return <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">{row.createdAt}</span>;
            
            // Format like: "12 Apr 2026"
            return (
                <span className="font-['Poppins'] font-medium text-[#1a1a1a] text-sm">
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
