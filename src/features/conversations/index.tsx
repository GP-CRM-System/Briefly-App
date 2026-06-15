import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search01Icon, PlusSignIcon, BubbleChatIcon, ArrowLeft01Icon, User02Icon } from "hugeicons-react";

import { useConversations, useConversationMessages, useSendMessage, useAssignConversation } from "./conversation.hooks";
import { useEmployees } from "@/features/employees/employee.hooks";
import { usePresenceStore } from "@/store/presence.store";
import { useAuthStore } from "@/store/auth.store";
import { getProviderBadge, getStatusBadge, formatConversationDate } from "./utils";
import MessageThread from "./components/MessageThread";
import MessageComposer from "./components/MessageComposer";
import NewConversationModal from "./components/NewConversationModal";
import { socket } from "@/lib/socket";
import type { Conversation, Message } from "./types";

const WhatsAppIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 0 0 1.37 5.054L2 22l5.132-1.347a9.936 9.936 0 0 0 4.877 1.28h.005c5.505 0 9.988-4.478 9.99-9.985 0-2.667-1.039-5.176-2.927-7.064A9.927 9.927 0 0 0 12.012 2zm5.727 14.168c-.314.88-1.56 1.613-2.15 1.702-.54.08-1.242.147-3.618-.836-3.037-1.258-4.996-4.346-5.148-4.55-.152-.202-1.22-1.623-1.22-3.1 0-1.477.743-2.204 1.01-2.477.214-.218.55-.327.89-.327.11 0 .21.005.3.015.267.01.6.023.864.654.276.66.942 2.302 1.023 2.47.082.167.137.36.027.575-.11.215-.246.348-.387.513-.141.166-.297.348-.126.643.328.567.73 1.033 1.25 1.493.67.596 1.234.98 1.884 1.3.176.086.37.078.498-.052.16-.162.686-.802.87-1.077.126-.192.3-.16.48-.095.18.065 1.157.545 1.356.645.2.1.332.15.38.23.048.083.048.484-.132 1.38z"/>
    </svg>
);

const MessengerIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.9 1.18 5.4 3.08 7.15.15.14.24.34.24.55l-.04 2.1c-.02.6.58 1.08 1.14.86l2.38-.95c.18-.07.39-.06.57.01 1.2.46 2.5.73 3.8.73 5.64 0 10-4.13 10-9.7C22 6.13 17.64 2 12 2zm1.25 12.87l-2.22-2.37-4.33 2.37c-.42.23-.88-.26-.6-.68l2.9-4.22 2.22 2.37 4.33-2.37c.42-.23.88.26.6.68l-2.9 4.22z"/>
    </svg>
);

const InstagramIcon = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
);

