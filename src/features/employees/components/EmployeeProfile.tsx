import { useParams, useNavigate } from "react-router-dom";
import { useEmployees } from "../employee.hooks";
import { useAuditLogsForUser } from "@/features/audit/audit.hooks";
import { getActionIcon, fmtRelativeTime, fmtDate } from "@/features/audit/audit.utils";
import type { AuditLogEntry } from "@/features/audit/audit.service";
import { getEmployeeInitials } from "../utils";
import toast from "react-hot-toast";

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: employees = [], isLoading } = useEmployees();
    const employee = employees.find((e) => e.id === id);

    const userId = employee?.userId || "";
    const { data: auditData } = useAuditLogsForUser(userId, { limit: 20 });
    const auditLogs = auditData?.data || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="space-y-6 max-w-[1250px]">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/employees")}>Employee</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Profile</span>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm text-center">
                    <p className="text-sm font-semibold text-gray-400">Employee not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1250px]">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/employees")}>Employee</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Profile</span>
                </div>
            </div>

            {/* Profile Header Banner Card */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm relative">
                <div className="h-[140px] bg-gradient-to-r from-blue-400 to-blue-500 w-full"></div>
                
                <div className="px-6 pb-6 pt-16 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="absolute -top-12 left-6 w-24 h-24 rounded-3xl bg-blue-500 border-4 border-white flex items-center justify-center text-white text-3xl font-black shadow-md">
                        {getEmployeeInitials(employee.name)}
                        <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white"></span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-gray-900">{employee.name || "Unnamed"}</h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase border border-blue-100">
                                    {employee.status || "active"}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-400 mt-1">{employee.role || "Member"}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => toast.success("Edit profile details...")}
                        className="inline-flex items-center gap-1.5 h-[38px] px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-sm focus:outline-none"
                    >
                        ✏️ Edit Profile
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Contact Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">📧</div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-Mail Address</p>
                                    <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{employee.email}</p>
                                </div>
                            </div>
                            {employee.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">📞</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.phone}</p>
                                    </div>
                                </div>
                            )}
                            {employee.location && (
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">📍</div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                        <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.location}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">📅</div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{fmtDate(employee.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Activity Logs Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Activity Logs</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Recent operations performed by {employee.name?.split(" ")[0] || "this user"}.</p>
                        </div>

                        <div className="relative pl-6 border-l border-gray-100 ml-4 space-y-6 py-2">
                            {auditLogs.length > 0 ? (
                                auditLogs.map((log: AuditLogEntry) => (
                                    <div key={log.id} className="relative">
                                        <span className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs shadow-sm">
                                            {getActionIcon(log.action).icon}
                                        </span>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                                    {log.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())}
                                                </h4>
                                                <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                                                    {fmtRelativeTime(log.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                    {log.targetType}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    ID: {log.targetId?.slice(0, 12)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-xs text-gray-400 font-medium">No activity logs yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
