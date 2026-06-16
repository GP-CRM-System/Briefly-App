import { useState } from "react";
import MyProfileTab from "./components/MyProfileTab";
import OrganizationProfileTab from "./components/OrganizationProfileTab";
import RolesPermissionsTab from "./components/RolesPermissionsTab";
import ConnectionsTab from "./components/ConnectionsTab";
import ImportsExportsTab from "./components/ImportsExportsTab";
import AuditLogsTab from "./components/AuditLogsTab";
import PaymentBillingTab from "./components/PaymentBillingTab";
import { User02Icon, Building01Icon, Shield01Icon, Link01Icon, ArrowDataTransferHorizontalIcon, CreditCardIcon, ClipboardIcon } from "hugeicons-react";

const Settings = () => {
    const [activeTab, setActiveTab] = useState<"profile" | "org" | "roles" | "connections" | "imports" | "billing" | "audit">("profile");

    const menuItems = [
        { id: "profile" as const, label: "My Profile", icon: User02Icon },
        { id: "org" as const, label: "Organization Profile", icon: Building01Icon },
        { id: "roles" as const, label: "Roles & Permissions", icon: Shield01Icon },
        { id: "connections" as const, label: "Connections", icon: Link01Icon },
        { id: "imports" as const, label: "Imports & Exports", icon: ArrowDataTransferHorizontalIcon },
        { id: "audit" as const, label: "Audit Logs", icon: ClipboardIcon },
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
            case "audit":
                return <AuditLogsTab />;
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
                            onClick={() => setActiveTab(item.id)}
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
export { MyProfileTab, OrganizationProfileTab, RolesPermissionsTab, ConnectionsTab, ImportsExportsTab, AuditLogsTab, PaymentBillingTab };
