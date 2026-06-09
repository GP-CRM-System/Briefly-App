import { useParams, useNavigate } from "react-router-dom";
import { useConversationMessages, useSendMessage, useConversations } from "./conversation.hooks";
import MessageThread from "./components/MessageThread";
import MessageComposer from "./components/MessageComposer";
import { getProviderBadge, getStatusBadge } from "./utils";
import type { Conversation } from "./types";

const getInitials = (name: string | null | undefined) =>
    (name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

const ConversationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: conversations } = useConversations();
    const { data: messagesData, isLoading } = useConversationMessages(id);
    const sendMutation = useSendMessage(id);

    const conversation: Conversation | undefined = conversations?.find((c: Conversation) => c.id === id);
    const customerName = conversation?.customer?.name || "Unknown";
    const customerEmail = conversation?.customer?.email || "—";
    const messages = messagesData?.data ?? [];

    const handleSend = (content: string) => {
        sendMutation.mutate({ content, type: "text" });
    };

    const providerBadge = conversation ? getProviderBadge(conversation.provider || "") : null;
    const statusBadge = conversation ? getStatusBadge(conversation.status || "") : null;

    return (
        <div className="flex flex-col h-full max-w-[900px] mx-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/conversations")}>
                    Conversations
                </span>
                <span>&gt;</span>
                <span className="text-gray-900 font-bold">{customerName}</span>
            </div>

            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                {conversation && (
                    <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                                {getInitials(customerName)}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">{customerName}</h2>
                                <p className="text-xs text-gray-400">{customerEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {providerBadge && (
                                <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${providerBadge.classes}`}>
                                    {providerBadge.label}
                                </span>
                            )}
                            {statusBadge && (
                                <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${statusBadge.classes}`}>
                                    {statusBadge.label}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <MessageThread messages={messages} loading={isLoading} />

                <MessageComposer
                    onSend={handleSend}
                    disabled={sendMutation.isPending}
                />
            </div>
        </div>
    );
};

export default ConversationDetail;
