import { type Column } from "@/core/components/DataTable";
import type { Campaign } from "../types";

export const columns: Column<Campaign>[] = [
    {
        key: "name",
        header: "Name",
        width: "min-w-[180px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-900 leading-tight">
                {row.name}
            </span>
        ),
    },
    {
        key: "type",
        header: "Type",
        width: "w-[100px]",
        render: (row) => {
            const typeLabel = row.type?.toLowerCase() === "email" ? "E-mail" : (row.type || "E-mail");
            return <span className="text-sm text-gray-700 font-medium">{typeLabel}</span>;
        },
    },
    {
        key: "segment",
        header: "Segments",
        width: "min-w-[160px]",
        render: (row) => (
            <span className="text-sm text-gray-700 font-medium">
                {row.segment?.name || "All Customers"}
            </span>
        ),
    },
    {
        key: "status",
        header: "Status",
        width: "w-[120px]",
        render: (row) => {
            const statusMap: Record<string, { bg: string; text: string; label: string }> = {
                draft: { bg: "bg-gray-50 border-gray-200", text: "text-gray-500", label: "Draft" },
                scheduled: { bg: "bg-blue-50 border-blue-100", text: "text-blue-600", label: "Scheduled" },
                sending: { bg: "bg-amber-50 border-amber-100", text: "text-amber-600", label: "Sending" },
                sent: { bg: "bg-green-50 border-green-200", text: "text-green-600", label: "Completed" },
                completed: { bg: "bg-green-50 border-green-200", text: "text-green-600", label: "Completed" },
                failed: { bg: "bg-red-50 border-red-200", text: "text-red-600", label: "Failed" },
            };

            const statusVal = row.status?.toLowerCase() || "draft";
            const conf = statusMap[statusVal] || { bg: "bg-gray-50 border-gray-200", text: "text-gray-500", label: statusVal };

            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${conf.bg} ${conf.text}`}>
                    {conf.label}
                </span>
            );
        },
    },
    {
        key: "scheduledAt",
        header: "Scheduled",
        width: "min-w-[160px]",
        render: (row) => {
            const dateStr = row.scheduledAt || row.createdAt;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return <span className="text-gray-400 font-medium">—</span>;
            
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const strMinutes = minutes < 10 ? "0" + minutes : minutes;
            
            return (
                <div className="text-xs font-semibold text-gray-700">
                    <p className="leading-tight">
                        {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}
                    </p>
                    <p className="text-gray-400 font-medium mt-0.5">
                        {hours < 10 ? "0" + hours : hours}:{strMinutes} {ampm}
                    </p>
                </div>
            );
        },
    },
    {
        key: "sent",
        header: "Sent",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-sm font-bold text-gray-800">
                {row.metrics?.sent ?? 0}
            </span>
        ),
    },
    {
        key: "opened",
        header: "Opened",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-600">
                {row.metrics?.opened ?? 0}
            </span>
        ),
    },
    {
        key: "clicked",
        header: "Clicked",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-600">
                {row.metrics?.clicked ?? 0}
            </span>
        ),
    },
    {
        key: "converted",
        header: "Converted",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-600">
                {row.metrics?.converted ?? 0}
            </span>
        ),
    },
];
