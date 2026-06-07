import { useLocation } from "react-router-dom";
import { Icon } from "@/core/components";
import { useAuthStore } from "@/store/auth.store";
import { notification } from "@/assets/icons/navbar/navbar";

import { useUIStore } from "@/store/ui.store";

/* ── Route → Page title mapping ── */
const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/customers": "Customers",
    "/dashboard/segments": "Segments",
    "/dashboard/campaigns": "Campaigns",
    "/dashboard/products": "Products",
    "/dashboard/orders": "Orders",
    "/dashboard/tickets": "Support Tickets",
    "/dashboard/employees": "Employees",
    "/dashboard/analytics": "Analytics",
    "/dashboard/settings": "Settings",
};

const Navbar = () => {
    const { pathname } = useLocation();
    const user = useAuthStore((s) => s.user);
    const role = useAuthStore((s) => s.role);
    const { setSidebarOpen } = useUIStore();

    const pageTitle = pageTitles[pathname]
        || (pathname.includes("/customers/") ? "Customer Profile"
        : pathname.includes("/segments/") ? "Segment Details"
        : pathname.includes("/campaigns/") ? "Campaign Details"
        : pathname.includes("/products/") ? "Product Details"
        : "Dashboard");

    return (
        <header className="w-full bg-white border-b border-gray-100">
            {/* ── Top Row: Toggle + Title | Notification + Avatar ── */}
            <div className="flex items-center justify-between px-5 lg:px-8 h-[64px]">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 focus:outline-none flex items-center justify-center"
                        aria-label="Open sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-medium text-gray-900">{pageTitle}</h1>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[var(--color-primary-500)] hover:border-blue-200 transition-all">
                        <Icon icon={notification} className="h-5 w-5" />
                        {/* Notification dot */}
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                    </button>

                    {/* User Avatar + Info */}
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-primary-600)] flex items-center justify-center text-white text-sm font-semibold overflow-hidden ring-2 ring-white shadow-sm">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-[var(--color-primary-500)] transition-colors">
                                Hello, {user?.name?.split(" ")[0] || "User"}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">{role || "Member"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
