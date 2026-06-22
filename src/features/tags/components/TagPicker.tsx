import { useState, useRef, useEffect } from "react";
import { useTags, useSetCustomerTags } from "../tag.hooks";
import ManageTagsModal from "./ManageTagsModal";

interface TagPickerProps {
    customerId: string;
    selectedTagIds: string[];
}

const TagPicker = ({ customerId, selectedTagIds }: TagPickerProps) => {
    const [open, setOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: allTags = [] } = useTags();
    const setTags = useSetCustomerTags(customerId);

    const filtered = allTags.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const isSelected = (id: string) => selectedTagIds.includes(id);

    const toggleTag = (id: string) => {
        const next = isSelected(id)
            ? selectedTagIds.filter((tid) => tid !== id)
            : [...selectedTagIds, id];
        setTags.mutate(next);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="h-[28px] px-2.5 rounded-lg border border-dashed border-gray-300 text-gray-400 text-xs font-medium hover:border-gray-400 hover:text-gray-500 transition-all flex items-center gap-1"
            >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Tag
            </button>

            {open && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50 p-2">
                    <input
                        ref={inputRef}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tags..."
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-all mb-2"
                    />

                    <div className="max-h-52 overflow-y-auto space-y-0.5">
                        {filtered.map((tag) => {
                            const sel = isSelected(tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div
                                        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{
                                            borderColor: tag.color,
                                            backgroundColor: sel ? tag.color : "transparent",
                                        }}
                                    >
                                        {sel && (
                                            <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                        )}
                                    </div>
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
                                        style={{ backgroundColor: (tag.color.startsWith("#") ? tag.color : `#${tag.color}`) + "20", color: tag.color.startsWith("#") ? tag.color : `#${tag.color}` }}
                                    >
                                        {tag.name}
                                    </span>
                                </button>
                            );
                        })}
                        {filtered.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-4">No tags found</p>
                        )}
                    </div>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                            onClick={() => { setManageOpen(true); setOpen(false); }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                            Manage Tags
                        </button>
                    </div>
                </div>
            )}

            {manageOpen && (
                <ManageTagsModal
                    open={manageOpen}
                    onClose={() => setManageOpen(false)}
                />
            )}
        </div>
    );
};

export default TagPicker;
