import type { Product, ProductFormData, ProductFilterState } from "./types";

/* ═══════════════════════════════════════════
   Status styling
   ═══════════════════════════════════════════ */

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    active:   { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200" },
    draft:    { bg: "bg-gray-50",   text: "text-gray-500",   border: "border-gray-200" },
    archived: { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-200" },
};

const FALLBACK_STATUS = { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

export const getStatusClasses = (status: string) =>
    STATUS_COLORS[status?.toLowerCase()] || FALLBACK_STATUS;

/* ═══════════════════════════════════════════
   Category styling
   ═══════════════════════════════════════════ */

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    electronics:  { bg: "bg-blue-50",    text: "text-blue-600" },
    clothing:     { bg: "bg-purple-50",  text: "text-purple-600" },
    accessories:  { bg: "bg-pink-50",    text: "text-pink-600" },
    "home & garden": { bg: "bg-green-50",   text: "text-green-600" },
    beauty:       { bg: "bg-rose-50",    text: "text-rose-600" },
    food:         { bg: "bg-amber-50",   text: "text-amber-600" },
    sports:       { bg: "bg-cyan-50",    text: "text-cyan-600" },
    books:        { bg: "bg-indigo-50",  text: "text-indigo-600" },
};

export const getCategoryClasses = (cat: string) =>
    CATEGORY_COLORS[cat?.toLowerCase()] || { bg: "bg-gray-50", text: "text-gray-600" };

/* ═══════════════════════════════════════════
   Avatar helpers (for product thumbnails)
   ═══════════════════════════════════════════ */

const PRODUCT_COLORS = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
];

export const getProductColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return PRODUCT_COLORS[Math.abs(hash) % PRODUCT_COLORS.length];
};

export const getProductInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

/* ═══════════════════════════════════════════
   Filter defaults & options
   ═══════════════════════════════════════════ */

export const CATEGORY_OPTIONS = [
    "Electronics", "Clothing", "Accessories", "Home & Garden", "Beauty", "Food", "Sports", "Books",
];

export const STATUS_OPTIONS = ["Active", "Draft", "Archived"];

export const DEFAULT_PRODUCT_FILTERS: ProductFilterState = {
    name: "",
    priceMin: 0,
    priceMax: 10_000,
    categories: new Set<string>(),
    statuses: new Set<string>(),
};

/** Create a fresh copy of default filters */
export const freshProductFilters = (): ProductFilterState => ({
    ...DEFAULT_PRODUCT_FILTERS,
    categories: new Set(),
    statuses: new Set(),
});

/* ═══════════════════════════════════════════
   Client-side filtering
   ═══════════════════════════════════════════ */

export const filterProducts = (
    products: Product[],
    search: string,
    filters: ProductFilterState
): Product[] => {
    let result = products;

    if (search) {
        const q = search.toLowerCase();
        result = result.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                (p.sku || "").toLowerCase().includes(q) ||
                (p.category || "").toLowerCase().includes(q) ||
                (p.vendor || "").toLowerCase().includes(q)
        );
    }

    if (filters.name) {
        const q = filters.name.toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (filters.priceMax < 10_000) {
        result = result.filter((p) => {
            const price = Number(p.price ?? 0);
            return price >= filters.priceMin && price <= filters.priceMax;
        });
    }

    if (filters.categories.size > 0) {
        result = result.filter((p) => filters.categories.has(p.category || ""));
    }

    if (filters.statuses.size > 0) {
        result = result.filter((p) => filters.statuses.has(p.status || ""));
    }

    return result;
};

/** Count how many filters are actively applied */
export const countActiveProductFilters = (f: ProductFilterState): number =>
    (f.name ? 1 : 0) + (f.priceMax < 10_000 ? 1 : 0) + f.categories.size + f.statuses.size;

/* ═══════════════════════════════════════════
   Form helpers
   ═══════════════════════════════════════════ */

export const EMPTY_PRODUCT_FORM: ProductFormData = {
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    sku: "",
    barcode: "",
    quantity: "0",
    category: CATEGORY_OPTIONS[0],
    type: "",
    vendor: "",
    brand: "",
    status: "active",
    trackInventory: "true",
    weight: "",
    weightUnit: "kg",
};

