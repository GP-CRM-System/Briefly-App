import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Ticket, TicketFilterState } from "./types";
import { useTickets, useUpdateTicket } from "./ticket.hooks";
import { freshTicketFilters, filterTickets, countActiveFilters, MOCK_TICKETS } from "./utils";

import { columns } from "./components/TicketColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import TicketFormModal from "./components/TicketFormModal";

const Tickets = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<TicketFilterState>(freshTicketFilters());

    /* Modal state */
    const [modalOpen, setModalOpen] = useState(false);

    /* ── Data ── */
    const { data: tickets = MOCK_TICKETS, isLoading } = useTickets();
    const updateMutation = useUpdateTicket();

    /* ── Row actions ── */
    const handleView    = (t: Ticket) => navigate(`/dashboard/tickets/${t.id}`);
    const handleResolve = (t: Ticket) => {
        updateMutation.mutate({
            id: t.id,
            payload: { status: "resolved" }
        });
    };

    /* ── Derived data ── */
    const filtered = filterTickets(tickets, search, activeFilters);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search"
                onSearch={setSearch}
                filterCount={countActiveFilters(activeFilters)}
                onFilter={() => setFilterOpen((p) => !p)}
                onExport={() => {}}
                onImport={() => {}}
                onCreate={() => setModalOpen(true)}
                createLabel="Create Ticket"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                    />
                }
            >
                <DataTable<Ticket>
                    columns={columns}
                    data={filtered}
                    pageSize={9}
                    selectable
                    loading={isLoading}
                    rowKey="id"
                    renderRowAction={(row) => (
                        <ActionMenu
                            row={row}
                            onView={handleView}
                            onResolve={handleResolve}
                        />
                    )}
                    emptyMessage="No tickets found"
                />
            </PageLayout>

            <TicketFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};

export default Tickets;
