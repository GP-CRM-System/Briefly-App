import { ActionMenu as SharedActionMenu, type ActionMenuItem } from "@/core/components";
import type { Ticket } from "../types";

interface ActionMenuProps {
    row: Ticket;
    onView: (row: Ticket) => void;
    onResolve: (row: Ticket) => void;
    onEdit?: (row: Ticket) => void;
    onDelete?: (row: Ticket) => void;
}

const ActionMenu = ({ row, onView, onResolve, onEdit, onDelete }: ActionMenuProps) => {
    const items: ActionMenuItem[] = [
        {
            label: "View Details",
            onClick: () => onView(row),
            icon: (
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        },
        {
            label: "Mark Closed",
            onClick: () => onResolve(row),
            visible: row.status !== "CLOSED",
            variant: "success",
            icon: (
                <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            )
        },
        {
            label: "Edit Ticket",
            onClick: () => onEdit?.(row),
            visible: !!onEdit,
            icon: (
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            )
        },
        {
            label: "Delete Ticket",
            onClick: () => onDelete?.(row),
            visible: !!onDelete,
            variant: "danger",
            icon: (
                <svg className="h-4 w-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
            )
        }
    ];

    return <SharedActionMenu items={items} menuWidth="w-44" />;
};

export default ActionMenu;
