export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: string | number;
    createdAt?: string;
    updatedAt?: string;
    productName?: string;
    productSku?: string;
    productImageUrl?: string;
    product?: {
        id: string;
        name: string;
        price: string;
        imageUrl?: string;
        sku?: string;
    };
}

export interface OrderNote {
    id: string;
    content: string;
    createdAt: string;
    author?: string;
}

export interface Order {
    id: string;
    customerId: string;
    customerName?: string;
    customerEmail?: string;
    customer?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    shippingStatus: "processing" | "shipped" | "delivered" | "cancelled" | "pending";
    paymentStatus: "paid" | "pending" | "failed";
    subtotal: string | number;
    discountAmount?: string | number;
    taxAmount?: string | number;
    shippingAmount?: string | number;
    totalAmount: string | number;
    currency: string;
    source: string;
    createdAt: string;
    updatedAt: string;
    orderItems?: OrderItem[];
    notes?: OrderNote[];
    note?: string;
    refundAmount?: string | number;
    tags?: string[];
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
    shippingStatus: Set<string>;
    paymentStatus: Set<string>;
    source: string;
    search: string;
}
