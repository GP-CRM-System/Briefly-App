import { useState, useRef, useEffect } from "react";
import type { Employee } from "../types";

interface ActionMenuProps {
    row: Employee;
    onView: (row: Employee) => void;
    onRemove: (row: Employee) => void;
}

const ActionMenu = ({ row, onView, onRemove }: ActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={containerRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all focus:outline-none"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-gray-100 shadow-lg py-1.5 z-50 focus:outline-none">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onView(row);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                            onRemove(row);
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                        Remove Member
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionMenu;
