import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Icon } from "@/core/components";
import { PermissionGuard } from "@/core/components/PermissionGuard";
import { useUIStore } from "@/store/ui.store";
import { useAuth } from "@/core/hooks";
import { logout, logoSvg, letterLogo, tickets } from "@/assets/icons";
import { 
    dashboardIcon, 
    customersIcon, 
    segmentsIcon, 
    campaignsIcon, 
    productsIcon, 
    ordersIcon, 
    employeesIcon, 
    analyticsIcon,
    settingsIcon,
    closeIcon
} from "@/assets/new";

import { Chatting01Icon } from "hugeicons-react";

interface NavItem {
    to: string;
    label: string;
    icon: any;
    end?: boolean;
    permission?: string;
}

const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: dashboardIcon, end: true },
    { to: "/dashboard/customers", label: "Customers", icon: customersIcon, permission: "customers.read" },
    { to: "/dashboard/segments", label: "Segments", icon: segmentsIcon, permission: "segments.read" },
    { to: "/dashboard/campaigns", label: "Campaigns", icon: campaignsIcon, permission: "campaigns.read" },
    { to: "/dashboard/products", label: "Products", icon: productsIcon, permission: "products.read" },
    { to: "/dashboard/orders", label: "Orders", icon: ordersIcon, permission: "orders.read" },
    { to: "/dashboard/tickets", label: "Support Tickets", icon: tickets, permission: "supportTickets.read" },
    { to: "/dashboard/conversations", label: "Conversations", icon: Chatting01Icon, permission: "conversations.read" },
    { to: "/dashboard/employees", label: "Employees", icon: employeesIcon, permission: "member.read" },
    { to: "/dashboard/analytics", label: "Analytics", icon: analyticsIcon, permission: "reports.read" },
];

