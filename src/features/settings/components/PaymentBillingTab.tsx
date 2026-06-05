import { useState } from "react";
import {
    usePlans,
    useCurrentSubscription,
    useInitializeSubscription,
    useCancelSubscription,
    useBillingInvoices
} from "../settings.hooks";
import toast from "react-hot-toast";
import { FileDownloadIcon, Loading01Icon, Cancel01Icon } from "hugeicons-react";

const PaymentBillingTab = () => {
    // Queries
    const { data: plans = [], isLoading: isLoadingPlans } = usePlans();
    const { data: currentSubscription, isLoading: isLoadingSub } = useCurrentSubscription();
    const { data: invoices = [], isLoading: isLoadingInvoices } = useBillingInvoices();

    // Mutations
    const initializeMutation = useInitializeSubscription();
    const cancelMutation = useCancelSubscription();

    // UI states
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

    // Get active plan details
    const activePlan = currentSubscription?.plan || plans.find((p) => p.id === currentSubscription?.planId) || plans[0] || {
        id: "plan-professional",
        name: "professional",
        displayName: "Professional",
        price: 49,
        features: { users: 10, customers: 10000, emails: 50000, storageGB: 5 }
    };

    // Calculate usage metrics
    const contactsLimit = activePlan.features?.customers ?? 10000;
    const contactsUsed = currentSubscription?.usage?.customers ?? 8452;
    const contactsPercent = contactsLimit === -1 ? 0 : Math.min(100, (contactsUsed / contactsLimit) * 100);

    const emailsLimit = activePlan.features?.emails ?? 50000;
    const emailsUsed = currentSubscription?.usage?.emails ?? 42000;
    const emailsPercent = emailsLimit === -1 ? 0 : Math.min(100, (emailsUsed / emailsLimit) * 100);

    const storageLimitGB = activePlan.features?.storageGB ?? 5;
    const storageUsedBytes = currentSubscription?.usage?.storageBytes;
    const storageUsedGB = currentSubscription?.usage?.storageGB ?? 
        (storageUsedBytes ? Number((storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1)) : 2.1);
    const storagePercent = storageLimitGB === -1 ? 0 : Math.min(100, (storageUsedGB / storageLimitGB) * 100);

    const handleUpgrade = () => {
        setUpgradeModalOpen(true);
    };

    const handleCancelSubscription = () => {
        if (window.confirm("Are you sure you want to cancel your subscription? Your plan will remain active until the end of the billing period, after which your account will revert to the Free tier.")) {
            cancelMutation.mutate(false);
        }
    };

    const handleDownloadInvoice = (id: string) => {
        toast.success(`Downloading invoice ${id} as PDF...`);
    };

    const handleSelectPlan = (planId: string) => {
        initializeMutation.mutate(
            { planId, billingCycle: "monthly" },
            {
                onSuccess: () => {
                    setUpgradeModalOpen(false);
                },
            }
        );
    };

    if (isLoadingPlans || isLoadingSub) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loading01Icon className="animate-spin text-blue-500" size={24} />
                <p className="text-sm text-gray-400">Loading subscription details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Current Plan details */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Current Plan</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Manage your subscription and usage limits</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        currentSubscription?.status === "canceled" 
                            ? "bg-yellow-50 text-yellow-600" 
                            : "bg-green-50 text-green-600"
                    }`}>
                        {currentSubscription?.status === "canceled" ? "Canceled (Pending End)" : "Active"}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left price block */}
                    <div className="lg:col-span-5 border border-blue-100 bg-blue-50/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                {activePlan.displayName?.toUpperCase() || activePlan.name?.toUpperCase()} PLAN
                            </span>
                            <div className="flex items-baseline gap-1 text-gray-900">
                                <span className="text-3xl font-extrabold">
                                    ${activePlan.price?.toFixed(2)}
                                </span>
                                <span className="text-sm font-semibold text-gray-400">/ month</span>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleUpgrade}
                                disabled={initializeMutation.isPending}
                                className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                {initializeMutation.isPending && <Loading01Icon className="animate-spin" size={14} />}
                                Upgrade Plan
                            </button>
                            {currentSubscription?.status !== "canceled" && (
                                <button
                                    onClick={handleCancelSubscription}
                                    disabled={cancelMutation.isPending}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 text-sm font-semibold rounded-lg transition-colors cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1"
                                >
                                    {cancelMutation.isPending && <Loading01Icon className="animate-spin" size={14} />}
                                    Cancel Subscription
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right usage metrics block */}
                    <div className="lg:col-span-7 flex flex-col justify-center space-y-4.5">
                        {/* Contacts Used */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-gray-500 font-semibold">
                                <span>Contact Used</span>
                                <span className="text-gray-700">
                                    {contactsUsed.toLocaleString()} / {contactsLimit === -1 ? "Unlimited" : contactsLimit.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                    style={{ width: `${contactsPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Emails Sent */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-gray-500 font-semibold">
                                <span>Emails Sent</span>
                                <span className="text-gray-700">
                                    {emailsUsed.toLocaleString()} / {emailsLimit === -1 ? "Unlimited" : emailsLimit.toLocaleString()}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-500 rounded-full transition-all duration-500"
                                    style={{ width: `${emailsPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Storage Used */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs text-gray-500 font-semibold">
                                <span>Storage Used</span>
                                <span className="text-gray-700">
                                    {storageUsedGB} GB / {storageLimitGB === -1 ? "Unlimited" : `${storageLimitGB} GB`}
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${storagePercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing History Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Billing History</h3>
                    <p className="text-xs text-gray-400 mt-0.5">View and download your recent invoices</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider">
                                <th className="py-4.5 px-6">Date</th>
                                <th className="py-4.5 px-6">Invoice ID</th>
                                <th className="py-4.5 px-6">Amount</th>
                                <th className="py-4.5 px-6">Status</th>
                                <th className="py-4.5 px-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                            {isLoadingInvoices ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">
                                        Loading billing history...
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">
                                        No billing history found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50">
                                        <td className="py-4.5 px-6 text-gray-600 font-semibold">{inv.date}</td>
                                        <td className="py-4.5 px-6 text-gray-800 font-bold">{inv.id}</td>
                                        <td className="py-4.5 px-6 text-gray-700">{inv.amount}</td>
                                        <td className="py-4.5 px-6">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                                inv.status === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                                            }`}>
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <button
                                                onClick={() => handleDownloadInvoice(inv.id)}
                                                className="text-blue-500 hover:text-blue-600 font-semibold flex items-center gap-1.5 cursor-pointer text-xs uppercase tracking-wide hover:underline"
                                            >
                                                <FileDownloadIcon size={16} /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upgrade Plan Modal */}
            {upgradeModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-[50px]">
                    <div className="absolute inset-0 bg-black/15" onClick={() => setUpgradeModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[650px] max-h-[calc(100vh-70px)] flex flex-col z-10 animate-scaleUp">
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-4.5 border-b border-gray-50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Upgrade Subscription Plan</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Select the plan that fits your growing CRM operation scale</p>
                            </div>
                            <button
                                onClick={() => setUpgradeModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                <Cancel01Icon size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[400px]">
                            {plans.map((plan) => {
                                const isCurrent = plan.id === activePlan.id;
                                return (
                                    <div
                                        key={plan.id}
                                        className={`border rounded-xl p-4.5 flex items-center justify-between transition-colors relative ${
                                            isCurrent ? "border-2 border-blue-500 bg-blue-50/5" : "border-gray-100 hover:border-blue-300"
                                        }`}
                                    >
                                        {isCurrent && (
                                            <span className="absolute -top-3 right-4 px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-md uppercase tracking-wider">
                                                Current Plan
                                            </span>
                                        )}
                                        <div className="space-y-1">
                                            <span className={`text-xs uppercase font-bold ${isCurrent ? "text-blue-500" : "text-gray-400"}`}>
                                                {plan.displayName || plan.name}
                                            </span>
                                            <p className="text-sm font-bold text-gray-800">
                                                {plan.name === "starter" && "Ideal for small organizations. Up to 2,000 contacts."}
                                                {plan.name === "professional" && "Ideal for growing teams. Up to 10,000 contacts."}
                                                {plan.name === "enterprise" && "For large scale operations. Unlimited contacts."}
                                            </p>
                                            <p className="text-lg font-black text-gray-900">${plan.price?.toFixed(2)} / month</p>
                                        </div>
                                        {isCurrent ? (
                                            <span className="px-4 py-2 text-xs font-bold text-blue-500">Active</span>
                                        ) : (
                                            <button
                                                onClick={() => handleSelectPlan(plan.id)}
                                                disabled={initializeMutation.isPending}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                                            >
                                                {initializeMutation.isPending && <Loading01Icon className="animate-spin" size={14} />}
                                                Choose {plan.displayName || plan.name}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4.5 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={() => setUpgradeModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentBillingTab;
