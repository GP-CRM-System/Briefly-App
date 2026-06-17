import { useState, useEffect, useCallback } from "react";
import Modal, { FormField, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { useCreateImport, useCreateExport, useDownloadExport } from "@/features/settings/settings.hooks";
import { settingsService } from "@/features/settings/settings.service";

type Mode = "import" | "export";

interface ImportExportModalProps {
    open: boolean;
    onClose: () => void;
    mode: Mode;
    entityType: "customer" | "product" | "order";
}

export default function ImportExportModal({ open, onClose, mode, entityType }: ImportExportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [format, setFormat] = useState("csv");

    // Export polling state
    const [exportJobId, setExportJobId] = useState<string | null>(null);
    const [exportStatus, setExportStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");

    const createImport = useCreateImport();
    const createExport = useCreateExport();
    const downloadExport = useDownloadExport();

    const isImport = mode === "import";
    const isLoading = isImport ? createImport.isPending : createExport.isPending;

    const entityLabel = entityType === "customer" ? "Customers" : entityType === "product" ? "Products" : "Orders";

    // Poll for export job completion
    const pollExportJob = useCallback(async (jobId: string) => {
        setExportStatus("processing");
        const maxAttempts = 30; // 30 seconds max
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const job = await settingsService.getExportJob(jobId);
                if (job?.status === "COMPLETED") {
                    setExportStatus("completed");
                    toast.success("Export ready for download!");
                    return;
                }
                if (job?.status === "FAILED") {
                    setExportStatus("failed");
                    toast.error("Export failed. Please try again.");
                    return;
                }
            } catch {
                // Job might not be queryable yet, keep polling
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setExportStatus("failed");
        toast.error("Export timed out. Check Settings > Imports & Exports.");
    }, []);

    useEffect(() => {
        if (exportJobId && exportStatus === "processing") {
            pollExportJob(exportJobId);
        }
    }, [exportJobId, exportStatus, pollExportJob]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            setExportJobId(null);
            setExportStatus("idle");
            setFile(null);
        }
    }, [open]);

    const handleDownload = () => {
        if (!exportJobId) return;
        downloadExport.mutate(exportJobId);
    };

    const handleSubmit = () => {
        if (isImport) {
            if (!file) {
                toast.error("Please select a file to import");
                return;
            }
            createImport.mutate(
                { file, entityType },
                {
                    onSuccess: () => {
                        setFile(null);
                        onClose();
                    },
                }
            );
        } else {
            createExport.mutate(
                { entityType, format },
                {
                    onSuccess: (data) => {
                        const jobId = data?.id;
                        if (jobId) {
                            setExportJobId(jobId);
                            setExportStatus("processing");
                        } else {
                            onClose();
                        }
                    },
                }
            );
        }
    };

    const handleClose = () => {
        setFile(null);
        setExportJobId(null);
        setExportStatus("idle");
        onClose();
    };

    const isExport = mode === "export";
    const showDownload = isExport && exportStatus === "completed";
    const showProcessing = isExport && exportStatus === "processing";

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isImport ? `Import ${entityLabel}` : `Export ${entityLabel}`}
            subtitle={
                isImport
                    ? `Upload a CSV file to import ${entityLabel.toLowerCase()} records.`
                    : showDownload
                        ? "Your export is ready to download."
                        : showProcessing
                            ? "Generating export file..."
                            : `Export all ${entityLabel.toLowerCase()} as a downloadable spreadsheet.`
            }
            onSubmit={showDownload ? undefined : handleSubmit}
            submitLabel={isImport ? "Start Import" : showProcessing ? "Generating..." : "Generate Export"}
            loading={isLoading || showProcessing}
            width="max-w-[500px]"
        >
            <div className="space-y-5">
                {showDownload ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-900">{entityLabel} export ready</p>
                            <p className="text-xs text-gray-400 mt-1">Click the button below to download your file</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            disabled={downloadExport.isPending}
                            className="w-full h-[44px] rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {downloadExport.isPending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                    </svg>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download File
                                </>
                            )}
                        </button>
                    </div>
                ) : isImport ? (
                    <FormField label="Upload File" required>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 relative">
                            <input
                                type="file"
                                accept=".csv,.xlsx"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setFile(e.target.files[0]);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {file ? (
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">{file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-600">Click or drag CSV/XLSX file to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">Max 10 MB</p>
                                </div>
                            )}
                        </div>
                    </FormField>
                ) : (
                    <FormField label="File Format" required>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="csv">CSV (Spreadsheet)</option>
                            <option value="xlsx">XLSX (Excel)</option>
                        </select>
                    </FormField>
                )}
            </div>
        </Modal>
    );
}