/* ───────────────────────── SidebarItem ───────────────────────── */
const SidebarItem = ({ 
    to, 
    label, 
    icon, 
    end, 
    sidebarOpen, 
    onClick, 
    isLogout 
}: { 
    to?: string; 
    label: string; 
    icon: any; 
    end?: boolean; 
    sidebarOpen: boolean; 
    onClick?: () => void;
    isLogout?: boolean;
}) => {
    const baseClasses = `flex items-center transition-all group ${
        sidebarOpen ? "h-[38px] px-3 py-2 w-full" : "h-[34px] p-1.5 w-full justify-center"
    }`;

    const activeClasses = `bg-[var(--color-primary-500)] text-white shadow-sm ${
        sidebarOpen ? "rounded-[12px]" : "rounded-[10px]"
    }`;
    const inactiveClasses = isLogout 
        ? `text-gray-500 hover:bg-red-50 hover:text-red-600 ${sidebarOpen ? "rounded-[12px]" : "rounded-[10px]"}` 
        : `text-gray-500 hover:bg-gray-50 hover:text-gray-900 ${sidebarOpen ? "rounded-[12px]" : "rounded-[10px]"}`;

    const content = (
        <div className={`flex items-center gap-3 ${sidebarOpen ? 'w-full' : 'justify-center'}`}>
            <Icon
                icon={icon}
                className={`h-[20px] w-[20px] flex-shrink-0 transition-all ${
                    isLogout ? "opacity-60 group-hover:opacity-100 group-hover:text-red-600" : ""
                }`}
            />
            {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {label}
                </span>
            )}
        </div>
    );

    return (
        <li className="relative group/sidebar-item">
            {to ? (
                <NavLink
                    to={to}
                    end={end}
                    onClick={onClick}
                    title={!sidebarOpen ? label : undefined}
                    className={({ isActive }) =>
                        `${baseClasses} ${isActive && !isLogout ? activeClasses : inactiveClasses}`
                    }
                >
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 ${sidebarOpen ? 'w-full' : 'justify-center'}`}>
                            <Icon
                                icon={icon}
                                className={`h-[20px] w-[20px] flex-shrink-0 transition-all ${
                                    isActive && !isLogout ? "brightness-0 invert" : "opacity-60 group-hover:opacity-100 group-hover:text-[var(--color-primary-500)]"
                                }`}
                            />
                            {sidebarOpen && (
                                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    {label}
                                </span>
                            )}
                        </div>
                    )}
                </NavLink>
            ) : (
                <button 
                    onClick={onClick} 
                    title={!sidebarOpen ? label : undefined}
                    className={`${baseClasses} ${inactiveClasses}`}
                >
                    {content}
                </button>
            )}
            {/* Tooltip when collapsed */}
            {!sidebarOpen && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-md opacity-0 group-hover/sidebar-item:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-lg">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                </div>
            )}
        </li>
    );
};

/* ───────────────────────── UpgradeCard ───────────────────────── */
const UpgradeCard = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
    const [dismissed, setDismissed] = useState(false);

    if (!sidebarOpen || dismissed) return null;
    return (
        <div className="w-full h-auto mb-3 p-3 border border-gray-100 rounded-[12px] bg-white shadow-sm flex flex-col gap-1.5">
            <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm text-gray-900 leading-none font-bold">5 Days left !</span>
                <div
                    onClick={() => setDismissed(true)}
                    className="bg-[#B3B3B3] rounded-full p-0.5 cursor-pointer hover:bg-gray-500 transition-colors flex items-center justify-center"
                >
                    <Icon icon={closeIcon} className="h-2 w-2 text-white" />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="w-full bg-gray-100 rounded-full h-[5px]">
                    <div className="bg-[var(--color-primary-500)] h-[5px] rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-[11px] text-gray-500 leading-normal font-normal">
                    Select best plan now and unlock all special features
                </p>
            </div>
            <button className="text-xs font-semibold text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] transition-colors flex items-center gap-1 mt-0.5 cursor-pointer">
                Select plan <span>›</span>
            </button>
        </div>
    );
};

/* ───────────────────────── Sidebar ───────────────────────── */
const Sidebar = () => {
    const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
    const { logout: signOut } = useAuth();

    return (
        <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-[2px]"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — uses the Figma ratio: 212 / 1440 ≈ 14.72vw on desktop.
                 On mobile it's a fixed-width overlay drawer.
                 On collapsed desktop it's a slim icon-rail. */}
            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-30
                    flex h-[100dvh] flex-col justify-between bg-white
                    transition-all duration-300 ease-in-out
                    border-r-[0.5px] border-gray-200
                    ${sidebarOpen
                        ? 'w-[75vw] sm:w-[280px] md:w-[240px] lg:w-[14.72vw] xl:w-[212px] 2xl:w-[240px]'
                        : 'w-[75vw] sm:w-[280px] md:w-[240px] lg:w-[60px] xl:w-[70px] 2xl:w-[80px]'}
                    ${sidebarOpen
                        ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'}
                `}
                style={{ minWidth: sidebarOpen ? undefined : undefined }}
            >
                {/* Logo Section */}
                <div className={`
                    relative flex items-center transition-all duration-300
                    ${sidebarOpen
                        ? 'pt-7 px-4 pb-5'
                        : 'pt-5 px-3 pb-3 justify-center'}
                `}>
                    <div className="flex items-center gap-3 w-full justify-start">
                        {sidebarOpen ? (
                            <Icon icon={logoSvg} className="h-7 xl:h-8 w-auto text-[var(--color-primary-500)]" />
                        ) : (
                            <Icon icon={letterLogo} className="h-7 xl:h-8 w-auto text-[var(--color-primary-500)]" />
                        )}
                    </div>

                    {/* Mobile Close Button */}
                    {sidebarOpen && (
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-gray-700 transition-colors absolute right-4 top-8"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}

                    {/* Desktop Toggle — aligned to logo level */}
                    <button
                        onClick={toggleSidebar}
                        className={`
                            absolute -right-3 top-[34px] z-40
                            w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md
                            items-center justify-center
                            text-gray-400 hover:text-[var(--color-primary-500)] hover:border-blue-200
                            transition-all duration-300 hidden lg:flex
                        `}
                        style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* Nav + Card + Footer — flex-1 so it fills remaining height */}
                <div className="flex-1 flex flex-col min-h-0">
                    <nav className={`
                        flex-1 flex flex-col custom-scrollbar
                        ${sidebarOpen ? 'px-4 overflow-y-auto' : 'px-2 overflow-visible'}
                    `}>
                        {/* Primary Nav */}
                        <ul className="space-y-0.5">
                            {navItems.map((item) => {
                                const component = (
                                    <SidebarItem
                                        key={item.to}
                                        to={item.to}
                                        label={item.label}
                                        icon={item.icon}
                                        end={item.end}
                                        sidebarOpen={sidebarOpen}
                                        onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                                    />
                                );

                                if (item.permission) {
                                    return (
                                        <PermissionGuard key={item.to} permission={item.permission}>
                                            {component}
                                        </PermissionGuard>
                                    );
                                }

                                return component;
                            })}
                        </ul>

                        {/* Spacer — pushes card to bottom */}
                        <div className="flex-1 min-h-[10px]" />

                        {/* Plan Card */}
                        <UpgradeCard sidebarOpen={sidebarOpen} />
                    </nav>

                    {/* Settings & Logout - Fixed at bottom */}
                    <div className={`
                        border-t border-gray-100 bg-white transition-all duration-300
                        ${sidebarOpen ? 'px-4 py-3' : 'px-2 py-2'}
                    `}>
                        <ul className="space-y-0.5">
                            <SidebarItem
                                to="/dashboard/settings"
                                label="Settings"
                                icon={settingsIcon}
                                sidebarOpen={sidebarOpen}
                                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            />
                            <SidebarItem
                                label="Logout"
                                icon={logout}
                                sidebarOpen={sidebarOpen}
                                onClick={signOut}
                                isLogout
                            />
                        </ul>
                    </div>
                </div>
            </aside>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { display: none; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
};

export default Sidebar;