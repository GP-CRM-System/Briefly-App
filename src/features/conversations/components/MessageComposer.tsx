import { useState } from "react";

interface MessageComposerProps {
    onSend: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const MessageComposer = ({ onSend, disabled, placeholder = "Type a message..." }: MessageComposerProps) => {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="border-t border-gray-100 px-6 py-4 bg-white flex items-end gap-3"
        >
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={1}
                disabled={disabled}
                className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] focus:bg-white transition-all disabled:opacity-50"
                style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
                type="submit"
                disabled={disabled || !text.trim()}
                className="h-[44px] w-[44px] rounded-xl bg-[var(--color-primary-500)] text-white flex items-center justify-center hover:bg-[var(--color-primary-600)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 shadow-sm"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </form>
    );
};

export default MessageComposer;
