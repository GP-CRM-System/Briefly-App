import type { Ticket, TicketFilterState } from "./types";

export const freshTicketFilters = (): TicketFilterState => ({
    status: new Set<string>(),
    priority: new Set<string>(),
    search: "",
});

export const countActiveFilters = (filters: TicketFilterState): number => {
    let count = 0;
    if (filters.status.size > 0) count++;
    if (filters.priority.size > 0) count++;
    return count;
};

export const getTicketStatusClasses = (status: string) => {
    switch (status) {
        case "OPEN":
            return {
                bg: "bg-blue-50/80",
                text: "text-blue-600",
                border: "border-blue-100",
            };
        case "PENDING":
            return {
                bg: "bg-amber-50/80",
                text: "text-amber-600",
                border: "border-amber-100",
            };
        case "CLOSED":
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
        default:
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
    }
};

export const getTicketPriorityClasses = (priority: string) => {
    switch (priority) {
        case "HIGH":
            return {
                bg: "bg-rose-50/80",
                text: "text-rose-600",
                border: "border-rose-100",
            };
        case "MEDIUM":
            return {
                bg: "bg-amber-50/80",
                text: "text-amber-600",
                border: "border-amber-100",
            };
        case "LOW":
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
        default:
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
    }
};

export const filterTickets = (tickets: Ticket[], search: string, filters: TicketFilterState): Ticket[] => {
    return tickets.filter((ticket) => {
        // Search filter
        if (search) {
            const query = search.toLowerCase();
            const idMatch = ticket.id?.toLowerCase().includes(query);
            const nameMatch = ticket.customerName?.toLowerCase().includes(query) || ticket.name?.toLowerCase().includes(query);
            if (!idMatch && !nameMatch) return false;
        }

        // Status filter
        if (filters.status.size > 0 && !filters.status.has(ticket.status)) {
            return false;
        }

        // Priority filter
        if (filters.priority.size > 0 && !filters.priority.has(ticket.priority)) {
            return false;
        }

        return true;
    });
};

export const MOCK_TICKETS: Ticket[] = [
    {
        id: "TCK-1245",
        name: "Flight cancellation refund request",
        customerName: "Ahmed Hassan",
        customerEmail: "ahmedhassan55@gmail.com",
        customerPhone: "+201068551047",
        customerId: "cust-1",
        orderId: "ORD-1245",
        status: "OPEN",
        priority: "HIGH",
        subject: "Flight cancellation refund request",
        description: "Hi Support Team,\n\nI recently booked a flight from New York to London (Order ID: ORD-5821), but I received an email stating that the flight has been cancelled due to operational reasons.\n\nI would like to know the process for requesting a full refund, as I won't be able to rebook the trip on a later flight.\n\nCould you please confirm the next steps and let me know if you need any additional details from my side to proceed with the refund request as soon as possible?\n\nThanks,\nAhmed Hassan",
        assignee: "Admin User",
        createdAt: "2026-04-22T10:57:00.000Z",
        updatedAt: "2026-06-02T04:44:00.000Z",
        notes: [
            {
                id: "tn-1",
                content: "Assigned to Admin User for express verification with carrier partner.",
                createdAt: "2026-04-22T11:30:00.000Z",
                author: "System"
            }
        ]
    },
    {
        id: "TCK-1246",
        name: "Login portal issue",
        customerName: "Ali Ibrahim",
        customerEmail: "ali.ibrahim@example.com",
        customerPhone: "+201145678901",
        customerId: "cust-2",
        status: "PENDING",
        priority: "MEDIUM",
        subject: "Cannot sign in to dashboard",
        description: "Customer reports 500 error when clicking standard google login button. Tested locally, credentials appear valid.",
        assignee: "Sarah Ahmed",
        createdAt: "2026-04-23T08:15:00.000Z",
        updatedAt: "2026-04-23T12:00:00.000Z",
    },
    {
        id: "TCK-1247",
        name: "Broken item delivery",
        customerName: "Omar Sherif",
        customerEmail: "omar.sherif@example.com",
        customerPhone: "+201234567890",
        customerId: "cust-3",
        orderId: "ORD-1247",
        status: "CLOSED",
        priority: "LOW",
        subject: "Table corner chipped",
        description: "Table arrived with minor scratches on top corner and minor wood chipping. Sent partial refund of $150.",
        assignee: "Admin User",
        createdAt: "2026-04-24T14:00:00.000Z",
        updatedAt: "2026-04-25T11:00:00.000Z",
    }
];
