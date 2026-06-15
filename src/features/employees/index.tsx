import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Employee, EmployeeFilterState } from "./types";
import { useEmployees, useRemoveEmployee } from "./employee.hooks";
import { freshEmployeeFilters, filterEmployees, countActiveFilters } from "./utils";

import { columns } from "./components/EmployeeColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import InviteEmployeeModal from "./components/InviteEmployeeModal";

const Employees = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<EmployeeFilterState>(freshEmployeeFilters());

    /* Modal state */
    const [modalOpen, setModalOpen] = useState(false);

    /* ── Data ── */
    const { data: employees = [], isLoading, isError } = useEmployees();
    const removeMutation = useRemoveEmployee();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-red-100 rounded-2xl shadow-sm space-y-4 my-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Failed to load employees</h3>
                    <p className="text-sm text-gray-500 max-w-md">There was an error communicating with the API. Please check your connection or contact support.</p>
                </div>
            </div>
        );
    }

    /* ── Row actions ── */
    const handleView   = (e: Employee) => navigate(`/dashboard/employees/${e.id}`);
    const handleRemove = (e: Employee) => {
        if (!window.confirm(`Are you sure you want to remove "${e.name || e.email}" from the organization?`)) return;
        removeMutation.mutate(e.id);
    };

    /* ── Derived data ── */
    const filtered = filterEmployees(employees, search, activeFilters);

    return (
        <>
            <PageLayout
                searchValue={search}
                searchPlaceholder="Search"
                onSearch={setSearch}
                filterCount={countActiveFilters(activeFilters)}
                onFilter={() => setFilterOpen((p) => !p)}
                // onExport={() => {}}
                // onImport={() => {}}
                onCreate={() => setModalOpen(true)}
                createLabel="Invite Employee"
                filterContent={
                    <FilterPanel
                        open={filterOpen}
                        onClose={() => setFilterOpen(false)}
                        onApply={setActiveFilters}
                    />
                }
            >
                <DataTable<Employee>
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
                            onRemove={handleRemove}
                        />
                    )}
                    emptyMessage="No employees found"
                />
            </PageLayout>

            <InviteEmployeeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};

export default Employees;
