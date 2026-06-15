import { ActionMenu as SharedActionMenu, type ActionMenuItem } from "@/core/components";
import type { Employee } from "../types";

interface ActionMenuProps {
    row: Employee;
    onView: (row: Employee) => void;
    onRemove: (row: Employee) => void;
}

const ActionMenu = ({ row, onView, onRemove }: ActionMenuProps) => {
    const items: ActionMenuItem[] = [
        {
            label: "View Profile",
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
            label: "Remove Member",
            onClick: () => onRemove(row),
            variant: "danger",
            icon: (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="18" y1="8" x2="23" y2="13" />
                    <line x1="23" y1="8" x2="18" y2="13" />
                </svg>
            )
        }
    ];

    return <SharedActionMenu items={items} menuWidth="w-44" />;
};

export default ActionMenu;
