import type { Order, OrderFilterState } from "./types";

export const freshOrderFilters = (): OrderFilterState => ({
    fulfillmentStatus: new Set<string>(),
    paymentStatus: new Set<string>(),
    source: "",
    search: "",
});

export const countActiveFilters = (filters: OrderFilterState): number => {
    let count = 0;
    if (filters.fulfillmentStatus.size > 0) count++;
    if (filters.paymentStatus.size > 0) count++;
    if (filters.source) count++;
    return count;
};

export const getShippingStatusClasses = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
        case "delivered":
            return {
                bg: "bg-blue-50/80",
                text: "text-blue-600",
                border: "border-blue-100",
            };
        case "shipped":
            return {
                bg: "bg-indigo-50/80",
                text: "text-indigo-600",
                border: "border-indigo-100",
            };
        case "processing":
        case "pending":
            return {
                bg: "bg-amber-50/80",
                text: "text-amber-600",
                border: "border-amber-100",
            };
        case "cancelled":
        case "failed":
            return {
                bg: "bg-rose-50/80",
                text: "text-rose-600",
                border: "border-rose-100",
            };
        default:
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
    }
};

export const getPaymentStatusClasses = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
        case "paid":
        case "paid in full":
            return {
                bg: "bg-emerald-50/80",
                text: "text-emerald-600",
                border: "border-emerald-100",
            };
        case "pending":
            return {
                bg: "bg-amber-50/80",
                text: "text-amber-600",
                border: "border-amber-100",
            };
        case "failed":
        case "unpaid":
            return {
                bg: "bg-rose-50/80",
                text: "text-rose-600",
                border: "border-rose-100",
            };
        default:
            return {
                bg: "bg-gray-50/80",
                text: "text-gray-600",
                border: "border-gray-100",
            };
    }
};

export const filterOrders = (orders: Order[], search: string, filters: OrderFilterState): Order[] => {
    return orders.filter((order) => {
        // Search filter
        if (search) {
            const query = search.toLowerCase();
            const idMatch = order.id?.toLowerCase().includes(query);
            const nameMatch = order.customer?.name?.toLowerCase().includes(query);
            if (!idMatch && !nameMatch) return false;
        }

        // Fulfillment status filter
        if (filters.fulfillmentStatus.size > 0 && !filters.fulfillmentStatus.has(order.fulfillmentStatus || "")) {
            return false;
        }

        // Payment status filter
        if (filters.paymentStatus.size > 0 && !filters.paymentStatus.has(order.paymentStatus)) {
            return false;
        }

        // Source filter
        if (filters.source && order.source?.toLowerCase() !== filters.source.toLowerCase()) {
            return false;
        }

        return true;
    });
};

export const MOCK_ORDERS: Order[] = [
    {
        id: "ORD-1245",
        customer: {
            id: "cust-1",
            name: "Ahmed Hassan",
            email: "ahmedhassan55@gmail.com",
            phone: "+201068551047",
        },
        fulfillmentStatus: "delivered",
        paymentStatus: "failed",
        subtotal: 3100.00,
        discountAmount: 310.00,
        taxAmount: 223.20,
        shippingAmount: 45.00,
        totalAmount: 3058.20,
        source: "Web Store",
        createdAt: "2026-04-12T10:15:00.000Z",
        note: "Customer requested express delivery as they need the support package by end of week.",
        orderItems: [
            {
                id: "item-1",
                quantity: 2,
                product: { id: "prod-1", name: "Software License - Annual", price: "450.00" },
            },
            {
                id: "item-2",
                quantity: 2,
                product: { id: "prod-2", name: "Software License - Annual", price: "450.00" },
            }
        ]
    },
    {
        id: "ORD-1246",
        customer: {
            id: "cust-2",
            name: "Ali Ibrahim",
            email: "ali.ibrahim@example.com",
            phone: "+201145678901",
        },
        fulfillmentStatus: "processing",
        paymentStatus: "paid",
        subtotal: 1999.00,
        discountAmount: 0.00,
        taxAmount: 169.92,
        shippingAmount: 0.00,
        totalAmount: 2168.92,
        source: "Web Store",
        createdAt: "2026-04-13T09:30:00.000Z",
        orderItems: [
            {
                id: "item-3",
                quantity: 1,
                product: { id: "prod-3", name: "MacBook Pro M3 - 14\"", price: "1999.00" },
            }
        ]
    },
    {
        id: "ORD-1247",
        customer: {
            id: "cust-3",
            name: "Omar Sherif",
            email: "omar.sherif@example.com",
            phone: "+201234567890",
        },
        fulfillmentStatus: "shipped",
        paymentStatus: "pending",
        subtotal: 390.30,
        discountAmount: 0.00,
        taxAmount: 31.22,
        shippingAmount: 15.00,
        totalAmount: 436.52,
        source: "Mobile App",
        createdAt: "2026-04-14T15:20:00.000Z",
        note: "Leave package at reception.",
        orderItems: [
            {
                id: "item-4",
                quantity: 1,
                product: { id: "prod-4", name: "Generic Gold Table", price: "390.30" },
            }
        ]
    }
];
