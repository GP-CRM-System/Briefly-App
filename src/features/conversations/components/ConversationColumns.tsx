import { type Column } from "@/core/components/DataTable";
import type { Conversation } from "../types";
import { getProviderBadge, getStatusBadge, formatConversationDate } from "../utils";

const getName = (row: Conversation) => row.customer?.name || "Unknown";
const getInitials = (row: Conversation) =>
    (row.customer?.name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

export const columns: Column<Conversation>[] = [
    {
        key: "customer",
        header: "Customer",
        width: "min-w-[200px]",
        render: (row) => (
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                    {getInitials(row)}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                        {getName(row)}
                    </p>
                    <p className="text-xs text-gray-400">{row.customer?.email || "—"}</p>
                </div>
            </div>
        ),
    },
    {
        key: "provider",
        header: "Provider",
        align: "center",
        render: (row) => {
            const badge = getProviderBadge(row.provider || "");
            return (
                <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${badge.classes}`}>
                    {badge.label}
                </span>
            );
        },
    },
    {
        key: "status",
        header: "Status",
        align: "center",
        render: (row) => {
            const badge = getStatusBadge(row.status || "");
            return (
                <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${badge.classes}`}>
                    {badge.label}
                </span>
            );
        },
    },
    {
        key: "lastMessageAt",
        header: "Last Message",
        width: "min-w-[160px]",
        render: (row) => (
            <div>
                {row.lastMessageAt ? (
                    <p className="text-xs text-gray-400">{formatConversationDate(row.lastMessageAt)}</p>
                ) : (
                    <span className="text-gray-400">—</span>
                )}
            </div>
        ),
    },
];
