import { useParams, useNavigate } from "react-router-dom";
import { useEmployees } from "../employee.hooks";
import { MOCK_EMPLOYEES, getEmployeeInitials } from "../utils";
import toast from "react-hot-toast";

const fmtRelativeTime = (dStr: string) => {
    // Return relative time for simulation or parse date
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

const EmployeeProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Query Hook
    const { data: employees = [], isLoading } = useEmployees();

    // Fallback to mock data if not loaded
    const employee = employees.find((e) => e.id === id) || MOCK_EMPLOYEES.find((e) => e.id === id) || MOCK_EMPLOYEES[0];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
                {/* Colored Cover Banner */}
                <div className="h-[140px] bg-gradient-to-r from-blue-400 to-blue-500 w-full"></div>
                
                {/* Profile Details area */}
                <div className="px-6 pb-6 pt-16 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    {/* Square avatar overlapping the banner */}
                    <div className="absolute -top-12 left-6 w-24 h-24 rounded-3xl bg-blue-500 border-4 border-white flex items-center justify-center text-white text-3xl font-black shadow-md">
                        {getEmployeeInitials(employee.name)}
                        {/* Status active green circle dot */}
                        <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white"></span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-black text-gray-900">{employee.name}</h1>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase border border-blue-100">
                                    {employee.status || "active"}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-400 mt-1">{employee.role || "UIUX Designer"}</p>
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
                
                {/* Left Side: Contact + quarterly performance */}
                <div className="space-y-6">
                    
                    {/* Contact Details Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1">Contact Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">
                                    📧
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">E-Mail Address</p>
                                    <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{employee.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">
                                    📞
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.phone || "+1 (555) 012-3456"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-base flex-shrink-0">
                                    📍
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                    <p className="text-xs font-bold text-gray-800 mt-0.5">{employee.location || "San Francisco, CA"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quarterly Performance Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-1">Quarterly Performance</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-gray-50 bg-gray-50/20 p-4 rounded-2xl flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Deals Won</span>
                                <span className="text-2xl font-black text-gray-900 mt-1">{employee.dealsWon || 24}</span>
                                <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 mt-1">
                                    ↑ 12% vs last Q
                                </span>
                            </div>

                            <div className="border border-gray-50 bg-gray-50/20 p-4 rounded-2xl flex flex-col justify-between">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Rev. Target</span>
                                    <span className="text-2xl font-black text-blue-500 mt-1">{employee.revenueTarget || 94}%</span>
                                </div>
                                <div className="w-full bg-gray-200/60 rounded-full h-[6px] mt-2">
                                    <div
                                        className="bg-blue-500 h-[6px] rounded-full transition-all duration-500"
                                        style={{ width: `${employee.revenueTarget || 94}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Side: Activity Logs Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Activity Logs Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Activity Logs</h3>
                            <p className="text-xs text-gray-400 mt-1 font-medium">Recent interactions and operations performed by {employee.name?.split(" ")[0]}.</p>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-6 border-l border-gray-100 ml-4 space-y-6 py-2">
                            {employee.activityLogs?.map((log) => (
                                <div key={log.id} className="relative">
                                    {/* Circle Bullet icon */}
                                    <span className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xs shadow-sm">
                                        {log.type === "lead_update" ? "👤" : log.type === "campaign_create" ? "📢" : log.type === "ticket_resolve" ? "✓" : "📅"}
                                    </span>

                                    {/* Log details */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-4">
                                            <h4 className="text-sm font-bold text-gray-900 leading-tight">
                                                {log.title}
                                            </h4>
                                            <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                                                {fmtRelativeTime(log.createdAt)}
                                            </span>
                                        </div>
                                        {log.description && (
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[550px]">
                                                {log.description}
                                            </p>
                                        )}

                                        {/* Dynamic tags or metadata boxes */}
                                        {log.type === "lead_update" && log.metadata && (
                                            <div className="flex items-center gap-2 pt-1 flex-wrap">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                    In Progress
                                                </span>
                                                <span className="text-gray-400 text-xs">→</span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    Qualified
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 ml-2">
                                                    Lead ID: #{log.metadata.leadId}
                                                </span>
                                            </div>
                                        )}

                                        {log.type === "ticket_resolve" && log.metadata && (
                                            <div className="flex items-center gap-2 pt-1">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    ✓ Priority: {log.metadata.priority}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default EmployeeProfile;
