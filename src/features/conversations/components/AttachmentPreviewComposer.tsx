import { useState, useRef, useEffect } from "react";
import { Cancel01Icon, PlusSignIcon, Delete01Icon, ArrowLeft01Icon, ArrowRight01Icon, SentIcon } from "hugeicons-react";

interface AttachmentPreviewComposerProps {
    files: File[];
    onSend: (filesWithCaptions: { file: File; caption?: string }[]) => void;
    onClose: () => void;
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default function AttachmentPreviewComposer({
    files,
    onSend,
    onClose
}: AttachmentPreviewComposerProps) {
    const [filesList, setFilesList] = useState<File[]>(files);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [captions, setCaptions] = useState<Record<string, string>>({}); // keyed by file unique identifier
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get unique identifier for file to preserve captions when reordering/deleting
    const getFileId = (file: File, index: number) => `${file.name}-${file.size}-${index}`;

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            // No-op, browser garbage collects, but standard practice
        };
    }, []);

    if (filesList.length === 0) {
        onClose();
        return null;
    }

    const currentFile = filesList[currentIndex];
    const currentFileId = getFileId(currentFile, currentIndex);
    const currentCaption = captions[currentFileId] || "";

    const handleCaptionChange = (val: string) => {
        setCaptions({
            ...captions,
            [currentFileId]: val
        });
    };

    const handleAddMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const added = Array.from(e.target.files);
            setFilesList([...filesList, ...added]);
        }
    };

    const handleRemoveFile = (index: number) => {
        const updated = filesList.filter((_, i) => i !== index);
        setFilesList(updated);
        if (currentIndex >= updated.length) {
            setCurrentIndex(Math.max(0, updated.length - 1));
        }
    };

    const handleMoveLeft = (index: number) => {
        if (index === 0) return;
        const updated = [...filesList];
        const temp = updated[index];
        updated[index] = updated[index - 1];
        updated[index - 1] = temp;
        setFilesList(updated);
        setCurrentIndex(index - 1);
    };

    const handleMoveRight = (index: number) => {
        if (index === filesList.length - 1) return;
        const updated = [...filesList];
        const temp = updated[index];
        updated[index] = updated[index + 1];
        updated[index + 1] = temp;
        setFilesList(updated);
        setCurrentIndex(index + 1);
    };

    const handleSubmit = () => {
        const payload = filesList.map((file, idx) => ({
            file,
            caption: captions[getFileId(file, idx)] || undefined
        }));
        onSend(payload);
    };

    // Render large file preview
    const renderLargePreview = () => {
        const objectUrl = URL.createObjectURL(currentFile);
        
        if (currentFile.type.startsWith("image/")) {
            return (
                <img
                    src={objectUrl}
                    alt="Preview"
                    className="max-h-[50vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200"
                />
            );
        }

        if (currentFile.type.startsWith("video/")) {
            return (
                <video
                    src={objectUrl}
                    controls
                    className="max-h-[50vh] max-w-full rounded-2xl shadow-2xl border border-white/10 select-none animate-in zoom-in-95 duration-200"
                />
            );
        }

        if (currentFile.type.startsWith("audio/")) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-80 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 border border-blue-500/30">
                        <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-white truncate max-w-full px-2">{currentFile.name}</span>
                    <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{currentFile.type.split("/")[1] || "audio"} File</span>
                    <span className="text-xs text-gray-500 mt-2 font-mono">{formatBytes(currentFile.size)}</span>
                </div>
            );
        }

        // Generic File / Document Preview
        const ext = currentFile.name.split(".").pop()?.toUpperCase() || "DOC";
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-80 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30 font-bold text-xl uppercase tracking-wider">
                    {ext}
                </div>
                <span className="text-sm font-semibold text-white truncate max-w-full px-2">{currentFile.name}</span>
                <span className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{ext} Document</span>
                <span className="text-xs text-gray-500 mt-2 font-mono">{formatBytes(currentFile.size)}</span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-100 flex flex-col bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-200 select-none">
            {/* Top Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                        <Cancel01Icon className="h-5 w-5" />
                    </button>
                    <h2 className="text-base font-semibold text-white">Preview Attachments ({filesList.length})</h2>
                </div>
                <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-600/20 cursor-pointer"
                >
                    Send <SentIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative">
                {/* Large Preview */}
                <div className="flex-1 flex items-center justify-center max-w-4xl w-full min-h-0">
                    {renderLargePreview()}
                </div>

                {/* File Details overlay */}
                <div className="mt-4 flex flex-col items-center gap-1">
                    <span className="text-sm font-semibold text-white text-center line-clamp-1 max-w-md px-4">{currentFile.name}</span>
                    <span className="text-xs text-gray-400 font-mono">{formatBytes(currentFile.size)}</span>
                </div>

                {/* Caption Bar */}
                <div className="w-full max-w-2xl mt-6">
                    <input
                        type="text"
                        value={currentCaption}
                        onChange={(e) => handleCaptionChange(e.target.value)}
                        placeholder="Add a caption..."
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 focus:border-blue-500/50 focus:bg-white/10 text-white rounded-2xl px-5 py-3.5 text-sm outline-none transition-all placeholder:text-gray-500 shadow-inner"
                    />
                </div>
            </div>

            {/* Bottom Carousel Bar */}
            <div className="bg-slate-900/50 border-t border-white/5 px-6 py-5 flex items-center gap-4 min-w-0">
                {/* Thumbnails list */}
                <div className="flex-1 flex items-center gap-3 overflow-x-auto py-1.5 scrollbar-thin scrollbar-thumb-white/10 select-none">
                    {filesList.map((file, idx) => {
                        const isSelected = idx === currentIndex;
                        const objectUrl = file.type.startsWith("image/") || file.type.startsWith("video/") 
                            ? URL.createObjectURL(file) 
                            : null;

                        return (
                            <div
                                key={getFileId(file, idx)}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                                    isSelected ? "border-blue-500 scale-105 shadow-lg shadow-blue-500/20" : "border-transparent hover:border-white/25"
                                }`}
                                onClick={() => setCurrentIndex(idx)}
                            >
                                {objectUrl ? (
                                    <img src={objectUrl} alt="Thumb" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-white/5 text-white/50 flex items-center justify-center font-bold text-xs uppercase">
                                        {file.name.split(".").pop() || "FILE"}
                                    </div>
                                )}

                                {/* Delete Overlay */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(idx);
                                    }}
                                    className="absolute inset-0 bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer"
                                    title="Remove file"
                                >
                                    <Delete01Icon className="h-4 w-4" />
                                </button>

                                {/* Action Overlay in Selection */}
                                {isSelected && (
                                    <div className="absolute top-0.5 right-0.5 flex gap-0.5 bg-black/75 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveLeft(idx);
                                            }}
                                            disabled={idx === 0}
                                            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                            title="Move Left"
                                        >
                                            <ArrowLeft01Icon className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMoveRight(idx);
                                            }}
                                            disabled={idx === filesList.length - 1}
                                            className="p-0.5 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer"
                                            title="Move Right"
                                        >
                                            <ArrowRight01Icon className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Add More Files Trigger */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0 w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/10 hover:border-white/25 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-inner hover:bg-white/10"
                        title="Add more files"
                    >
                        <PlusSignIcon className="h-5 w-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        onChange={handleAddMoreFiles}
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
