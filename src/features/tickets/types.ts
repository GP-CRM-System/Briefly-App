export interface TicketNote {
    id: string;
    content: string;
    body?: string;
    createdAt: string;
    author?: string;
}

export interface Ticket {
    id: string;
    name: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerId?: string;
    orderId?: string;
    status: "OPEN" | "PENDING" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    subject: string;
    description: string;
    assignee?: string;
    notes?: TicketNote[];
    createdAt: string;
    updatedAt: string;
    customer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        totalOrders?: number;
        totalSpent?: number;
        supportTicketsCount?: number;
        createdAt?: string;
    };
}

export interface TicketFormData {
    name: string;
    customerName: string;
    subject: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    status: "OPEN" | "PENDING" | "CLOSED";
    orderId?: string;
}

export interface TicketFilterState {
    status: Set<string>;
    priority: Set<string>;
    search: string;
}
