import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────────────────────────
   ActionMenu — shared three-dot dropdown used across all features.

   Usage:
     <ActionMenu
       items={[
         { label: "View Details", onClick: () => navigate(...), icon: <EyeIcon /> },
         { label: "Edit",         onClick: () => openModal(), icon: <EditIcon /> },
         { separator: true },
         { label: "Delete",       onClick: () => handleDelete(), icon: <TrashIcon />, variant: "danger" },
       ]}
     />
   ───────────────────────────────────────────────────────────── */

export interface ActionMenuItem {
    /** Display label */
    label?: string;
    /** Click handler */
    onClick?: () => void;
    /** Optional leading icon (ReactNode) */
    icon?: ReactNode;
    /** Color variant: "default" | "danger" | "success" | "primary" */
    variant?: "default" | "danger" | "success" | "primary";
    /** If false, item is hidden */
    visible?: boolean;
    /** Render a separator line instead of a button */
    separator?: boolean;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
    /** Menu width class. Defaults to "w-44" */
    menuWidth?: string;
}

const variantClasses: Record<string, string> = {
    default: "text-gray-700 hover:bg-gray-50",
    danger:  "text-red-600 hover:bg-red-50",
    success: "text-emerald-600 hover:bg-emerald-50",
    primary: "text-blue-600 hover:bg-blue-50 font-medium",
};

const ActionMenu = ({ items, menuWidth = "w-44" }: ActionMenuProps) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Calculate position when menu opens
    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 176, // 176px ≈ w-44
            });
        }
    }, [open]);

    // Click-outside & scroll-to-close
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                open &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        const handleScroll = () => {
            if (open) setOpen(false);
        };

        window.addEventListener("mousedown", handleClick);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            window.removeEventListener("mousedown", handleClick);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [open]);

    // Filter out hidden items
    const visibleItems = items.filter((item) => item.visible !== false);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all focus:outline-none"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ position: "absolute", top: position.top, left: position.left }}
                        className={`${menuWidth} rounded-xl shadow-lg bg-white ring-1 ring-gray-200 z-[9999] overflow-hidden py-1 focus:outline-none`}
                    >
                        {visibleItems.map((item, idx) => {
                            if (item.separator) {
                                return <div key={`sep-${idx}`} className="my-1 border-t border-gray-100" />;
                            }

                            const classes = variantClasses[item.variant || "default"];

                            return (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpen(false);
                                        item.onClick?.();
                                    }}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm transition-colors ${classes}`}
                                >
                                    {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>,
                    document.body
                )}
        </>
    );
};

export default ActionMenu;
