import { useState, useRef, useEffect } from "react";
import { AttachmentIcon, LayoutGridIcon, SentIcon, Cancel01Icon } from "hugeicons-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadStore } from "@/store/upload.store";
import AttachmentPreviewComposer from "./AttachmentPreviewComposer";
import { useParams } from "react-router-dom";

const MicIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
);

const TrashIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

interface MessageComposerProps {
    onSend: (content: string, type?: "text" | "image" | "document" | "template" | "audio" | "video", metadata?: any) => void;
    onTyping?: (isTyping: boolean) => void;
    disabled?: boolean;
    placeholder?: string;
    provider?: "facebook" | "messenger" | "whatsapp" | "instagram";
}

interface TemplateDefinition {
    name: string;
    description: string;
    body: string;
    variables: string[];
}

const WHATSAPP_TEMPLATES: TemplateDefinition[] = [
    {
        name: "hello_world",
        description: "Standard Meta welcome message greeting",
        body: "Hello! Thank you for contacting us. How can we help you today?",
        variables: []
    },
    {
        name: "shipping_update",
        description: "Notify client of item shipment with track link",
        body: "Hello {{1}}, your order {{2}} has been shipped! Track it here: {{3}}.",
        variables: ["Customer Name", "Order ID", "Tracking URL"]
    },
    {
        name: "payment_receipt",
        description: "Confirm invoice payment successfully captured",
        body: "Hi {{1}}, we have successfully received your payment of {{2}}.",
        variables: ["Customer Name", "Amount Paid"]
    }
];

