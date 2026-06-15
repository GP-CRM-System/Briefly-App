import { ActionMenu as SharedActionMenu, type ActionMenuItem } from "@/core/components";
import type { Campaign } from "../types";

interface ActionMenuProps {
    row: Campaign;
    onView: (row: Campaign) => void;
    onEdit: (row: Campaign) => void;
    onSend: (row: Campaign) => void;
    onDelete: (row: Campaign) => void;
}

const ActionMenu = ({ row, onView, onEdit, onSend, onDelete }: ActionMenuProps) => {
    const showSend = row.status === "draft" || row.status === "scheduled";

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
            label: "Edit",
            onClick: () => onEdit(row),
            icon: (
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            )
        },
        {
            label: "Send Now",
            onClick: () => onSend(row),
            visible: showSend,
            variant: "primary",
            icon: (
                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            )
        },
        {
            separator: true
        },
        {
            label: "Delete",
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

    return <SharedActionMenu items={items} />;
};

export default ActionMenu;
