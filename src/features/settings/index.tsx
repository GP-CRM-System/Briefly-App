import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import MyProfileTab from "./components/MyProfileTab";
import OrganizationProfileTab from "./components/OrganizationProfileTab";
import RolesPermissionsTab from "./components/RolesPermissionsTab";
import ConnectionsTab from "./components/ConnectionsTab";
import ImportsExportsTab from "./components/ImportsExportsTab";
import PaymentBillingTab from "./components/PaymentBillingTab";
import { User02Icon, Building01Icon, Shield01Icon, Link01Icon, ArrowDataTransferHorizontalIcon, CreditCardIcon } from "hugeicons-react";

const Settings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    
    const validTabs = ["profile", "org", "roles", "connections", "imports", "billing"] as const;
    const queryTab = searchParams.get("tab") || (location.state as any)?.tab;
    const initialTab = (queryTab && validTabs.includes(queryTab as any)) 
        ? (queryTab as typeof validTabs[number]) 
        : "profile";

    const [activeTab, setActiveTab] = useState<typeof validTabs[number]>(initialTab);

    useEffect(() => {
        const currentTab = searchParams.get("tab") || (location.state as any)?.tab;
        if (currentTab && validTabs.includes(currentTab as any)) {
            setActiveTab(currentTab as any);
        }
    }, [searchParams, location.state]);

    const handleTabChange = (tabId: typeof validTabs[number]) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    const menuItems = [
        { id: "profile" as const, label: "My Profile", icon: User02Icon },
        { id: "org" as const, label: "Organization Profile", icon: Building01Icon },
        { id: "roles" as const, label: "Roles & Permissions", icon: Shield01Icon },
        { id: "connections" as const, label: "Connections", icon: Link01Icon },
        { id: "imports" as const, label: "Imports & Exports", icon: ArrowDataTransferHorizontalIcon },
        { id: "billing" as const, label: "Payment & Billing", icon: CreditCardIcon },
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case "profile":
                return <MyProfileTab />;
            case "org":
                return <OrganizationProfileTab />;
            case "roles":
                return <RolesPermissionsTab />;
            case "connections":
                return <ConnectionsTab />;
            case "imports":
                return <ImportsExportsTab />;
            case "billing":
                return <PaymentBillingTab />;
            default:
                return <MyProfileTab />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-3.5 px-4.5 py-3.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                                isActive
                                    ? "bg-blue-50/80 text-blue-500"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-slate-50/50"
                            }`}
                        >
                            <Icon size={17} className={isActive ? "text-blue-500" : "text-gray-400"} />
                            <span className="text-left leading-none">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Panel Content */}
            <div className="lg:col-span-3 min-w-0 transition-opacity duration-200">
                {renderActiveTabContent()}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleUp {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease-out forwards;
                }
                .animate-scaleUp {
                    animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default Settings;
export { MyProfileTab, OrganizationProfileTab, RolesPermissionsTab, ConnectionsTab, ImportsExportsTab, PaymentBillingTab };
