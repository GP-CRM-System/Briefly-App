import { type Column } from "@/core/components/DataTable";
import type { Product } from "../types";
import { getProductColor, getProductInitials, getStatusClasses, getCategoryClasses } from "../utils";

export const columns: Column<Product>[] = [
    {
        key: "name",
        header: "Product",
        width: "min-w-[240px]",
        render: (row) => (
            <div className="flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getProductColor(row.name)}`}
                >
                    {(row.imageUrl || row.image) ? (
                        <img src={row.imageUrl || row.image} alt={row.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                        getProductInitials(row.name)
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.sku || "—"}</p>
                </div>
            </div>
        ),
    },
    {
        key: "category",
        header: "Category",
        align: "center",
        render: (row) => {
            const { bg, text } = getCategoryClasses(row.category || "");
            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                    {row.category || "—"}
                </span>
            );
        },
    },
    {
        key: "price",
        header: "Price",
        align: "center",
        render: (row) => (
            <div className="text-center">
                <span className="text-sm font-medium text-gray-900">
                    ${Number(row.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                {row.compareAtPrice && Number(row.compareAtPrice) > 0 && (
                    <span className="ml-1.5 text-xs text-gray-400 line-through">
                        ${Number(row.compareAtPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                )}
            </div>
        ),
    },
    {
        key: "inventory",
        header: "Stock",
        align: "center",
        render: (row) => {
            const qty = row.inventory ?? 0;
            const isLow = qty > 0 && qty <= 10;
            const isOut = qty === 0;
            return (
                <div className="flex items-center justify-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                        isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-gray-700"
                    }`}>
                        {isOut && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        )}
                        {isLow && !isOut && (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                        )}
                        {qty}
                    </span>
                </div>
            );
        },
    },
    {
        key: "status",
        header: "Status",
        align: "center",
        render: (row) => {
            const st = row.status?.toLowerCase() || "draft";
            const { bg, text, border } = getStatusClasses(st);
            return (
                <span className={`text-xs font-medium border ${bg} ${text} ${border} px-2.5 py-1 rounded-full capitalize`}>
                    {row.status || "Draft"}
                </span>
            );
        },
    },
    {
        key: "totalSold",
        header: "Sold",
        align: "center",
        render: (row) => (
            <span className="text-sm text-gray-700 font-medium">{row.totalSold ?? 0}</span>
        ),
    },
    {
        key: "totalRevenue",
        header: "Revenue",
        align: "center",
        render: (row) => (
            <span className="text-sm font-medium text-green-600">
                ${Number(row.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        ),
    },
];