export const productToFormData = (p: Product): ProductFormData => ({
    name: p.name || "",
    description: p.description || "",
    price: String(p.price ?? ""),
    compareAtPrice: String(p.compareAtPrice ?? ""),
    costPrice: String(p.costPrice ?? ""),
    sku: p.sku || "",
    barcode: p.barcode || "",
    quantity: String(p.quantity ?? 0),
    category: p.category || CATEGORY_OPTIONS[0],
    type: p.type || "",
    vendor: p.vendor || "",
    brand: p.brand || "",
    status: p.status || "active",
    trackInventory: String(p.trackInventory ?? true),
    weight: String(p.weight ?? ""),
    weightUnit: p.weightUnit || "kg",
});

export const productFormDataToPayload = (f: ProductFormData) => ({
    name: f.name,
    description: f.description,
    price: parseFloat(f.price) || 0,
    compareAtPrice: f.compareAtPrice ? parseFloat(f.compareAtPrice) : null,
    costPrice: f.costPrice ? parseFloat(f.costPrice) : null,
    sku: f.sku,
    barcode: f.barcode,
    quantity: parseInt(f.quantity) || 0,
    category: f.category,
    type: f.type,
    vendor: f.vendor,
    brand: f.brand,
    status: f.status,
    trackInventory: f.trackInventory === "true",
    weight: f.weight ? parseFloat(f.weight) : null,
    weightUnit: f.weightUnit,
});

/* ═══════════════════════════════════════════
   Mock data (dev fallback)
   ═══════════════════════════════════════════ */

const MOCK_NAMES = [
    "Premium Wireless Headphones", "Organic Cotton T-Shirt", "Smart Watch Pro",
    "Leather Crossbody Bag", "Vitamin C Serum", "Bluetooth Speaker Mini",
    "Running Shoes Ultra", "Stainless Steel Water Bottle", "Yoga Mat Premium",
    "Noise-Cancelling Earbuds", "Silk Pillowcase Set", "Fitness Tracker Band",
    "Bamboo Cutting Board", "Protein Powder Vanilla", "Sunscreen SPF 50",
    "Denim Jacket Classic", "Portable Charger 20K", "Ceramic Coffee Mug",
    "Resistance Bands Set", "Natural Face Moisturizer",
];

const MOCK_CATEGORIES = ["Electronics", "Clothing", "Accessories", "Beauty", "Sports", "Food", "Home & Garden"];
const MOCK_VENDORS = ["TechNova", "EcoThreads", "StyleCraft", "PureSkin", "FitGear", "HomeEase"];
const MOCK_STATUSES: ("active" | "draft" | "archived")[] = ["active", "active", "active", "draft", "archived"];

export const MOCK_PRODUCTS: Product[] = Array.from({ length: 20 }, (_, i) => ({
    id: `prod-${i + 1}`,
    name: MOCK_NAMES[i % MOCK_NAMES.length],
    description: "High-quality product with premium materials and exceptional craftsmanship.",
    price: (19.99 + (i * 15.5)).toFixed(2),
    compareAtPrice: i % 3 === 0 ? (29.99 + (i * 15.5)).toFixed(2) : null,
    costPrice: (9.99 + (i * 7)).toFixed(2),
    sku: `SKU-${String(1000 + i)}`,
    barcode: `${8901234500000 + i}`,
    quantity: 10 + (i * 5),
    category: MOCK_CATEGORIES[i % MOCK_CATEGORIES.length],
    vendor: MOCK_VENDORS[i % MOCK_VENDORS.length],
    brand: MOCK_VENDORS[i % MOCK_VENDORS.length],
    status: MOCK_STATUSES[i % MOCK_STATUSES.length],
    tags: i % 2 === 0 ? ["bestseller"] : ["new"],
    trackInventory: true,
    totalSold: 50 + (i * 12),
    totalRevenue: ((50 + (i * 12)) * (19.99 + (i * 15.5))).toFixed(2),
    rating: 3.5 + (i % 5) * 0.3,
    reviewCount: 10 + (i * 3),
    createdAt: "2026-01-15",
    updatedAt: "2026-04-05",
}));
