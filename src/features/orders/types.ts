export interface OrderItem {
    id: string;
    quantity: number;
    product?: {
        id: string;
        name: string;
        price: string;
    };
}

export interface OrderTransaction {
    id: string;
    orderId: string;
    externalId?: string | null;
    amount: string;
    currency: string;
    provider: string;
    status: string;
    type: string;
    metadata?: Record<string, unknown> | null;
    errorMessage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrderCustomer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    address?: string;
    source?: string;
    lifecycleStage?: string;
    totalOrders?: number;
    totalSpent?: string;
}

export interface Order {
    id: string;
    createdAt: string;
    source: string;
    paymentStatus: string;
    fulfillmentStatus?: string;
    subtotal: string | number;
    discountAmount?: string | number;
    taxAmount?: string | number;
    shippingAmount?: string | number;
    totalAmount: string | number;
    customer?: OrderCustomer;
    orderItems?: OrderItem[];
    note?: string | null;
    supportTickets?: unknown[];
    transactions?: OrderTransaction[];
}

export interface OrderFormData {
    customerId: string;
    productId: string;
    quantity: number;
    discount: number;
    source: string;
    referringSite: string;
    note: string;
}

export interface OrderFilterState {
    fulfillmentStatus: Set<string>;
    paymentStatus: Set<string>;
    source: string;
    search: string;
}
