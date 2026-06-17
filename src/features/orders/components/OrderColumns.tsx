import { type Column } from "@/core/components/DataTable";
import type { Order } from "../types";
import { getShippingStatusClasses, getPaymentStatusClasses } from "../utils";

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

export const columns: Column<Order>[] = [
    {
        key: "id",
        header: "Order ID",
        width: "min-w-[120px]",
        render: (row) => (
            <span className="text-sm font-medium text-gray-900">
                #{row.id?.replace("ORD-", "") || row.id}
            </span>
        ),
    },
    {
        key: "customer",
        header: "Customer",
        width: "min-w-[200px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-900">
                {row.customer?.name || "—"}
            </span>
        ),
    },
    {
        key: "fulfillmentStatus",
        header: "Fulfillment",
        align: "center",
        render: (row) => {
            const classes = getShippingStatusClasses(row.fulfillmentStatus || "");
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${classes.bg} ${classes.text} ${classes.border} capitalize`}>
                    {row.fulfillmentStatus || "unfulfilled"}
                </span>
            );
        },
    },
    {
        key: "paymentStatus",
        header: "Payment Status",
        align: "center",
        render: (row) => {
            const classes = getPaymentStatusClasses(row.paymentStatus);
            return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${classes.bg} ${classes.text} ${classes.border} capitalize`}>
                    {row.paymentStatus || "pending"}
                </span>
            );
        },
    },
    {
        key: "totalAmount",
        header: "Total Amount",
        align: "right",
        render: (row) => (
            <span className="text-sm font-bold text-gray-900">
                ${Number(row.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
        ),
    },
    {
        key: "source",
        header: "Source",
        align: "center",
        render: (row) => (
            <span className="text-sm text-gray-500">{row.source || "Web"}</span>
        ),
    },
    {
        key: "createdAt",
        header: "Date",
        align: "center",
        render: (row) => (
            <span className="text-sm text-gray-500 whitespace-nowrap">
                {fmtDate(row.createdAt)}
            </span>
        ),
    },
];
