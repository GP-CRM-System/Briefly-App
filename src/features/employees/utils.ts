import type { Employee, EmployeeFilterState } from "./types";

export const freshEmployeeFilters = (): EmployeeFilterState => ({
    role: new Set<string>(),
    status: new Set<string>(),
    search: "",
});

export const countActiveFilters = (filters: EmployeeFilterState): number => {
    let count = 0;
    if (filters.role.size > 0) count++;
    if (filters.status.size > 0) count++;
    return count;
};

export const getEmployeeInitials = (name = "") => {
    if (!name) return "EM";
    return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

export const getEmployeeColor = (name = "") => {
    const colors = [
        "bg-blue-500 text-white",
        "bg-emerald-500 text-white",
        "bg-indigo-500 text-white",
        "bg-purple-500 text-white",
        "bg-amber-500 text-white",
        "bg-rose-500 text-white",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
};

export const filterEmployees = (employees: Employee[], search: string, filters: EmployeeFilterState): Employee[] => {
    return employees.filter((emp) => {
        // Search filter
        if (search) {
            const query = search.toLowerCase();
            const nameMatch = emp.name?.toLowerCase().includes(query);
            const emailMatch = emp.email?.toLowerCase().includes(query);
            const roleMatch = emp.role?.toLowerCase().includes(query);
            if (!nameMatch && !emailMatch && !roleMatch) return false;
        }

        // Role filter
        if (filters.role.size > 0 && !filters.role.has(emp.role)) {
            return false;
        }

        // Status filter
        if (filters.status.size > 0 && emp.status && !filters.status.has(emp.status)) {
            return false;
        }

        return true;
    });
};


