import { type Column } from "@/core/components/DataTable";
import type { Campaign } from "../types";

export const columns: Column<Campaign>[] = [
    {
        key: "name",
        header: "Name",
        width: "min-w-[180px]",
        render: (row) => (
            <span className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins']">
                {row.name}
            </span>
        ),
    },
    {
        key: "type",
        header: "Type",
        width: "w-[100px]",
        align: "center",
        render: (row) => {
            const typeLabel = row.type?.toLowerCase() === "email" ? "E-mail" : (row.type || "E-mail");
            return (
                <span className="text-[14px] text-[#1a1a1a] font-medium leading-[20px] font-['Poppins']">
                    {typeLabel}
                </span>
            );
        },
    },
    {
        key: "segment",
        header: "Segments",
        width: "min-w-[160px]",
        render: (row) => (
            <span className="text-[14px] text-[#1a1a1a] font-medium leading-[20px] font-['Poppins']">
                {row.segment?.name || row.segmentName || "Returning Customers"}
            </span>
        ),
    },
    {
        key: "status",
        header: "Status",
        width: "w-[120px]",
        align: "center",
        render: (row) => {
            const statusMap: Record<string, { bg: string; border: string; text: string; label: string }> = {
                draft: {
                    bg: "bg-[rgba(107,114,128,0.13)]",
                    border: "border-gray-500",
                    text: "text-gray-500",
                    label: "Draft",
                },
                scheduled: {
                    bg: "bg-[rgba(74,144,226,0.13)]",
                    border: "border-[#4a90e2]",
                    text: "text-[#4a90e2]",
                    label: "Scheduled",
                },
                sending: {
                    bg: "bg-[rgba(245,158,11,0.13)]",
                    border: "border-amber-500",
                    text: "text-amber-500",
                    label: "Sending",
                },
                sent: {
                    bg: "bg-[rgba(34,197,94,0.13)]",
                    border: "border-[#22c55e]",
                    text: "text-[#22c55e]",
                    label: "Completed",
                },
                completed: {
                    bg: "bg-[rgba(34,197,94,0.13)]",
                    border: "border-[#22c55e]",
                    text: "text-[#22c55e]",
                    label: "Completed",
                },
                failed: {
                    bg: "bg-[rgba(239,68,68,0.13)]",
                    border: "border-red-500",
                    text: "text-red-500",
                    label: "Failed",
                },
            };

            const statusVal = row.status?.toLowerCase() || "draft";
            const conf = statusMap[statusVal] || {
                bg: "bg-[rgba(107,114,128,0.13)]",
                border: "border-gray-500",
                text: "text-gray-500",
                label: statusVal,
            };

            return (
                <span className={`inline-flex items-center justify-center px-[10px] py-[4px] rounded-full text-[14px] font-medium border ${conf.bg} ${conf.border} ${conf.text} leading-[16px] whitespace-nowrap h-[24px]`}>
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
            const dateStr = row.scheduledAt || row.createdAt || "2026-03-10T20:00:00.000Z";
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return <span className="text-gray-400 font-medium">—</span>;

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            const strMinutes = minutes < 10 ? "0" + minutes : minutes;
            const strHours = hours < 10 ? "0" + hours : hours;

            const datePart = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
            const timePart = `${strHours}:${strMinutes} ${ampm}`;

            return (
                <div className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins'] whitespace-pre-wrap">
                    {datePart}  {timePart}
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
            <span className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins']">
                {row.metrics?.sent ?? 3000}
            </span>
        ),
    },
    {
        key: "opened",
        header: "Opened",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins']">
                {row.metrics?.opened ?? 1800}
            </span>
        ),
    },
    {
        key: "clicked",
        header: "Clicked",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins']">
                {row.metrics?.clicked ?? 700}
            </span>
        ),
    },
    {
        key: "converted",
        header: "Converted",
        align: "center",
        width: "w-[80px]",
        render: (row) => (
            <span className="text-[14px] font-medium text-[#1a1a1a] leading-[20px] font-['Poppins']">
                {row.metrics?.converted ?? 210}
            </span>
        ),
    },
];