const MessageComposer = ({
    onSend,
    onTyping,
    disabled,
    placeholder = "Type a message...",
    provider
}: MessageComposerProps) => {
    const [text, setText] = useState("");
    const [templateOpen, setTemplateOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
    const [templateVariables, setTemplateVariables] = useState<string[]>([]);
    
    // Voice Message states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<any>(null);
    const recordingTimeRef = useRef(0);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<any>(null);

    const queryClient = useQueryClient();
    const startUpload = useUploadStore((state) => state.startUpload);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const { id: conversationId } = useParams<{ id: string }>();

    const handleFileSelection = (files: File[]) => {
        const oversized = files.filter(f => f.size > 25 * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error("Some files exceed the 25MB limit and were skipped");
        }
        const validFiles = files.filter(f => f.size <= 25 * 1024 * 1024);
        if (validFiles.length > 0) {
            setStagedFiles((prev) => [...prev, ...validFiles]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFileSelection(Array.from(e.target.files));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData.items);
        const files: File[] = [];
        
        items.forEach((item) => {
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        });

        if (files.length > 0) {
            e.preventDefault();
            handleFileSelection(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            handleFileSelection(Array.from(e.dataTransfer.files));
        }
    };

    const handleSendStaged = async (stagedPayload: { file: File; caption?: string }[]) => {
        setStagedFiles([]);
        if (!conversationId) return;

        stagedPayload.forEach(async ({ file, caption }, index) => {
            const tempId = `temp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
            let fileCategory: "image" | "video" | "audio" | "document" = "document";
            if (file.type.startsWith("image/")) {
                fileCategory = "image";
            } else if (file.type.startsWith("video/")) {
                fileCategory = "video";
            } else if (file.type.startsWith("audio/")) {
                fileCategory = "audio";
            }

            const tempMessage = {
                id: tempId,
                conversationId: conversationId,
                content: caption || `Pending upload: ${file.name}`,
                direction: "OUTBOUND",
                type: fileCategory,
                status: "PENDING" as any,
                metadata: {
                    fileName: file.name,
                    mimeType: file.type,
                    size: file.size,
                    originalName: file.name,
                    localPreviewUrl: URL.createObjectURL(file),
                    caption: caption || undefined
                },
                createdAt: new Date().toISOString()
            };

            const cacheKey = ["conversations", "messages", conversationId];
            queryClient.setQueryData(cacheKey, (oldData: any) => {
                if (!oldData) {
                    return { data: [tempMessage], total: 1 };
                }
                return {
                    ...oldData,
                    data: [...oldData.data, tempMessage],
                    total: (oldData.total || 0) + 1
                };
            });

            startUpload(conversationId, tempId, file, caption, queryClient);
        });
    };
    const isTypingRef = useRef(false);

    // Typing Status emitter with debouncing
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        
        if (onTyping) {
            if (!isTypingRef.current) {
                isTypingRef.current = true;
                onTyping(true);
            }
            
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            typingTimeoutRef.current = setTimeout(() => {
                isTypingRef.current = false;
                onTyping(false);
            }, 2000);
        }
    };

    // Stop typing immediately when sent
    const stopTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isTypingRef.current && onTyping) {
            isTypingRef.current = false;
            onTyping(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        
        stopTyping();
        onSend(trimmed, "text");
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Cmd + Enter or Ctrl + Enter to send
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit(e);
        }
        // Escape to cancel or clear
        if (e.key === "Escape") {
            setText("");
            setTemplateOpen(false);
            setSelectedTemplate(null);
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    // Handle Template Submission
    const handleSendTemplate = () => {
        if (!selectedTemplate) return;

        // Verify variables are filled
        if (selectedTemplate.variables.length > 0 && templateVariables.some(v => !v.trim())) {
            toast.error("Please fill in all template variables");
            return;
        }

        // Build Meta Template metadata format
        const components: any[] = [];
        if (templateVariables.length > 0) {
            components.push({
                type: "body",
                parameters: templateVariables.map((val) => ({
                    type: "text",
                    text: val
                }))
            });
        }

        const templateMetadata = {
            name: selectedTemplate.name,
            language: {
                code: "en_US"
            },
            components
        };

        // Construct descriptive content text for internal visualization
        let contentText = selectedTemplate.body;
        templateVariables.forEach((val, index) => {
            contentText = contentText.replace(`{{${index + 1}}}`, val);
        });

        stopTyping();
        if (provider === "whatsapp") {
            onSend(contentText, "template", templateMetadata);
        } else {
            onSend(contentText, "text");
        }
        
        // Reset states
        setSelectedTemplate(null);
        setTemplateVariables([]);
        setTemplateOpen(false);
    };

    // Voice Recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length === 0) return;
                
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const audioFile = new File([audioBlob], `voice-message-${Date.now()}.webm`, { type: "audio/webm" });
                
                stream.getTracks().forEach(track => track.stop());

                if (!conversationId) {
                    toast.error("Active conversation not found.");
                    return;
                }

                const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const tempMessage = {
                    id: tempId,
                    conversationId: conversationId,
                    content: `Voice Note (${formatTime(recordingTimeRef.current)})`,
                    direction: "OUTBOUND",
                    type: "audio" as any,
                    status: "PENDING" as any,
                    metadata: {
                        fileName: `Voice Note (${formatTime(recordingTimeRef.current)}).webm`,
                        mimeType: "audio/webm",
                        size: audioFile.size,
                        originalName: `Voice Note (${formatTime(recordingTimeRef.current)}).webm`,
                        localPreviewUrl: URL.createObjectURL(audioFile)
                    },
                    createdAt: new Date().toISOString()
                };

                const cacheKey = ["conversations", "messages", conversationId];
                queryClient.setQueryData(cacheKey, (oldData: any) => {
                    if (!oldData) return { data: [tempMessage], total: 1 };
                    return {
                        ...oldData,
                        data: [...oldData.data, tempMessage],
                        total: (oldData.total || 0) + 1
                    };
                });

                startUpload(conversationId, tempId, audioFile, undefined, queryClient);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimeRef.current = 0;

            timerIntervalRef.current = setInterval(() => {
                setRecordingTime((t) => {
                    const newVal = t + 1;
                    recordingTimeRef.current = newVal;
                    return newVal;
                });
            }, 1000);

        } catch (err) {
            console.error("Microphone access error:", err);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopAndSendRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            audioChunksRef.current = [];
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        setIsRecording(false);
        toast.success("Voice message discarded.");
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Clean up typing and recording timers on unmount
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    return (
        <div 
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-t border-gray-100 bg-white relative transition-all duration-200 ${
                isDragOver ? "ring-2 ring-blue-500/50 bg-blue-50/5" : ""
            }`}
        >
            {/* WhatsApp Template Modal overlay */}
            {templateOpen && (
                <div className="absolute bottom-full left-6 mb-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">WhatsApp templates</h3>
                        <button
                            onClick={() => {
                                setTemplateOpen(false);
                                setSelectedTemplate(null);
                            }}
                            className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 cursor-pointer"
                        >
                            <Cancel01Icon className="h-4 w-4" />
                        </button>
                    </div>

                    {!selectedTemplate ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {WHATSAPP_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.name}
                                    onClick={() => {
                                        setSelectedTemplate(tmpl);
                                        setTemplateVariables(Array(tmpl.variables.length).fill(""));
                                    }}
                                    className="w-full text-left p-2.5 rounded-lg border border-gray-50 hover:border-blue-100 hover:bg-blue-50/20 transition-all cursor-pointer group"
                                >
                                    <div className="text-xs font-semibold text-gray-900 group-hover:text-blue-600">{tmpl.name}</div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{tmpl.description}</div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="text-[11px] bg-gray-50 p-2.5 rounded-lg text-gray-600 border border-gray-100 italic leading-relaxed">
                                {selectedTemplate.body}
                            </div>
                            <div className="space-y-2">
                                {selectedTemplate.variables.map((label, index) => (
                                    <div key={index}>
                                        <label className="text-[10px] font-semibold text-gray-500 block mb-0.5">{label}</label>
                                        <input
                                            type="text"
                                            value={templateVariables[index] || ""}
                                            onChange={(e) => {
                                                const copy = [...templateVariables];
                                                copy[index] = e.target.value;
                                                setTemplateVariables(copy);
                                            }}
                                            placeholder={`Value for {{${index + 1}}}`}
                                            className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-blue-300 focus:bg-white transition-all text-gray-700"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 justify-end pt-1">
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-3 py-1.5 text-[11px] font-semibold hover:bg-gray-50 text-gray-600 rounded-lg transition-colors cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSendTemplate}
                                    className="px-3 py-1.5 text-[11px] font-semibold bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] rounded-lg transition-colors cursor-pointer shadow-xs"
                                >
                                    Send Template
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv"
            />

            {stagedFiles.length > 0 && (
                <AttachmentPreviewComposer
                    files={stagedFiles}
                    onClose={() => setStagedFiles([])}
                    onSend={handleSendStaged}
                />
            )}

            {/* Composer Box */}
            {isRecording ? (
                <div className="px-6 py-4 bg-red-50/30 flex items-center justify-between gap-3 border-t border-red-100 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <span className="flex h-3.5 w-3.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                        </span>
                        <span className="text-sm font-semibold text-red-600">Recording voice message...</span>
                        <span className="text-sm font-mono text-gray-600 font-bold bg-white border border-gray-150 px-2 py-0.5 rounded-lg shadow-2xs">
                            {formatTime(recordingTime)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Discard Button */}
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="h-[40px] px-3.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold text-xs shadow-2xs"
                            title="Discard recording"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Discard
                        </button>
                        {/* Send Button */}
                        <button
                            type="button"
                            onClick={stopAndSendRecording}
                            className="h-[40px] px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-semibold text-xs shadow-xs"
                            title="Send recording"
                        >
                            <SentIcon className="h-4 w-4" />
                            Send Voice Note
                        </button>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-4 bg-white flex items-end gap-3"
                >
                    {/* Attachment paperclip trigger */}
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={handleAttachmentClick}
                        className="h-[44px] w-[44px] rounded-xl hover:bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer"
                        title="Attach File (Max 25MB)"
                    >
                        <AttachmentIcon className="h-5 w-5" />
                    </button>

                    {/* Template trigger */}
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setTemplateOpen(!templateOpen)}
                        className={`h-[44px] w-[44px] rounded-xl border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer ${
                            templateOpen
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "hover:bg-gray-50 border-gray-100 text-gray-500"
                        }`}
                        title={provider === "whatsapp" ? "Send WhatsApp Template" : "Send Quick Template"}
                    >
                        <LayoutGridIcon className="h-5 w-5" />
                    </button>

                    {/* Main text area input */}
                    <textarea
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        rows={1}
                        disabled={disabled}
                        className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] focus:bg-white transition-all disabled:opacity-50"
                        style={{ minHeight: "44px", maxHeight: "120px" }}
                    />

                    {/* Microphone voice message trigger */}
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={startRecording}
                        className="h-[44px] w-[44px] rounded-xl hover:bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer"
                        title="Record Voice Note"
                    >
                        <MicIcon className="h-5 w-5" />
                    </button>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={disabled || !text.trim()}
                        className="h-[44px] w-[44px] rounded-xl bg-[var(--color-primary-500)] text-white flex items-center justify-center hover:bg-[var(--color-primary-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-xs cursor-pointer"
                    >
                        <SentIcon className="h-5 w-5" />
                    </button>
                </form>
            )}
        </div>
    );
};

export default MessageComposer;
