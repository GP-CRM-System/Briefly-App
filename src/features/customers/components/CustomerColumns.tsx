import { type Column } from "@/core/components/DataTable";
import type { Customer } from "../types";
import { getAvatarColor, getInitials, getLifecycleClasses, TAG_COLORS } from "../utils";
import { orderIcon } from "@/assets";
import { Icon } from "@/core/components";

export const columns: Column<Customer>[] = [
    {
        key: "name",
        header: "Name",
        width: "min-w-[200px]",
        render: (row) => (
            <div className="flex items-center gap-3">
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${getAvatarColor(row.name)}`}
                >
                    {row.image ? (
                        <img src={row.image} alt={row.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        getInitials(row.name)
                    )}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.address || "—"}</p>
                </div>
            </div>
        ),
    },
    {
        key: "totalOrders",
        header: "Orders",
        align: "center",
        render: (row) => (
            <div className="flex items-center justify-center gap-1.5 text-sm text-gray-700">
                <Icon icon={orderIcon} />
                {row.totalOrders ?? 0}
            </div>
        ),
    },
    {
        key: "totalSpent",
        header: "Total Spent",
        align: "center",
        render: (row) => (
            <span className="text-sm font-medium text-green-600">
                ${Number(row.totalSpent ?? 0).toLocaleString()}
            </span>
        ),
    },
    {
        key: "lifecycleStage",
        header: "LifeCycle",
        align: "center",
        render: (row) => {
            const lc = row.lifecycleStage?.toLowerCase() || "";
            const { bg, text, border } = getLifecycleClasses(lc);
            return (
                <span className={`text-sm font-medium border-2 ${bg} ${text} ${border} px-2 py-1 rounded-full`}>
                    {row.lifecycleStage || "—"}
                </span>
            );
        },
    },
    {
        key: "tags",
        header: "Tags",
        align: "center",
        render: (row) => (
            <div className="flex items-center justify-center gap-1 flex-wrap">
                {row.tags && row.tags.length > 0 ? row.tags.map((tag) => {
                    const tagStr = typeof tag === "string"
                        ? tag
                        : (tag && typeof tag === "object" && "name" in tag && typeof (tag as any).name === "string")
                            ? (tag as any).name
                            : String(tag ?? "");
                    if (!tagStr) return null;
                    const lc = tagStr.toLowerCase();
                    const colors = TAG_COLORS[lc] || { bg: "bg-gray-50", text: "text-gray-600" };
                    return (
                        <span
                            key={tagStr}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                            {tagStr}
                        </span>
                    );
                }) : <span className="text-gray-400">—</span>}
            </div>
        ),
    },
    {
        key: "lastActivity",
        header: "Last Activity",
        align: "center",
        width: "min-w-[160px]",
        render: (row) => (
            <div className="text-center">
                <p className="text-sm text-gray-700 leading-tight">{row.lastActivity || "—"}</p>
                {row.lastActivityDate && <p className="text-xs text-gray-400">{row.lastActivityDate}</p>}
            </div>
        ),
    },
];
