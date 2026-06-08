import { useState } from "react";
import { useConnections, useConnectMeta, useUpdateIntegration, useDeleteIntegration, useTestConnection } from "../settings.hooks";
import { inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { Message01Icon, Message02Icon, Settings01Icon, Unlink01Icon, Shield01Icon, Link01Icon, Cancel01Icon } from "hugeicons-react";

interface ChannelDef {
    key: "whatsapp" | "messenger" | "instagram";
    label: string;
    icon: typeof Message01Icon;
    description: string;
    metadataField: string;
    metadataLabel: string;
    metadataPlaceholder: string;
}

const channels: ChannelDef[] = [
    {
        key: "whatsapp",
        label: "WhatsApp",
        icon: Message01Icon,
        description: "Send and receive WhatsApp messages via Cloud API.",
        metadataField: "whatsappPhoneNumberId",
        metadataLabel: "Phone Number ID",
        metadataPlaceholder: "1234567890",
    },
    {
        key: "messenger",
        label: "Facebook Messenger",
        icon: Message02Icon,
        description: "Connect your Facebook Page for Messenger conversations.",
        metadataField: "facebookPageId",
        metadataLabel: "Facebook Page ID",
        metadataPlaceholder: "987654321",
    },
    {
        key: "instagram",
        label: "Instagram",
        icon: Message02Icon,
        description: "Enable Instagram DM support via your Business Account.",
        metadataField: "instagramBusinessAccountId",
        metadataLabel: "Instagram Business Account ID",
        metadataPlaceholder: "178414XXXXXXXXX",
    },
];

const ChannelCard = ({ channel }: { channel: ChannelDef }) => {
    const { data: connections = [], isLoading } = useConnections();
    const connectMeta = useConnectMeta();
    const updateIntegration = useUpdateIntegration();
    const deleteIntegration = useDeleteIntegration();
    const testConnection = useTestConnection();

    const channelIntegration = connections.find(
        (c) => c.provider === "meta" && c.metadata?.[channel.metadataField]
    );

    const [showForm, setShowForm] = useState(false);
    const [accessToken, setAccessToken] = useState("");
    const [metadataValue, setMetadataValue] = useState("");
    const [name, setName] = useState(channel.label);

    const isEditing = !!channelIntegration;

    const handleConnect = () => {
        if (!metadataValue.trim()) {
            toast.error(`${channel.metadataLabel} is required`);
            return;
        }
        if (!isEditing && !accessToken.trim()) {
            toast.error("Access Token is required");
            return;
        }
        connectMeta.mutate(
            {
                channel: channel.key,
                accessToken: accessToken.trim() || "placeholder",
                name: name.trim() || undefined,
                metadata: { [channel.metadataField]: metadataValue.trim() },
            },
            {
                onSuccess: () => {
                    setAccessToken("");
                    setMetadataValue("");
                    setName(channel.label);
                    setShowForm(false);
                },
            }
        );
    };

    const handleSave = () => {
        if (!channelIntegration) return;
        if (!metadataValue.trim()) {
            toast.error(`${channel.metadataLabel} is required`);
            return;
        }
        const payload: Record<string, unknown> = {
            name: name.trim() || undefined,
            metadata: { ...channelIntegration.metadata, [channel.metadataField]: metadataValue.trim() },
        };
        if (accessToken.trim()) {
            payload.accessToken = accessToken.trim();
        }
        updateIntegration.mutate(
            { id: channelIntegration.id, ...payload },
            {
                onSuccess: () => {
                    setAccessToken("");
                    setShowForm(false);
                },
            }
        );
    };

    const handleUnlink = () => {
        if (!channelIntegration) return;
        if (
            window.confirm(
                `Are you sure you want to disconnect ${channel.label}? This will stop all messaging through this channel.`
            )
        ) {
            deleteIntegration.mutate(channelIntegration.id);
        }
    };

    const handleTest = () => {
        if (!channelIntegration) return;
        testConnection.mutate(channelIntegration.id);
    };

    const handleCancel = () => {
        setShowForm(false);
        if (channelIntegration) {
            setMetadataValue(channelIntegration.metadata?.[channel.metadataField] || "");
            setName(channelIntegration.name || channel.label);
        }
        setAccessToken("");
    };

    const openEdit = () => {
        if (!channelIntegration) return;
        setMetadataValue(channelIntegration.metadata?.[channel.metadataField] || "");
        setName(channelIntegration.name || channel.label);
        setAccessToken("");
        setShowForm(true);
    };

    const Icon = channel.icon;

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-10 bg-gray-100 rounded" />
            </div>
        );
    }

    if (channelIntegration && !showForm) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <Icon size={28} />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold text-gray-900">{channelIntegration.name}</h4>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    ACTIVE
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {channel.metadataLabel}: {channelIntegration.metadata?.[channel.metadataField]}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleTest}
                            disabled={testConnection.isPending}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                        >
                            <Settings01Icon size={14} />
                            {testConnection.isPending ? "Testing..." : "Test"}
                        </button>
                        <button
                            onClick={openEdit}
                            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleUnlink}
                            disabled={deleteIntegration.isPending}
                            className="px-4 py-2 border border-red-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <Unlink01Icon size={14} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-5">
                <span className={`p-3 rounded-2xl ${isEditing ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                    <Icon size={28} />
                </span>
                <div>
                    <h4 className="text-lg font-bold text-gray-900">{channel.label}</h4>
                    {isEditing ? (
                        <p className="text-sm text-green-600 font-semibold">Editing configuration</p>
                    ) : (
                        <p className="text-sm text-gray-400">{channel.description}</p>
                    )}
                </div>
            </div>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{channel.metadataLabel}</label>
                    <input
                        type="text"
                        placeholder={channel.metadataPlaceholder}
                        value={metadataValue}
                        onChange={(e) => setMetadataValue(e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                        Access Token {isEditing && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                    </label>
                    <input
                        type="password"
                        placeholder={isEditing ? "Enter new token or leave blank" : "Paste your token here"}
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Name</label>
                    <input
                        type="text"
                        placeholder={`My ${channel.label}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClasses}
                    />
                </div>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={updateIntegration.isPending}
                                className="flex-1 py-3 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Settings01Icon size={16} />
                                {updateIntegration.isPending ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="py-3 px-6 rounded-lg border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Cancel01Icon size={16} />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleConnect}
                            disabled={connectMeta.isPending}
                            className="w-full py-3 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Link01Icon size={16} />
                            {connectMeta.isPending ? "Connecting..." : `Connect ${channel.label}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetaConnections = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900">Meta Channels</h3>
                <p className="text-sm text-gray-400 mt-1">
                    Connect your Meta channels to enable messaging across WhatsApp, Facebook Messenger, and Instagram.
                    Each channel uses its own access token.
                </p>
            </div>

            {channels.map((ch) => (
                <ChannelCard key={ch.key} channel={ch} />
            ))}

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
};

export default MetaConnections;
