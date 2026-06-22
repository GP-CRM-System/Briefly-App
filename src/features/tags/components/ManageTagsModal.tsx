import { useState } from "react";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "../tag.hooks";

interface ManageTagsModalProps {
    open: boolean;
    onClose: () => void;
}

const TAG_COLORS = [
    "#6B7280", "#EF4444", "#F97316", "#EAB308", "#22C55E",
    "#14B8A6", "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1",
];

const ManageTagsModal = ({ open, onClose }: ManageTagsModalProps) => {
    const { data: tags = [], isLoading } = useTags();
    const createTag = useCreateTag();
    const updateTag = useUpdateTag();
    const deleteTag = useDeleteTag();

    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState(TAG_COLORS[0]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editColor, setEditColor] = useState("");

    const handleCreate = () => {
        if (!newName.trim()) return;
        createTag.mutate({ name: newName.trim(), color: newColor }, {
            onSuccess: () => { setNewName(""); setNewColor(TAG_COLORS[0]); }
        });
    };

    const handleUpdate = (id: string) => {
        if (!editName.trim()) return;
        updateTag.mutate({ id, payload: { name: editName.trim(), color: editColor } });
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this tag? It will be removed from all customers.")) {
            deleteTag.mutate(id);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md mx-4 p-6 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-900">Manage Tags</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Create new tag */}
                <div className="bg-gray-50 rounded-xl p-3.5 mb-5">
                    <p className="text-xs font-semibold text-gray-500 mb-2.5">Create Tag</p>
                    <div className="flex items-center gap-2 mb-2.5">
                        <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            placeholder="Tag name..."
                            className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-blue-400 transition-all"
                        />
                        <button
                            onClick={handleCreate}
                            disabled={createTag.isPending || !newName.trim()}
                            className="h-9 px-4 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all"
                        >
                            {createTag.isPending ? "..." : "Add"}
                        </button>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {TAG_COLORS.map((color) => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                className="w-6 h-6 rounded-full border-2 transition-all"
                                style={{
                                    backgroundColor: color,
                                    borderColor: newColor === color ? "#374151" : "transparent",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Existing tags */}
                <p className="text-xs font-semibold text-gray-500 mb-2.5">All Tags</p>
                <div className="space-y-1.5">
                    {isLoading ? (
                        <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
                    ) : tags.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No tags yet</p>
                    ) : tags.map((tag) => (
                        <div key={tag.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                            {editingId === tag.id ? (
                                <>
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleUpdate(tag.id)}
                                        className="flex-1 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-sm outline-none focus:border-blue-400 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-1">
                                        {TAG_COLORS.slice(0, 6).map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setEditColor(color)}
                                                className="w-5 h-5 rounded-full border"
                                                style={{ backgroundColor: color, borderColor: editColor === color ? "#374151" : "transparent" }}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleUpdate(tag.id)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="text-xs text-gray-400 hover:text-gray-600 px-1"
                                    >
                                        Esc
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-1"
                                        style={{ backgroundColor: (tag.color.startsWith("#") ? tag.color : `#${tag.color}`) + "20", color: tag.color.startsWith("#") ? tag.color : `#${tag.color}` }}
                                    >
                                        {tag.name}
                                    </span>
                                    <button
                                        onClick={() => { setEditingId(tag.id); setEditName(tag.name); setEditColor(tag.color); }}
                                        className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tag.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageTagsModal;
