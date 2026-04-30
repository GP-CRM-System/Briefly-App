import { NavLink } from "react-router-dom";
import { Icon } from "@/core/components";
import {home,contact,companies,deals,tickets,order,employee,analytics} from "@/assets/icons";

const navItems = [
    { to: "/dashboard", label: "Home", icon: home, end: true },
    { to: "/dashboard/contact", label: "Contact", icon: contact, permission: "Contact.read" },
    { to: "/dashboard/companies", label: "Companies", icon: companies, permission: "Company.read" },
    { to: "/dashboard/deals", label: "Deals", icon: deals, permission: "Deal.read" },
    { to: "/dashboard/tickets", label: "Tickets", icon: tickets, permission: "Ticket.read" },
    { to: "/dashboard/order", label: "Order", icon: order, permission: "Order.read" },
    { to: "/dashboard/employee", label: "Employee", icon: employee, permission: "Employee.read" },
    { to: "/dashboard/analytics", label: "Analytics", icon: analytics, permission: "Analytics.read" },
];

type SidebarProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30
                flex h-screen flex-col bg-white
                transition-all duration-300 ease-in-out
                ${isOpen ? 'w-[240px]' : 'w-20'}
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                custom-scrollbar
            `}>
                {/* Arrow Toggle Button - Sidebar Edge */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        absolute -right-3 top-20 z-40
                        w-6 h-6 bg-white border border-gray-100 rounded-full shadow-md
                        flex items-center justify-center
                        text-gray-400 hover:text-blue-500 hover:border-blue-100
                        transition-all duration-300 lg:flex
                    `}
                    style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>

                <div className="flex-1 flex flex-col min-h-0">
                    <nav className={`flex-1 px-4 py-6 flex flex-col custom-scrollbar ${isOpen ? 'overflow-y-auto' : 'overflow-visible'}`}>
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const linkContent = (
                                    <li key={item.to} className="relative group/sidebar-item">
                                        <NavLink
                                            to={item.to}
                                            end={item.end}
                                            onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center transition-all group ${isOpen ? 'px-4 h-[54px]' : 'p-3 justify-center'
                                                } ${isActive
                                                    ? 'bg-[#4A90E2] text-white rounded-lg shadow-sm'
                                                    : 'text-gray-500 hover:bg-gray-50 rounded-lg'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <div className="flex items-center gap-3">
                                                    <Icon
                                                        icon={item.icon}
                                                        className={`h-6 w-6 transition-all flex-shrink-0 ${isActive ? 'brightness-0 invert' : 'opacity-50 group-hover:opacity-100'
                                                            }`}
                                                    />
                                                    {isOpen && (
                                                        <span className="text-[17px] font-medium transition-opacity duration-300 whitespace-nowrap">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </NavLink>
                                        {!isOpen && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover/sidebar-item:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-lg tracking-wide uppercase">
                                                {item.label}
                                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                            </div>
                                        )}
                                    </li>
                                );

                                // Wrap with PermissionGuard if permission is required
                                // if (item.permission) {
                                //     return (
                                //         <PermissionGuard key={item.to} permission={item.permission}>
                                //             {linkContent}
                                //         </PermissionGuard>
                                //     );
                                // }

                                return linkContent;
                            })}
                        </ul>

                        {/* Spacer to push Settings & Logout to the bottom while staying in the same container */}
                        <div className="flex-1 min-h-[10px]" />

                        <ul className="space-y-2 pt-4">
                            <li className="relative group/sidebar-item">
                                <NavLink
                                    to='/dashboard/settings'
                                    onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center transition-all group ${isOpen ? 'px-4 h-[54px]' : 'p-3 justify-center'
                                        } ${isActive
                                            ? 'bg-[#4A90E2] text-white rounded-lg'
                                            : 'text-gray-500 hover:bg-gray-50 rounded-lg'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                icon={contact}
                                                className={`h-6 w-6 transition-all flex-shrink-0 ${isActive ? 'brightness-0 invert' : 'opacity-50 group-hover:opacity-100'
                                                    }`}
                                            />
                                            {isOpen && (
                                                <span className="text-[17px] font-medium transition-opacity duration-300 whitespace-nowrap">
                                                    Settings
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </NavLink>
                                {!isOpen && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover/sidebar-item:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-lg tracking-wide uppercase">
                                        Settings
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                    </div>
                                )}
                            </li>
                            <li className="relative group/sidebar-item">
                                {/* <button
                                    onClick={onLogout}
                                    className={`w-full flex items-center text-gray-500 transition-all hover:bg-red-50 hover:text-red-600 rounded-lg group ${isOpen ? 'px-4 h-[54px]' : 'p-3 justify-center'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={logout} alt="Logout icon" className="h-6 w-6 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:filter-red" />
                                        {isOpen && (
                                            <span className="text-[17px] font-medium transition-opacity duration-300 whitespace-nowrap">
                                                Logout
                                            </span>
                                        )}
                                    </div>
                                </button> */}
                                {!isOpen && (
                                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover/sidebar-item:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-lg tracking-wide uppercase">
                                        Logout
                                        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                    </div>
                                )}
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .custom-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default Sidebar;