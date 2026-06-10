import { useState, useMemo } from "react";
import {
    useImportExportJobs,
    useCreateImport,
    useCreateExport,
    useDownloadExport
} from "../settings.hooks";
import Modal, { FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { Upload01Icon, Download01Icon, ArrowReloadHorizontalIcon, Loading01Icon } from "hugeicons-react";

const ImportsExportsTab = () => {
    const { data: jobs = [], refetch, isFetching } = useImportExportJobs();

    // Mutations
    const createImportMutation = useCreateImport();
    const createExportMutation = useCreateExport();
    const downloadExportMutation = useDownloadExport();

    // Filter states
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // Modal states
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Import Form states
    const [importEntityType, setImportEntityType] = useState("customer");
    const [importFile, setImportFile] = useState<File | null>(null);

    // Export Form states
    const [exportEntityType, setExportEntityType] = useState("customer");
    const [exportFormat, setExportFormat] = useState("csv");

    const handleRefresh = () => {
        refetch();
        toast.success("Jobs list refreshed");
    };

    const handleNewImportSubmit = () => {
        if (!importFile) {
            toast.error("Please select a file to import");
            return;
        }
        createImportMutation.mutate(
            { file: importFile, entityType: importEntityType },
            {
                onSuccess: () => {
                    setIsImportOpen(false);
                    setImportFile(null);
                },
            }
        );
    };

    const handleNewExportSubmit = () => {
        createExportMutation.mutate(
            { entityType: exportEntityType, format: exportFormat },
            {
                onSuccess: () => {
                    setIsExportOpen(false);
                },
            }
        );
    };

    const handleDownloadJob = (id: string) => {
        downloadExportMutation.mutate(id);
    };

    // Filter logic
    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesSearch =
                job.id.toLowerCase().includes(search.toLowerCase()) ||
                job.fileName.toLowerCase().includes(search.toLowerCase()) ||
                job.createdBy.toLowerCase().includes(search.toLowerCase());

            const matchesType =
                typeFilter === "All" ||
                job.type.toLowerCase() === typeFilter.toLowerCase();

            const matchesStatus =
                statusFilter === "All" ||
                job.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [jobs, search, typeFilter, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Top Bar: Title & Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Imports & Exports</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Manage data import uploads and spreadsheet exports</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex-1 sm:flex-none px-4.5 py-2.5 border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Upload01Icon size={14} className="text-gray-400" /> New Import
                    </button>
                    <button
                        onClick={() => setIsExportOpen(true)}
                        className="flex-1 sm:flex-none px-4.5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Download01Icon size={14} /> New Export
                    </button>
                </div>
            </div>

            {/* Filter controls row */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 items-end shadow-xs">
                {/* Search */}
                <div className="space-y-1 col-span-1 sm:col-span-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Search</label>
                    <input
                        type="text"
                        placeholder="Search by job ID, file name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={inputClasses}
                    />
                </div>

                {/* Type */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</label>
                    <div className="relative">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="All">All</option>
                            <option value="Import">Import</option>
                            <option value="Export">Export</option>
                        </select>
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="All">All</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>

                {/* Refresh Action */}
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        className={`w-11 h-11 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                            isFetching ? "opacity-60" : ""
                        }`}
                        title="Refresh list"
                    >
                        <ArrowReloadHorizontalIcon size={16} className={`${isFetching ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                <th className="py-4.5 px-6">Job ID</th>
                                <th className="py-4.5 px-6">Type</th>
                                <th className="py-4.5 px-6">File Name</th>
                                <th className="py-4.5 px-6">Created By</th>
                                <th className="py-4.5 px-6">Created At</th>
                                <th className="py-4.5 px-6">Progress</th>
                                <th className="py-4.5 px-6">Status</th>
                                <th className="py-4.5 px-6 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-400">
                                        No import/export jobs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => {
                                    const isCompleted = job.status.toLowerCase() === "completed";
                                    const isFailed = job.status.toLowerCase() === "failed";
                                    const isExportType = job.type.toLowerCase() === "export";

                                    let statusBg = "bg-yellow-50 text-yellow-700";
                                    if (isCompleted) statusBg = "bg-green-50 text-green-700";
                                    if (isFailed) statusBg = "bg-red-50 text-red-700";

                                    return (
                                        <tr key={job.id} className="hover:bg-slate-50/50">
                                            <td className="py-4 px-6 font-bold text-gray-800 text-xs truncate max-w-[120px]" title={job.id}>
                                                {job.id}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                                                    job.type.toLowerCase() === "import" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                                                }`}>
                                                    {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-700 truncate max-w-[200px]" title={job.fileName}>
                                                {job.fileName}
                                            </td>
                                            <td className="py-4 px-6 text-gray-500">{job.createdBy}</td>
                                            <td className="py-4 px-6 text-gray-400 font-normal">{job.createdAt}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isFailed ? "bg-red-400" : "bg-green-500"}`}
                                                            style={{ width: `${job.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-700 font-bold">{job.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusBg}`}>
                                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {isExportType && isCompleted ? (
                                                    <button
                                                        onClick={() => handleDownloadJob(job.id)}
                                                        disabled={downloadExportMutation.isPending}
                                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold disabled:opacity-50"
                                                        title="Download Export File"
                                                    >
                                                        {downloadExportMutation.isPending ? (
                                                            <Loading01Icon size={14} className="animate-spin" />
                                                        ) : (
                                                            <Download01Icon size={14} />
                                                        )}
                                                        Download
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Import Modal */}
            <Modal
                open={isImportOpen}
                onClose={() => {
                    setIsImportOpen(false);
                    setImportFile(null);
                }}
                title="New CSV Import"
                subtitle="Select an entity type and upload a spreadsheet to insert/update records."
                onSubmit={handleNewImportSubmit}
                submitLabel="Start Import"
                loading={createImportMutation.isPending}
                width="max-w-[500px]"
            >
                <div className="space-y-5">
                    <FormField label="Entity Type" required>
                        <select
                            value={importEntityType}
                            onChange={(e) => setImportEntityType(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="customer">Customers</option>
                            <option value="product">Products</option>
                            <option value="order">Orders</option>
                        </select>
                    </FormField>

                    <FormField label="Upload File" required>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        setImportFile(e.target.files[0]);
                                    }
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <Upload01Icon size={24} className="text-gray-400" />
                            {importFile ? (
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">{importFile.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{(importFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-600">Click or drag CSV file to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">Only CSV files are supported</p>
                                </div>
                            )}
                        </div>
                    </FormField>
                </div>
            </Modal>

            {/* Export Modal */}
            <Modal
                open={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                title="New Data Export"
                subtitle="Select the entity data you want to export as a downloadable spreadsheet."
                onSubmit={handleNewExportSubmit}
                submitLabel="Generate Export"
                loading={createExportMutation.isPending}
                width="max-w-[500px]"
            >
                <div className="space-y-5">
                    <FormField label="Entity Type" required>
                        <select
                            value={exportEntityType}
                            onChange={(e) => setExportEntityType(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="customer">Customers</option>
                            <option value="product">Products</option>
                            <option value="order">Orders</option>
                        </select>
                    </FormField>

                    <FormField label="File Format" required>
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="csv">CSV (Spreadsheet)</option>
                            <option value="json">JSON</option>
                        </select>
                    </FormField>
                </div>
            </Modal>
        </div>
    );
};

export default ImportsExportsTab;

