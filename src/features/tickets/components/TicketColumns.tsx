import { type Column } from "@/core/components/DataTable";
import type { Ticket } from "../types";
import { getTicketStatusClasses, getTicketPriorityClasses } from "../utils";
import { Link } from "react-router-dom";

const fmtDate = (dStr: string) => {
    if (!dStr) return "—";
    try {
        const date = new Date(dStr);
        if (isNaN(date.getTime())) return dStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
        return dStr;
    }
};

export const columns: Column<Ticket>[] = [
    {
        key: "id",
        header: "Ticket ID",
        width: "min-w-[120px]",
        render: (row) => (
            <span className="text-sm font-medium text-gray-900">
                #{row.id?.replace("TCK-", "") || row.id}
            </span>
        ),
    },
    {
        key: "customer",
        header: "Customer",
        width: "min-w-[200px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-900">
                {row.customerName || "—"}
            </span>
        ),
    },
    {
        key: "order",
        header: "Order",
        align: "center",
        render: (row) => {
            if (!row.orderId) return <span className="text-gray-400">—</span>;
            return (
                <Link
                    to={`/dashboard/orders/${row.orderId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                >
                    View Order
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </Link>
            );
        },
    },
    {
        key: "status",
        header: "Status",
        align: "center",
        render: (row) => {
            const classes = getTicketStatusClasses(row.status);
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${classes.bg} ${classes.text} ${classes.border} capitalize`}>
                    {row.status || "open"}
                </span>
            );
        },
    },
    {
        key: "priority",
        header: "Priority",
        align: "center",
        render: (row) => {
            const classes = getTicketPriorityClasses(row.priority);
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${classes.bg} ${classes.text} ${classes.border} capitalize`}>
                    {row.priority || "medium"}
                </span>
            );
        },
    },
    {
        key: "updatedAt",
        header: "Last Updated",
        align: "center",
        render: (row) => (
            <span className="text-sm text-gray-500 whitespace-nowrap">
                {fmtDate(row.updatedAt || row.createdAt)}
            </span>
        ),
    },
];
