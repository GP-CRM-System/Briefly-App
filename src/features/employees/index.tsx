import { useState } from "react";
import { useNavigate } from "react-router-dom";

import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";

import type { Employee, EmployeeFilterState } from "./types";
import { useEmployees, useRemoveEmployee } from "./employee.hooks";
import { freshEmployeeFilters, filterEmployees, countActiveFilters, MOCK_EMPLOYEES } from "./utils";

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
    const { data: employees = MOCK_EMPLOYEES, isLoading } = useEmployees();
    const removeMutation = useRemoveEmployee();

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
                onExport={() => {}}
                onImport={() => {}}
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
