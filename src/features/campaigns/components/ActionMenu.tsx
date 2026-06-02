import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Campaign } from "../types";

interface ActionMenuProps {
    row: Campaign;
    onView: (row: Campaign) => void;
    onEdit: (row: Campaign) => void;
    onSend: (row: Campaign) => void;
    onDelete: (row: Campaign) => void;
}

const ActionMenu = ({ row, onView, onEdit, onSend, onDelete }: ActionMenuProps) => {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const showSend = row.status === "draft" || row.status === "scheduled";

    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 176,
            });
        }
    }, [open]);

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

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setOpen((prev) => !prev)}
                className="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all focus:outline-none"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                </svg>
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        style={{ top: position.top, left: position.left }}
                        className="absolute z-50 w-44 bg-white border border-gray-100 rounded-xl shadow-xl py-1 focus:outline-none"
                    >
                        {/* View Details */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                onView(row);
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            View Details
                        </button>

                        {/* Edit */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                onEdit(row);
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>

                        {/* Send Now */}
                        {showSend && (
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    onSend(row);
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                            >
                                <svg className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                                Send Now
                            </button>
                        )}

                        {/* Separator */}
                        <div className="my-1 border-t border-gray-100" />

                        {/* Delete */}
                        <button
                            onClick={() => {
                                setOpen(false);
                                onDelete(row);
                            }}
                            className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default ActionMenu;
