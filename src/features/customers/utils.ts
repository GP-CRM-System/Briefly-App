import type { Customer, FilterState } from "./types";
import { CUSTOMER_SOURCES, CUSTOMER_LIFECYCLE_STAGES } from "@/core/constants";
import type { CustomerFormData } from "./types";

/* ═══════════════════════════════════════════
   Lifecycle & tag styling
   ═══════════════════════════════════════════ */

const LIFECYCLE_COLORS: Record<string, { base: string; text: string; border: string }> = {
    loyal:     { base: "blue",    text: "text-blue-600",    border: "border-blue-200" },
    new:       { base: "green",   text: "text-green-600",   border: "border-green-200" },
    "at-risk": { base: "orange",  text: "text-orange-500",  border: "border-orange-200" },
    churned:   { base: "red",     text: "text-red-500",     border: "border-red-200" },
    active:    { base: "emerald", text: "text-emerald-600", border: "border-emerald-200" },
    prospect:  { base: "purple",  text: "text-purple-600",  border: "border-purple-200" },
    one_time:  { base: "gray",    text: "text-gray-600",    border: "border-gray-200" },
    returning: { base: "blue",    text: "text-blue-600",    border: "border-blue-200" },
    vip:       { base: "amber",   text: "text-amber-600",   border: "border-amber-200" },
    winback:   { base: "teal",    text: "text-teal-600",    border: "border-teal-200" },
};

const FALLBACK_LIFECYCLE = { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" };

export const getLifecycleClasses = (lc: string) => {
    const colors = LIFECYCLE_COLORS[lc];
    if (!colors) return FALLBACK_LIFECYCLE;
    return { bg: `bg-${colors.base}-100`, text: colors.text, border: colors.border };
};

export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
    churned: { bg: "bg-red-50",    text: "text-red-600" },
    vip:     { bg: "bg-purple-50", text: "text-purple-600" },
    new:     { bg: "bg-green-50",  text: "text-green-600" },
    premium: { bg: "bg-amber-50",  text: "text-amber-600" },
};

/* ═══════════════════════════════════════════
   Avatar helpers
   ═══════════════════════════════════════════ */

const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
];

export const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

/* ═══════════════════════════════════════════
   Filter defaults & options
   ═══════════════════════════════════════════ */

export const DEFAULT_FILTERS: FilterState = {
    name: "",
    spentMin: 0,
    spentMax: 50_000,
    lifecycles: new Set<string>(),
};

export const LIFECYCLE_OPTIONS = [
    "Loyal", "Churned", "Prospect", "New", "Active", "At-Risk", "VIP", "Returning", "Winback",
];

/** Create a fresh copy of default filters (avoids shared Set reference) */
export const freshFilters = (): FilterState => ({ ...DEFAULT_FILTERS, lifecycles: new Set() });

/* ═══════════════════════════════════════════
   Client-side filtering
   ═══════════════════════════════════════════ */

export const filterCustomers = (
    customers: Customer[],
    search: string,
    filters: FilterState
): Customer[] => {
    let result = customers;

    if (search) {
        const q = search.toLowerCase();
        result = result.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.city || "").toLowerCase().includes(q)
        );
    }

    if (filters.name) {
        const q = filters.name.toLowerCase();
        result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (filters.spentMax < 50_000) {
        result = result.filter(
            (c) => {
                const spent = Number(c.totalSpent ?? 0);
                return spent >= filters.spentMin && spent <= filters.spentMax;
            }
        );
    }

    if (filters.lifecycles.size > 0) {
        result = result.filter((c) => filters.lifecycles.has(c.lifecycleStage || ""));
    }

    return result;
};

/** Count how many filters are actively applied */
export const countActiveFilters = (f: FilterState): number =>
    (f.name ? 1 : 0) + (f.spentMax < 50_000 ? 1 : 0) + f.lifecycles.size;

/* ═══════════════════════════════════════════
   Form helpers
   ═══════════════════════════════════════════ */

export const EMPTY_FORM: CustomerFormData = {
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    source: CUSTOMER_SOURCES[0].value,
    acceptMarketing: "true",
    lifecycleStage: CUSTOMER_LIFECYCLE_STAGES[0].value,
};

export const customerToFormData = (c: Customer): CustomerFormData => ({
    name: c.name || "",
    phone: c.phone || "",
    email: c.email || "",
    address: c.address || "",
    city: c.city || "",
    source: c.source || CUSTOMER_SOURCES[0].value,
    acceptMarketing: String(c.acceptMarketing ?? true),
    lifecycleStage: c.lifecycleStage || CUSTOMER_LIFECYCLE_STAGES[0].value,
});

export const formDataToPayload = (f: CustomerFormData) => ({
    name: f.name,
    phone: f.phone,
    email: f.email,
    address: f.address,
    city: f.city,
    source: f.source,
    acceptMarketing: f.acceptMarketing === "true",
    lifecycleStage: f.lifecycleStage,
});

/* ═══════════════════════════════════════════
   Mock data (dev fallback)
   ═══════════════════════════════════════════ */

export const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 40 }, (_, i) => ({
    id: `cust-${i + 1}`,
    name: "Sarah Ahmed",
    email: `sarah.ahmed${i + 1}@email.com`,
    city: "New York",
    tags: ["Churned"],
    lifecycleStage: "Loyal",
    totalSpent: "2340",
    totalOrders: 12,
    lastActivity: "Viewed products",
    lastActivityDate: "2026-04-05",
    createdAt: "2026-01-15",
}));
