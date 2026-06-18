import { type Column } from "@/core/components/DataTable";
import type { Employee } from "../types";
import { getEmployeeColor, getEmployeeInitials } from "../utils";

export const columns: Column<Employee>[] = [
    {
        key: "name",
        header: "Name",
        width: "min-w-[240px]",
        render: (row) => (
            <div className="flex items-center gap-3">
                {row.image ? (
                    <img
                        src={row.image}
                        alt={row.name || "Employee"}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        loading="lazy"
                    />
                ) : (
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getEmployeeColor(row.name)}`}
                    >
                        {getEmployeeInitials(row.name)}
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{row.name || "Unnamed Employee"}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{row.location || "Office Location"}</p>
                </div>
            </div>
        ),
    },
    {
        key: "email",
        header: "E-Mail",
        width: "min-w-[200px]",
        render: (row) => (
            <span className="text-sm font-medium text-gray-700">{row.email}</span>
        ),
    },
    {
        key: "phone",
        header: "Phone",
        width: "min-w-[150px]",
        render: (row) => (
            <span className="text-sm text-gray-500">{row.phone || "—"}</span>
        ),
    },
    {
        key: "role",
        header: "Role",
        width: "min-w-[150px]",
        render: (row) => (
            <span className="text-sm font-semibold text-gray-800">{row.role || "Member"}</span>
        ),
    },
];
