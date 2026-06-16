import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTemplate, useDeleteTemplate } from "../template.hooks";
import TemplateFormModal from "./TemplateFormModal";
import toast from "react-hot-toast";

const fmtDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        const strHours = hours < 10 ? "0" + hours : hours;
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${strHours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

const TemplateDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: template, isLoading } = useTemplate(id);
    const deleteMutation = useDeleteTemplate();
    const [editModalOpen, setEditModalOpen] = useState(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
            deleteMutation.mutate(id!, {
                onSuccess: () => navigate("/dashboard/templates"),
            });
        }
    };

    const handleCopyHtml = () => {
        if (template?.htmlBody) {
            navigator.clipboard.writeText(template.htmlBody);
            toast.success("HTML copied to clipboard!");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!template) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Template not found</p>
                <button
                    onClick={() => navigate("/dashboard/templates")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Templates
                </button>
            </div>
        );
    }

    // Extract variables from HTML body
    const variableMatches = template.htmlBody?.match(/\{\{([^}]+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map((v: string) => v.replace(/[{}]/g, "").trim()))];

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span
                    onClick={() => navigate("/dashboard/templates")}
                    className="hover:text-gray-700 cursor-pointer transition-colors"
                >
                    Templates
                </span>
                <span className="text-gray-300">&gt;</span>
                <span className="text-gray-900 font-bold">{template.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{template.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Subject: <span className="font-medium text-gray-700">{template.subject || "—"}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all cursor-pointer"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-sm font-semibold text-red-600 transition-all cursor-pointer"
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: HTML Preview */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-gray-900">HTML Preview</h3>
                        <button
                            onClick={handleCopyHtml}
                            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Copy HTML
                        </button>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl min-h-[200px] overflow-hidden">
                        {template.htmlBody ? (
                            <iframe
                                srcDoc={template.htmlBody}
                                title="HTML Preview"
                                className="w-full min-h-[400px] border-0"
                                sandbox="allow-same-origin"
                                style={{ background: "white" }}
                            />
                        ) : (
                            <p className="p-6 text-gray-400">No HTML body</p>
                        )}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="space-y-6">
                    {/* Variables */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Variables</h3>
                        {variables.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {variables.map((v) => (
                                    <span
                                        key={v}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100"
                                    >
                                        {`{{${v}}}`}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No variables found</p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Created</span>
                                <span className="font-semibold text-gray-800">{fmtDate(template.createdAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Updated</span>
                                <span className="font-semibold text-gray-800">{fmtDate(template.updatedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">ID</span>
                                <span className="font-mono text-xs text-gray-400">{template.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <TemplateFormModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                template={template}
            />
        </div>
    );
};

export default TemplateDetails;
