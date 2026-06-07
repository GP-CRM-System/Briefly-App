import type { Order, OrderFilterState } from "./types";

export const freshOrderFilters = (): OrderFilterState => ({
    shippingStatus: new Set<string>(),
    paymentStatus: new Set<string>(),
    source: "",
    search: "",
});

export const countActiveFilters = (filters: OrderFilterState): number => {
    let count = 0;
    if (filters.shippingStatus.size > 0) count++;
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
            const nameMatch = order.customerName?.toLowerCase().includes(query) || order.customer?.name?.toLowerCase().includes(query);
            if (!idMatch && !nameMatch) return false;
        }

        // Shipping status filter
        if (filters.shippingStatus.size > 0 && !filters.shippingStatus.has(order.shippingStatus)) {
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
        customerId: "cust-1",
        customerName: "Ahmed Hassan",
        customer: {
            id: "cust-1",
            name: "Ahmed Hassan",
            email: "ahmedhassan55@gmail.com",
            phone: "+201068551047",
        },
        shippingStatus: "delivered",
        paymentStatus: "failed",
        subtotal: 3100.00,
        discountAmount: 310.00,
        taxAmount: 223.20,
        shippingAmount: 45.00,
        totalAmount: 3058.20,
        currency: "USD",
        source: "Web Store",
        createdAt: "2026-04-12T10:15:00.000Z",
        updatedAt: "2026-04-12T14:45:00.000Z",
        note: "Customer requested express delivery as they need the support package by end of week. Account manager Leslie confirmed availability.",
        notes: [
            {
                id: "n-1",
                content: "Customer requested express delivery as they need the support package by end of week. Account manager Leslie confirmed availability.",
                createdAt: "2026-04-12T10:15:00.000Z",
                author: "Sarah Ahmed, Oct 24"
            }
        ],
        orderItems: [
            {
                id: "item-1",
                orderId: "ORD-1245",
                productId: "prod-1",
                quantity: 2,
                price: 450.00,
                productName: "Software License - Annual",
                productSku: "SL-ANL-24"
            },
            {
                id: "item-2",
                orderId: "ORD-1245",
                productId: "prod-2",
                quantity: 2,
                price: 450.00,
                productName: "Software License - Annual",
                productSku: "SL-ANL-24"
            }
        ]
    },
    {
        id: "ORD-1246",
        customerId: "cust-2",
        customerName: "Ali Ibrahim",
        customer: {
            id: "cust-2",
            name: "Ali Ibrahim",
            email: "ali.ibrahim@example.com",
            phone: "+201145678901",
        },
        shippingStatus: "processing",
        paymentStatus: "paid",
        subtotal: 1999.00,
        discountAmount: 0.00,
        taxAmount: 169.92,
        shippingAmount: 0.00,
        totalAmount: 2168.92,
        currency: "USD",
        source: "Web Store",
        createdAt: "2026-04-13T09:30:00.000Z",
        updatedAt: "2026-04-13T09:30:00.000Z",
        note: "",
        orderItems: [
            {
                id: "item-3",
                orderId: "ORD-1246",
                productId: "prod-3",
                quantity: 1,
                price: 1999.00,
                productName: "MacBook Pro M3 - 14\"",
                productSku: "MBP-M3-14"
            }
        ]
    },
    {
        id: "ORD-1247",
        customerId: "cust-3",
        customerName: "Omar Sherif",
        customer: {
            id: "cust-3",
            name: "Omar Sherif",
            email: "omar.sherif@example.com",
            phone: "+201234567890",
        },
        shippingStatus: "shipped",
        paymentStatus: "pending",
        subtotal: 390.30,
        discountAmount: 0.00,
        taxAmount: 31.22,
        shippingAmount: 15.00,
        totalAmount: 436.52,
        currency: "USD",
        source: "Mobile App",
        createdAt: "2026-04-14T15:20:00.000Z",
        updatedAt: "2026-04-14T17:40:00.000Z",
        note: "Leave package at reception.",
        orderItems: [
            {
                id: "item-4",
                orderId: "ORD-1247",
                productId: "prod-4",
                quantity: 1,
                price: 390.30,
                productName: "Generic Gold Table",
                productSku: "WGI3B2D9"
            }
        ]
    }
];
