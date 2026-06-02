export interface TicketNote {
    id: string;
    content: string;
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
    status: "open" | "pending" | "resolved" | "closed";
    priority: "low" | "medium" | "high";
    subject: string;
    description: string;
    assignee?: string;
    notes?: TicketNote[];
    createdAt: string;
    updatedAt: string;
}

export interface TicketFormData {
    name: string;
    customerName: string;
    subject: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "pending" | "resolved" | "closed";
    orderId?: string;
}

export interface TicketFilterState {
    status: Set<string>;
    priority: Set<string>;
    search: string;
}
