import { ActionMenu as SharedActionMenu, type ActionMenuItem } from "@/core/components";
import type { Order } from "../types";

interface ActionMenuProps {
    row: Order;
    onView: (row: Order) => void;
    onDelete: (row: Order) => void;
}

const ActionMenu = ({ row, onView, onDelete }: ActionMenuProps) => {
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
            separator: true
        },
        {
            label: "Delete Order",
            onClick: () => onDelete(row),
            variant: "danger",
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            )
        }
    ];

    return <SharedActionMenu items={items} menuWidth="w-40" />;
};

export default ActionMenu;
