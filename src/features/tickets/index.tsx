import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Ticket, TicketFilterState } from "./types";
import { useTickets, useUpdateTicket, useDeleteTicket } from "./ticket.hooks";
import { freshTicketFilters, filterTickets, countActiveFilters } from "./utils";

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
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    /* ── Data ── */
    const { data: tickets = [], isLoading, isError } = useTickets();
    const updateMutation = useUpdateTicket();
    const deleteMutation = useDeleteTicket();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load tickets</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

    /* ── Row actions ── */
    const handleView    = (t: Ticket) => navigate(`/dashboard/tickets/${t.id}`);
    const handleResolve = (t: Ticket) => {
        updateMutation.mutate({
            id: t.id,
            payload: { status: "CLOSED" }
        });
    };
    const handleEdit = (t: Ticket) => {
        setSelectedTicket(t);
        setModalOpen(true);
    };
    const handleDelete = (t: Ticket) => {
        if (window.confirm(`Are you sure you want to delete ticket "${t.subject}"?`)) {
            deleteMutation.mutate(t.id);
        }
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
                onCreate={() => {
                    setSelectedTicket(null);
                    setModalOpen(true);
                }}
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
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                    emptyMessage="No tickets found"
                />
            </PageLayout>

            <TicketFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket}
            />
        </>
    );
};

export default Tickets;
