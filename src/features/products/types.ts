/* ── Product feature types ── */

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    costPrice?: number | string | null;
    sku?: string;
    barcode?: string;
    quantity?: number;
    category?: string;
    type?: string;
    vendor?: string;
    brand?: string;
    status?: ProductStatus;
    tags?: string[];
    images?: string[];
    image?: string;
    weight?: number | string | null;
    weightUnit?: string;
    trackInventory?: boolean;
    totalSold?: number;
    totalRevenue?: number | string;
    rating?: number | null;
    reviewCount?: number;
    createdAt?: string;
    updatedAt?: string;
    imageUrl?: string;
    inventory?: number;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    productId: string;
    name: string;
    sku?: string | null;
    price: number;
    inventory: number;
    barcode?: string | null;
    imageUrl?: string | null;
    status?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type ProductStatus = "active" | "draft" | "archived";

export interface ProductFormData {
    name: string;
    description: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    sku: string;
    barcode: string;
    quantity: string;
    category: string;
    type: string;
    vendor: string;
    brand: string;
    status: ProductStatus;
    trackInventory: string;
    weight: string;
    weightUnit: string;
    imageUrl?: string;
}

export interface ProductFilterState {
    name: string;
    priceMin: number;
    priceMax: number;
    categories: Set<string>;
    statuses: Set<string>;
}
