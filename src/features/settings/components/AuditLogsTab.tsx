import { useState } from "react";
import { useAuditLogs } from "@/features/audit/audit.hooks";
import { getActionIcon, fmtDate } from "@/features/audit/audit.utils";
import type { AuditLogEntry } from "@/features/audit/audit.service";
import { selectClasses } from "@/core/components/Modal";

const AuditLogsTab = () => {
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("");
    const [targetFilter, setTargetFilter] = useState("");

    const { data, isLoading, isFetching } = useAuditLogs({
        page,
        limit: 20,
        ...(actionFilter ? { action: actionFilter } : {}),
        ...(targetFilter ? { targetType: targetFilter } : {}),
    });

    const logs = data?.data || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / 20);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-bold text-gray-900">Audit Logs</h3>
                <p className="text-xs text-gray-400 mt-0.5">System-wide activity log tracking all significant actions</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end shadow-xs">
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Action</label>
                    <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className={selectClasses}>
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="INVITE_SEND">Invite Sent</option>
                        <option value="INVITE_ACCEPT">Invite Accepted</option>
                        <option value="MEMBER_REMOVE">Member Removed</option>
                        <option value="ROLE_CHANGE">Role Change</option>
                        <option value="DOWNLOAD">Download</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target Type</label>
                    <select value={targetFilter} onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }} className={selectClasses}>
                        <option value="">All Types</option>
                        <option value="EXPORT_JOB">Export Job</option>
                        <option value="IMPORT_JOB">Import Job</option>
                        <option value="CAMPAIGN">Campaign</option>
                        <option value="SEGMENT">Segment</option>
                        <option value="ROLE">Role</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-semibold">{total} total logs</span>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                <th className="py-4 px-6">Action</th>
                                <th className="py-4 px-6">Target</th>
                                <th className="py-4 px-6">Target ID</th>
                                <th className="py-4 px-6">User</th>
                                <th className="py-4 px-6">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {isLoading || isFetching ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No audit logs found</td></tr>
                            ) : (
                                logs.map((log: AuditLogEntry) => {
                                    const style = getActionIcon(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text} border ${style.border}`}>
                                                    {style.icon} {log.action.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-gray-700 font-semibold">{log.targetType}</td>
                                            <td className="py-4 px-6 text-gray-500 font-mono text-xs truncate max-w-[140px]" title={log.targetId}>{log.targetId?.slice(0, 16)}...</td>
                                            <td className="py-4 px-6 text-gray-500">{log.user?.name || "System"}</td>
                                            <td className="py-4 px-6 text-gray-400 font-normal text-xs">{fmtDate(log.createdAt)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-semibold">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                Previous
                            </button>
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogsTab;