const getInitials = (name: string | null | undefined) =>
    (name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

const Conversations = () => {
    const navigate = useNavigate();
    const { id: activeId } = useParams<{ id: string }>();
    const [search, setSearch] = useState("");
    const [newModalOpen, setNewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"all" | "mine" | "unassigned">("all");
    const [assignOpen, setAssignOpen] = useState(false);

    const currentUserId = useAuthStore((state) => state.user?.id);
    const onlineUserIds = usePresenceStore((state) => state.onlineUsers);

    // Fetch conversations and employees
    const { data: conversations = [], isLoading: listLoading } = useConversations();
    const { data: employees = [] } = useEmployees();

    // Fetch messages for the active conversation
    const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(activeId);
    const sendMutation = useSendMessage(activeId);
    const assignMutation = useAssignConversation();

    const activeConversation = useMemo(() => 
        conversations.find((c: Conversation) => c.id === activeId),
        [conversations, activeId]
    );

    const messages = messagesData?.data ?? [];

    // Socket Room Joining
    useEffect(() => {
        if (!activeId) return;
        
        const joinRoom = () => {
            if (socket.connected) {
                socket.emit("join_conversation", { conversationId: activeId }, (res: any) => {
                    if (res?.success) {
                        console.log(`Joined conversation room: ${activeId}`);
                    } else {
                        console.warn(`Failed to join conversation room: ${activeId}`, res?.error);
                    }
                });
            }
        };

        joinRoom();

        // Listen for reconnects to automatically rejoin the room
        socket.on("connect", joinRoom);

        return () => {
            socket.off("connect", joinRoom);
            if (socket.connected) {
                socket.emit("leave_conversation", { conversationId: activeId });
            }
        };
    }, [activeId]);

    const handleSend = (content: string, type: "text" | "image" | "document" | "template" | "audio" | "video" = "text", metadata?: any) => {
        if (!activeId) return;
        sendMutation.mutate({ content, type, metadata });
    };

    const handleRetry = (msg: Message) => {
        if (!activeId) return;
        sendMutation.mutate({
            content: msg.content,
            type: msg.type,
            metadata: msg.metadata || undefined
        });
    };

    const handleTyping = (isTyping: boolean) => {
        if (!activeId) return;
        socket.emit("typing:status", { conversationId: activeId, isTyping });
    };

    const handleNewSuccess = useCallback(
        (conversationId: string) => {
            navigate(`/dashboard/conversations/${conversationId}`);
        },
        [navigate]
    );

    // Filter conversations based on tab and search
    const filteredConversations = useMemo(() => {
        let list = conversations;

        if (activeTab === "mine") {
            list = list.filter((c) => c.assignedAgentId === currentUserId);
        } else if (activeTab === "unassigned") {
            list = list.filter((c) => !c.assignedAgentId);
        }

        if (!search) return list;
        const query = search.toLowerCase();
        return list.filter((c: Conversation) =>
            (c.customer?.name || "").toLowerCase().includes(query) ||
            (c.customer?.email || "").toLowerCase().includes(query)
        );
    }, [conversations, activeTab, currentUserId, search]);

    const activeCustomerName = activeConversation?.customer?.name || "Unknown";
    const activeCustomerEmail = activeConversation?.customer?.email || "No email available";

    // Find assigned agent details
    const assignedAgent = useMemo(() => {
        if (!activeConversation?.assignedAgentId) return null;
        return employees.find((e: any) => e.userId === activeConversation.assignedAgentId);
    }, [activeConversation?.assignedAgentId, employees]);

    // Handle other users typing in the active conversation
    const typingUsersMap = usePresenceStore((state) => state.typingUsers);
    const otherTypingUsers = useMemo(() => {
        const typingUsers = typingUsersMap[activeId || ""] || [];
        return typingUsers.filter((uid) => uid !== currentUserId);
    }, [typingUsersMap, activeId, currentUserId]);

    const typingText = useMemo(() => {
        if (otherTypingUsers.length === 0) return "";
        const names = otherTypingUsers.map((uid) => {
            const emp = employees.find((e: any) => e.userId === uid);
            return emp ? (emp.name || emp.email) : "Someone";
        });
        if (names.length === 1) return `${names[0]} is typing...`;
        return `${names.join(", ")} are typing...`;
    }, [otherTypingUsers, employees]);

    return (
        <div className="flex-1 flex min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden -mx-4 md:mx-0">
            {/* Left Side: Conversations List */}
            <div className={`w-full md:w-[380px] flex flex-col border-r border-gray-100 ${activeId ? 'hidden md:flex' : 'flex'}`}>
                {/* Search & New Chat Header */}
                <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900">Chats</h1>
                        <button
                            onClick={() => setNewModalOpen(true)}
                            className="p-2 bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] rounded-xl transition-colors shadow-sm flex items-center justify-center cursor-pointer"
                        >
                            <PlusSignIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative">
                        <Search01Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search messages, names..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 focus:border-[var(--color-primary-400)] focus:bg-white rounded-xl outline-none transition-all placeholder:text-gray-400 text-gray-700"
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex border-b border-gray-100 px-4 py-2 gap-2 bg-gray-50/50">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            activeTab === "all"
                                ? "bg-white text-gray-900 shadow-xs border border-gray-100"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveTab("mine")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            activeTab === "mine"
                                ? "bg-white text-gray-900 shadow-xs border border-gray-100"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                        }`}
                    >
                        Mine
                    </button>
                    <button
                        onClick={() => setActiveTab("unassigned")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                            activeTab === "unassigned"
                                ? "bg-white text-gray-900 shadow-xs border border-gray-100"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                        }`}
                    >
                        Unassigned
                    </button>
                </div>

                {/* Conversations Scroll Area */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                    {listLoading ? (
                        <div className="p-8 text-center text-gray-400">Loading chats...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No conversations found</div>
                    ) : (
                        filteredConversations.map((c: Conversation) => {
                            const isSelected = c.id === activeId;
                            const customerName = c.customer?.name || "Unknown Customer";
                            const initials = getInitials(customerName);

                            return (
                                <div
                                    key={c.id}
                                    onClick={() => navigate(`/dashboard/conversations/${c.id}`)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        isSelected ? "bg-blue-50/50 hover:bg-blue-50/50" : ""
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200">
                                            {initials}
                                        </div>
                                        {/* Provider indicator icon */}
                                        <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-white shadow-sm flex items-center justify-center h-5 w-5 ${
                                            c.provider === "whatsapp"
                                                ? "bg-emerald-500"
                                                : c.provider === "facebook" || c.provider === "messenger"
                                                  ? "bg-blue-500"
                                                  : "bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white"
                                        }`}>
                                            {c.provider === "whatsapp" ? (
                                                <WhatsAppIcon className="h-3 w-3 text-white" />
                                            ) : c.provider === "instagram" ? (
                                                <InstagramIcon className="h-2.5 w-2.5 text-white" />
                                            ) : (
                                                <MessengerIcon className="h-3 w-3 text-white" />
                                            )}
                                        </span>
                                    </div>

                                    {/* Info Block */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{customerName}</h3>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatConversationDate(c.lastMessageAt || c.createdAt)}
                                            </span>
                                        </div>
                                        {/* Status, Assigned Agent and Unread count */}
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    c.status === "OPEN"
                                                        ? "text-emerald-600"
                                                        : c.status === "PENDING"
                                                          ? "text-amber-600"
                                                          : "text-gray-400"
                                                }`}>
                                                    {c.status}
                                                </span>
                                                {c.assignedAgentId && (
                                                    <span className="text-[9px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center justify-center">
                                                        <User02Icon className="h-4 w-4 mr-1" /> {employees.find((e: any) => e.userId === c.assignedAgentId)?.name || "Assigned"}
                                                    </span>
                                                )}
                                            </div>
                                            {c.unreadCount !== undefined && c.unreadCount > 0 && (
                                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center animate-pulse min-w-[18px] text-center">
                                                    {c.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right Side: Message Thread or Blank Slate */}
            <div className={`flex-1 flex flex-col bg-gray-50 h-full ${!activeId ? 'hidden md:flex' : 'flex'}`}>
                {activeId && activeConversation ? (
                    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f0f2f5]/40">
                        {/* Active Chat Header */}
                        <div className="border-b border-gray-100 px-6 py-3.5 flex items-center justify-between bg-white shadow-xs z-10">
                            <div className="flex items-center gap-3">
                                {/* Back button for mobile */}
                                <button
                                    onClick={() => navigate("/dashboard/conversations")}
                                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mr-1 cursor-pointer"
                                >
                                    <ArrowLeft01Icon className="h-5 w-5" />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-200">
                                    {getInitials(activeCustomerName)}
                                </div>
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">{activeCustomerName}</h2>
                                    <p className="text-xs text-gray-400 truncate max-w-[200px] md:max-w-md">{activeCustomerEmail}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Assignment Selector */}
                                <div className="relative">
                                    <button
                                        onClick={() => setAssignOpen(!assignOpen)}
                                        className="text-xs font-semibold border px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-xs flex items-center gap-1.5 text-gray-700 cursor-pointer"
                                    >
                                        <span className={`w-2 h-2 rounded-full ${assignedAgent ? "bg-blue-500" : "bg-gray-400"}`}></span>
                                        {assignedAgent ? `${assignedAgent.name || assignedAgent.email}` : "Unassigned"}
                                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {assignOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setAssignOpen(false)} />
                                            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in duration-100">
                                                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assign to Agent</div>
                                                <button
                                                    onClick={() => {
                                                        assignMutation.mutate({ conversationId: activeConversation.id, assignedAgentId: null });
                                                        setAssignOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-red-600 font-medium cursor-pointer"
                                                >
                                                    <span>Unassigned</span>
                                                </button>
                                                <div className="border-t border-gray-50 my-1"></div>
                                                {employees.map((emp: any) => {
                                                    if (!emp.userId) return null;
                                                    const isOnline = onlineUserIds.includes(emp.userId);
                                                    const isCurrentAssignment = emp.userId === activeConversation.assignedAgentId;
                                                    return (
                                                        <button
                                                            key={emp.id}
                                                            onClick={() => {
                                                                assignMutation.mutate({ conversationId: activeConversation.id, assignedAgentId: emp.userId! });
                                                                setAssignOpen(false);
                                                            }}
                                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer ${
                                                                isCurrentAssignment ? "bg-blue-50/50 text-[var(--color-primary-600)] font-medium" : "text-gray-700"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-2 truncate">
                                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-500" : "bg-gray-300"}`}></span>
                                                                <span className="truncate">{emp.name || emp.email}</span>
                                                            </div>
                                                            {isOnline && <span className="text-[9px] text-emerald-600 font-semibold uppercase">Online</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Claim Chat Shortcut */}
                                {!activeConversation.assignedAgentId && (
                                    <button
                                        onClick={() => assignMutation.mutate({ conversationId: activeConversation.id, assignedAgentId: currentUserId || null })}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100/50 transition-colors cursor-pointer"
                                    >
                                        Claim
                                    </button>
                                )}

                                <span className={`text-[11px] font-semibold border px-2.5 py-1 rounded-full flex items-center gap-1 ${
                                    getProviderBadge(activeConversation.provider).classes
                                }`}>
                                    {activeConversation.provider === "whatsapp" ? (
                                        <WhatsAppIcon className="h-3 w-3" />
                                    ) : activeConversation.provider === "instagram" ? (
                                        <InstagramIcon className="h-3 w-3" />
                                    ) : (
                                        <MessengerIcon className="h-3 w-3" />
                                    )}
                                    {getProviderBadge(activeConversation.provider).label}
                                </span>
                                <span className={`text-[11px] font-semibold border px-2.5 py-1 rounded-full ${
                                    getStatusBadge(activeConversation.status).classes
                                }`}>
                                    {getStatusBadge(activeConversation.status).label}
                                </span>
                            </div>
                        </div>

                        {/* Thread Scroll Box */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-[#efeae2] relative" style={{
                            backgroundImage: "radial-gradient(#dfdcd6 10%, transparent 10%)",
                            backgroundSize: "20px 20px"
                        }}>
                            <MessageThread messages={messages} loading={messagesLoading} onRetry={handleRetry} />
                        </div>

                        {/* Typing indicators */}
                        {typingText && (
                            <div className="px-6 py-1.5 bg-white border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500 italic">
                                <span className="flex gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                                {typingText}
                            </div>
                        )}

                        {/* Composer footer */}
                        <MessageComposer
                            onSend={handleSend}
                            onTyping={handleTyping}
                            disabled={sendMutation.isPending}
                            provider={activeConversation.provider}
                        />
                    </div>
                ) : (
                    /* Default Blank State Splash */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 animate-fade-in">
                        <div className="w-20 h-20 bg-blue-50 text-[var(--color-primary-500)] rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-inner">
                            <BubbleChatIcon className="h-10 w-10" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Briefly CRM Messaging</h2>
                        <p className="text-sm text-gray-500 max-w-sm mb-4">
                            Connect WhatsApp, Messenger, and Instagram. Manage conversations and customer requests in one real-time dashboard.
                        </p>
                        <button
                            onClick={() => setNewModalOpen(true)}
                            className="px-4 py-2 bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] font-semibold text-sm rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                            Start a Conversation
                        </button>
                    </div>
                )}
            </div>

            {/* New Conversation Modal */}
            <NewConversationModal
                open={newModalOpen}
                onClose={() => setNewModalOpen(false)}
                onSuccess={handleNewSuccess}
            />
        </div>
    );
};

export default Conversations;
