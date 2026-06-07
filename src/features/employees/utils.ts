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

export const MOCK_EMPLOYEES: Employee[] = [
    {
        id: "emp-1",
        name: "Sarah Ahmed",
        email: "sarahahmed44@gmail.com",
        phone: "+201068551047",
        role: "UIUX Designer",
        location: "New York",
        status: "active",
        createdAt: "2026-04-01T08:00:00.000Z",
        dealsWon: 24,
        revenueTarget: 94,
        activityLogs: [
            {
                id: "log-1",
                type: "lead_update",
                title: "Updated Lead: John Doe",
                description: "Status changed from In Progress to Qualified",
                createdAt: "2026-06-02T02:44:00.000Z", // 2 hours ago from local time 06:44:14
                metadata: {
                    leadId: "LD-9021",
                }
            },
            {
                id: "log-2",
                type: "campaign_create",
                title: "Created Campaign: Winter Sale",
                description: "Initialized a new email marketing campaign targeting 2,400 regional accounts for the seasonal promotion cycle.",
                createdAt: "2026-06-01T23:44:00.000Z", // 5 hours ago
            },
            {
                id: "log-3",
                type: "ticket_resolve",
                title: "Resolved Ticket #482",
                description: "Customer inquiry regarding API integration for Global Logistics Inc. was successfully resolved.",
                createdAt: "2026-06-01T10:00:00.000Z", // Yesterday
                metadata: {
                    priority: "High"
                }
            },
            {
                id: "log-4",
                type: "meeting_schedule",
                title: "Scheduled Meeting: Pipeline Review",
                description: "Organized a recurring weekly sync with the junior sales team to track progress on Q4 targets.",
                createdAt: "2026-05-30T09:00:00.000Z", // 3 days ago
            }
        ]
    },
    {
        id: "emp-2",
        name: "Ali Ibrahim",
        email: "ali.ibrahim@example.com",
        phone: "+201145678901",
        role: "Manager",
        location: "San Francisco, CA",
        status: "active",
        createdAt: "2026-04-05T09:00:00.000Z",
        dealsWon: 45,
        revenueTarget: 88,
        activityLogs: [
            {
                id: "log-5",
                type: "lead_update",
                title: "Assigned Lead: Bob Smith",
                createdAt: "2026-06-02T01:10:00.000Z",
            }
        ]
    },
    {
        id: "emp-3",
        name: "Omar Sherif",
        email: "omar.sherif@example.com",
        phone: "+201234567890",
        role: "Administrator",
        location: "Boston, MA",
        status: "active",
        createdAt: "2026-04-10T10:30:00.000Z",
        dealsWon: 12,
        revenueTarget: 70,
        activityLogs: [
            {
                id: "log-6",
                type: "ticket_resolve",
                title: "Closed System Audit #12",
                createdAt: "2026-06-01T15:20:00.000Z",
            }
        ]
    }
];
