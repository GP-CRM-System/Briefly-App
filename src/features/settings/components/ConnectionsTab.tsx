import { useState } from "react";
import { useConnections, useConnectShopify, useDeleteIntegration, useTestConnection, useSyncConnection, useSyncLogs } from "../settings.hooks";
import { inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { ShopifyIcon, Settings01Icon, Unlink01Icon, ArrowDown01Icon, ArrowUp01Icon, InformationCircleIcon, Shield01Icon, ArrowReloadHorizontalIcon, Cancel01Icon } from "hugeicons-react";

const ConnectionsTab = () => {
    const { data: connections = [], isLoading } = useConnections();
    const connectShopifyMutation = useConnectShopify();
    const deleteIntegrationMutation = useDeleteIntegration();
    const testConnectionMutation = useTestConnection();
    const syncConnectionMutation = useSyncConnection();

    // UI states
    const [detailsOpen, setDetailsOpen] = useState(true);
    const [logsModalOpen, setLogsModalOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Connect form states
    const [shopDomain, setShopDomain] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [storeName, setStoreName] = useState("");

    // Shopify specific configurations (interactive states)
    const [autoSync, setAutoSync] = useState(true);
    const [syncDirection, setSyncDirection] = useState("Import only");
    const [selectedData, setSelectedData] = useState({
        customers: true,
        orders: true,
        products: true,
        revenue: true,
        refunds: false
    });

    const activeConn = connections[0];
    const { data: logs = [] } = useSyncLogs(activeConn?.id || "", logsModalOpen && !!activeConn);

    const handleSyncNow = () => {
        if (!activeConn) return;
        setSyncing(true);
        syncConnectionMutation.mutate(activeConn.id, {
            onSuccess: () => {
                setTimeout(() => setSyncing(false), 1500);
            },
            onError: () => setSyncing(false)
        });
    };

    const handleUnlink = () => {
        if (!activeConn) return;
        if (window.confirm("Are you sure you want to unlink your Shopify store? This will stop all synchronization services immediately.")) {
            deleteIntegrationMutation.mutate(activeConn.id);
        }
    };

    const handleConfigure = () => {
        if (!activeConn) return;
        testConnectionMutation.mutate(activeConn.id);
    };

    const handleConnect = () => {
        if (!shopDomain.trim() || !accessToken.trim()) {
            toast.error("Shop domain and access token are required");
            return;
        }
        connectShopifyMutation.mutate({
            shopDomain: shopDomain.trim(),
            accessToken: accessToken.trim(),
            name: storeName.trim() || undefined,
        }, {
            onSuccess: () => {
                setShopDomain("");
                setAccessToken("");
                setStoreName("");
            }
        });
    };

    if (isLoading) {
        return <div className="text-center py-12 text-gray-400 animate-pulse font-semibold">Loading integration details...</div>;
    }

    // ─── No Connection: Show Connect Form ───
    if (!activeConn) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <span className="p-5 bg-green-50 text-green-600 rounded-2xl">
                            <ShopifyIcon size={48} />
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Connect Your Shopify Store</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
                            Link your Shopify store to automatically sync customers, orders, and products into your CRM.
                        </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Store Name (optional)</label>
                            <input
                                type="text"
                                placeholder="My Awesome Store"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Shop Domain</label>
                            <input
                                type="text"
                                placeholder="my-store.myshopify.com"
                                value={shopDomain}
                                onChange={(e) => setShopDomain(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Access Token</label>
                            <input
                                type="password"
                                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
                                value={accessToken}
                                onChange={(e) => setAccessToken(e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <button
                            onClick={handleConnect}
                            disabled={connectShopifyMutation.isPending}
                            className="w-full py-3 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <ShopifyIcon size={16} />
                            {connectShopifyMutation.isPending ? "Connecting..." : "Connect Shopify Store"}
                        </button>
                    </div>
                </div>

                {/* Encrypted Data Transfer Card */}
                <div className="bg-slate-50/50 rounded-xl border border-gray-100/60 p-5 flex items-start gap-4">
                    <span className="p-3 bg-blue-50 text-blue-500 rounded-xl flex-shrink-0">
                        <Shield01Icon size={18} />
                    </span>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Encrypted Data Transfer</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            All connections are secured using 256-bit AES encryption. We do not store your third-party account credentials; we use secure OAuth tokens for all authorized communications.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Active Connection View ───
    return (
        <div className="space-y-6">
            {/* Top Shopify Connection Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <span className="p-4 bg-green-50 text-green-600 rounded-2xl flex-shrink-0">
                        <ShopifyIcon size={32} />
                    </span>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-gray-900">{activeConn.name}</h4>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                ACTIVE
                            </span>
                        </div>
                        {activeConn.url && (
                            <a
                                href={`https://${activeConn.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold text-blue-500 hover:text-blue-600 hover:underline flex items-center gap-1"
                            >
                                {activeConn.url}
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-medium">
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Connected {activeConn.connectedAt}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                By {activeConn.connectedBy}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleConfigure}
                        disabled={testConnectionMutation.isPending}
                        className="flex-1 md:flex-none px-4.5 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Settings01Icon size={16} /> {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
                    </button>
                    <button
                        onClick={handleUnlink}
                        disabled={deleteIntegrationMutation.isPending}
                        className="flex-1 md:flex-none px-4.5 py-2.5 border border-red-100 text-red-600 bg-white hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Unlink01Icon size={16} /> Unlink
                    </button>
                </div>
            </div>

            {/* Sync Alert card */}
            <div className="bg-blue-50/40 rounded-xl border border-blue-100/60 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-3">
                    <InformationCircleIcon size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Automatic Syncing Active</h4>
                        <p className="text-xs text-blue-700/80 mt-0.5">
                            Your Shopify store is currently pushing real-time updates for orders and customers.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setLogsModalOpen(true)}
                    className="px-4.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                    View Sync Logs
                </button>
            </div>

            {/* Connection Details (collapsible) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                    onClick={() => setDetailsOpen(!detailsOpen)}
                    className="w-full flex items-center justify-between px-6 py-4.5 border-b border-gray-50 bg-slate-50/30 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                    <h3 className="text-base font-bold text-gray-900">Connection Details</h3>
                    {detailsOpen ? <ArrowUp01Icon size={18} className="text-gray-400" /> : <ArrowDown01Icon size={18} className="text-gray-400" />}
                </button>

                {detailsOpen && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideDown">
                        {/* Sync Settings */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sync Settings</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Auto Sync</label>
                                    <button
                                        onClick={() => setAutoSync(!autoSync)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            autoSync ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                                        }`}
                                    >
                                        {autoSync ? "ENABLED" : "DISABLED"}
                                    </button>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1">Sync Frequency</label>
                                    <span className="text-sm font-bold text-gray-800">{activeConn.syncFrequency || "Real-time (Instant)"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Data to Sync */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data to Sync</h4>
                            <div className="space-y-2">
                                {Object.keys(selectedData).map((key) => {
                                    const value = selectedData[key as keyof typeof selectedData];
                                    return (
                                        <label key={key} className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={value}
                                                onChange={(e) =>
                                                    setSelectedData(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))
                                                }
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                            <span className="capitalize">{key}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Sync Direction */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sync Direction</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-1.5">Direction</label>
                                    <select
                                        value={syncDirection}
                                        onChange={(e) => setSyncDirection(e.target.value)}
                                        className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
                                    >
                                        <option value="Import only">Import only</option>
                                        <option value="Export only">Export only</option>
                                        <option value="Two-way Sync">Two-way Sync</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600 block mb-0.5">Conflict Handling</label>
                                    <span className="text-sm font-bold text-gray-800">{activeConn.conflictHandling || "Shopify wins"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Last Sync */}
                        <div className="space-y-4 flex flex-col justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Sync</h4>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-800">{activeConn.lastSyncAt}</span>
                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-md">
                                        SUCCESS
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleSyncNow}
                                disabled={syncing}
                                className="w-full h-11 border border-blue-200 hover:bg-blue-50 text-blue-500 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <ArrowReloadHorizontalIcon size={16} className={`${syncing ? "animate-spin" : ""}`} />
                                {syncing ? "Syncing..." : "Sync Now"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Encrypted Data Transfer Card */}
            <div className="bg-slate-50/50 rounded-xl border border-gray-100/60 p-5 flex items-start gap-4">
                <span className="p-3 bg-blue-50 text-blue-500 rounded-xl flex-shrink-0">
                    <Shield01Icon size={18} />
                </span>
                <div>
                    <h4 className="text-sm font-bold text-gray-800">Encrypted Data Transfer</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        All connections are secured using 256-bit AES encryption. We do not store your third-party account credentials; we use secure OAuth tokens for all authorized communications.
                    </p>
                </div>
            </div>

            {/* Sync Logs Modal */}
            {logsModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-[50px]">
                    <div className="absolute inset-0 bg-black/15" onClick={() => setLogsModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[650px] max-h-[calc(100vh-70px)] flex flex-col z-10 animate-scaleUp">
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-4.5 border-b border-gray-50">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Shopify Sync Logs</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Review recent synchronization event operations</p>
                            </div>
                            <button
                                onClick={() => setLogsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                <Cancel01Icon size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-modal-scroll">
                            {logs.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No sync logs available yet.</div>
                            ) : (
                                logs.map((log) => {
                                    const levelColor =
                                        log.level === "error" ? "text-red-500 bg-red-50" :
                                        log.level === "warning" ? "text-orange-500 bg-orange-50" :
                                        "text-blue-500 bg-blue-50";

                                    return (
                                        <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3 text-xs">
                                            <span className={`px-2 py-0.5 rounded font-bold uppercase ${levelColor}`}>
                                                {log.level}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-gray-700 leading-relaxed">{log.message}</p>
                                                <span className="text-[10px] text-gray-400 mt-1 block">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-50 flex justify-end">
                            <button
                                onClick={() => setLogsModalOpen(false)}
                                className="px-4.5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
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

export default ConnectionsTab;
