import { useParams, useNavigate } from "react-router-dom";
import { Mail02Icon, CallIcon, Location01Icon, Settings01Icon, Logout01Icon, UserAdd01Icon, FileShredderIcon } from "hugeicons-react";
import { useEmployees, useUpdateEmployeeRole } from "../employee.hooks";
import { useAuditLogsForUser } from "@/features/audit/audit.hooks";
import { getEmployeeInitials } from "../utils";

const fmtRelativeTime = (dStr: string) => {
    if (!dStr) return "";
    try {
        const date = new Date(dStr);
        if (isNaN(date.getTime())) return dStr;
        const diffMs = new Date().getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${Math.max(1, diffMins)} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    } catch {
        return dStr;
    }
};

const actionIcon = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("create") || lower.includes("invite")) return <UserAdd01Icon size={14} />;
    if (lower.includes("update") || lower.includes("change")) return <Settings01Icon size={14} />;
    if (lower.includes("delete") || lower.includes("remove")) return <FileShredderIcon size={14} />;
    if (lower.includes("login") || lower.includes("logout") || lower.includes("sign")) return <Logout01Icon size={14} />;
    return <Settings01Icon size={14} />;
};

const actionLabel = (action: string) => {
    return action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: employees = [], isLoading } = useEmployees();
    const updateRoleMutation = useUpdateEmployeeRole();

    const employee = employees.find((e) => e.id === id);

    const { data: auditLogsData } = useAuditLogsForUser(employee?.userId || "", { limit: 20 });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="space-y-6 max-w-[1250px]">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/employees")}>Employees</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Profile</span>
                </div>
                <div className="bg-white rounded-3xl border border-gray-100 p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Employee Not Found</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-sm">
                        This employee could not be found in your organization. They may have been removed or the link is invalid.
                    </p>
                    <button
                        onClick={() => navigate("/dashboard/employees")}
                        className="mt-6 h-10 px-5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all"
                    >
                        Back to Employees
                    </button>
                </div>
            </div>
        );
    }

    const auditLogs = auditLogsData?.data || [];

    return (
        <div className="space-y-6 max-w-[1250px]">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/employees")}>Employees</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Profile</span>
                </div>
            </div>

            {/* Profile Header Banner Card */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm relative">
                {/* Colored Cover Banner */}
                <div className="h-[140px] bg-gradient-to-r from-primary-400 to-primary-500 w-full"></div>

                {/* Profile Details area */}
                <div className="px-6 pb-6 pt-16 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    {/* Square avatar overlapping the banner */}
                    <div className="absolute -top-12 left-6 w-24 h-24 rounded-3xl border-4 border-white shadow-md overflow-hidden">
                        {employee.image ? (
                            <img
                                src={employee.image}
                                alt={employee.name || "Employee"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-3xl font-black">
                                {getEmployeeInitials(employee.name)}
                            </div>
                        )}
                        <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white"></span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-gray-900">{employee.name || "Unnamed Employee"}</h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-600 uppercase border border-primary-100">
                                    {employee.status || "active"}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-400 mt-1">{employee.role || "member"}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">Update Role:</span>
                        <select
                            value={employee.role || ""}
                            onChange={(e) => {
                                if (e.target.value) {
                                    updateRoleMutation.mutate({ id: employee.id, role: e.target.value });
                                }
                            }}
                            className="h-[38px] px-3 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-primary-500 cursor-pointer"
                        >
                            <option value="">Select role</option>
                            <option value="admin">Administrator (admin)</option>
                            <option value="member">Member (member)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Side: Contact Details */}
                <div className="space-y-6">
                    {/* Contact Details Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
                                    <Mail02Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-Mail Address</p>
                                    <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{employee.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
                                    <CallIcon size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.phone || "—"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0">
                                    <Location01Icon size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.location || "—"}</p>
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
                            <p className="text-xs text-gray-400 mt-1 font-medium">Recent actions performed by {employee.name?.split(" ")[0] || "this employee"}.</p>
                        </div>

                        {auditLogs.length > 0 ? (
                            <div className="relative pl-6 border-l border-gray-100 ml-4 space-y-6 py-2">
                                {auditLogs.map((log) => (
                                    <div key={log.id} className="relative">
                                        <span className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm text-primary-500">
                                            {actionIcon(log.action)}
                                        </span>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-4">
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                                    {actionLabel(log.action)} — {log.targetType?.toLowerCase()}
                                                </h4>
                                                <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                                                    {fmtRelativeTime(log.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                                {log.action.replace(/_/g, " ").toLowerCase()} on {log.targetType?.toLowerCase()} <span className="text-primary-500 font-semibold">#{log.targetId.slice(0, 8)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 py-8 text-center border border-dashed border-gray-200 rounded-xl">
                                No activity logs available for this employee.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;
