import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Conversation } from "./types";
import { useConversations } from "./conversation.hooks";
import { MOCK_CONVERSATIONS } from "./utils";

import { columns } from "./components/ConversationColumns";
import ActionMenu from "./components/ActionMenu";

const Conversations = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const { data: conversations = MOCK_CONVERSATIONS, isLoading } = useConversations();

    const handleView = (c: Conversation) => navigate(`/dashboard/conversations/${c.id}`);

    const handleDelete = (c: Conversation) => {
        if (!window.confirm(`Delete conversation with "${c.customer?.name || "Unknown"}"?`)) return;
    };

    const filtered = search
        ? conversations.filter((c: Conversation) =>
            (c.customer?.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.customer?.email || "").toLowerCase().includes(search.toLowerCase())
          )
        : conversations;

    return (
        <PageLayout
            searchValue={search}
            searchPlaceholder="Search conversations..."
            onSearch={setSearch}
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
    );
};

export default Conversations;
