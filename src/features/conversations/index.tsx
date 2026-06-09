import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Conversation } from "./types";
import { useConversations } from "./conversation.hooks";
import { MOCK_CONVERSATIONS } from "./utils";

import { columns } from "./components/ConversationColumns";
import ActionMenu from "./components/ActionMenu";
import NewConversationModal from "./components/NewConversationModal";

const Conversations = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [newModalOpen, setNewModalOpen] = useState(false);

    const { data: conversations = MOCK_CONVERSATIONS, isLoading } = useConversations();

    const handleView = (c: Conversation) => navigate(`/dashboard/conversations/${c.id}`);

    const handleDelete = (c: Conversation) => {
        if (!window.confirm(`Delete conversation with "${c.customer?.name || "Unknown"}"?`)) return;
    };

    const handleNewSuccess = useCallback(
        (conversationId: string) => navigate(`/dashboard/conversations/${conversationId}`),
        [navigate]
    );

    const filtered = search
        ? conversations.filter((c: Conversation) =>
            (c.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.customer?.email || "").toLowerCase().includes(search.toLowerCase())
          )
        : conversations;

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search conversations..."
                onSearch={setSearch}
                onCreate={() => setNewModalOpen(true)}
                createLabel="New Conversation"
            >
                <DataTable<Conversation>
                    columns={columns}
                    data={filtered}
                    pageSize={9}
                    loading={isLoading}
                    rowKey="id"
                    renderRowAction={(row) => (
                        <ActionMenu
                            row={row}
                            onView={handleView}
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="No conversations found"
                />
            </PageLayout>

            <NewConversationModal
                open={newModalOpen}
                onClose={() => setNewModalOpen(false)}
                onSuccess={handleNewSuccess}
            />
        </>
    );
};

export default Conversations;
