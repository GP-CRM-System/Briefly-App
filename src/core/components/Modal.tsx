import { type ReactNode, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────
   Modal — reusable right-aligned panel dialog.

   The modal aligns to the top-right of the viewport (flush with
   the Create button) and scrolls internally.
   ───────────────────────────────────────────────────────────── */

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: ReactNode;

    /* Footer actions */
    onSubmit?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;

    /* Width */
    width?: string;
}

const Modal = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    onSubmit,
    submitLabel = "Create",
    cancelLabel = "Cancel",
    loading = false,
    width = "max-w-[853px]",
}: ModalProps) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    /* Close on Escape */
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    /* Prevent body scroll */
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex justify-center items-start pt-[50px]"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            {/* Backdrop — very subtle blur */}
            <div className="absolute inset-0 bg-black/15" />

            {/* Dialog — top-right aligned */}
            <div
                className={`relative bg-[#F8FAFC] rounded-2xl shadow-2xl w-full ${width} max-h-[calc(100vh-70px)] flex flex-col`}
                style={{ animation: "modalSlideIn 0.2s ease-out" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between px-8 pt-7 pb-4 bg-white rounded-t-2xl">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        {subtitle && (
                            <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all flex-shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-modal-scroll">
                    <div className="flex flex-col gap-8">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                {onSubmit && (
                    <div className="flex items-center justify-end gap-3 px-8 py-5 bg-white rounded-b-2xl border-t border-gray-100">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="h-[42px] px-6 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={loading}
                            className="h-[42px] px-7 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                            )}
                            {submitLabel}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .custom-modal-scroll::-webkit-scrollbar { width: 4px; }
                .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-modal-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 999px; }
                .custom-modal-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   FormCard — white bordered card wrapping a form section.
   ───────────────────────────────────────────────────────────── */
interface FormCardProps {
    title: string;
    icon?: ReactNode;
    children: ReactNode;
}

export const FormCard = ({ title, icon, children }: FormCardProps) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
            {icon && <span className="text-gray-500">{icon}</span>}
            <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
        </div>
        {/* Card body */}
        <div className="px-6 py-5 space-y-5">
            {children}
        </div>
    </div>
);

/* Keep legacy export name for backwards compat */
export const FormSection = FormCard;

/* ─────────────────────────────────────────────────────────────
   FormField — label + input wrapper.
   ───────────────────────────────────────────────────────────── */
interface FormFieldProps {
    label: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}

export const FormField = ({ label, required, children, className = "" }: FormFieldProps) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {children}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   FormRow — horizontal grid for side-by-side fields.
   ───────────────────────────────────────────────────────────── */
export const FormRow = ({ children }: { children: ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {children}
    </div>
);

/* ─────────────────────────────────────────────────────────────
   Shared input styles.
   ───────────────────────────────────────────────────────────── */
export const inputClasses =
    "w-full h-[44px] px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] focus:bg-white transition-all";

export const selectClasses =
    "w-full h-[44px] px-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 outline-none focus:border-[var(--color-primary-400)] focus:ring-2 focus:ring-[var(--color-primary-100)] focus:bg-white transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_14px_center]";

export default Modal;
