# Briefly CRM — Frontend Architecture Guide

> **Last updated:** May 2026  
> **Stack:** React 19 · TypeScript · Vite · Zustand · React Query (v5) · React Router · Axios · TailwindCSS  
> **Audience:** Every developer on this project. Read this before writing a single line of code.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Directory Map](#2-directory-map)
3. [Layer-by-Layer Breakdown](#3-layer-by-layer-breakdown)
4. [The Feature Module Pattern](#4-the-feature-module-pattern)
5. [Step-by-Step: Creating a New Feature](#5-step-by-step-creating-a-new-feature)
6. [Core Components & When to Use Them](#6-core-components--when-to-use-them)
7. [API & Service Layer](#7-api--service-layer)
8. [State Management Rules](#8-state-management-rules)
9. [Routing & Navigation](#9-routing--navigation)
10. [Styling Conventions](#10-styling-conventions)
11. [TypeScript Standards](#11-typescript-standards)
12. [File Naming & Export Rules](#12-file-naming--export-rules)
13. [Scaling Patterns](#13-scaling-patterns)
14. [Anti-Patterns to Avoid](#14-anti-patterns-to-avoid)
15. [Checklist Before Merging](#15-checklist-before-merging)

---

## 1. Philosophy

This codebase follows three principles. Every decision should trace back to one of them:

| Principle | What it means in practice |
|---|---|
| **Feature isolation** | Each domain (customers, orders, campaigns…) is a self-contained folder. You can delete the entire `features/orders/` folder and the rest of the app still compiles. |
| **Clean separation of concerns** | Components render UI. Hooks manage server state (React Query). Services talk to APIs. Utils hold pure logic. Types define contracts. Never mix these. |
| **No premature abstraction** | Don't create generic hooks until two or more components need the same logic. Start simple, abstract when the pain is real. |

---

## 2. Directory Map

```
src/
├── api/                          ← Global API infrastructure
│   ├── client.ts                 ← Axios instance (interceptors, base URL)
│   ├── endpoints/
│   │   └── endpoints.ts          ← All API endpoints in one place
│   └── services/
│       └── index.ts              ← (Legacy) Global service barrel — use feature services instead
│
├── app/                          ← Application shell
│   ├── App.tsx                   ← Root component
│   ├── providers.tsx             ← React Query, Toaster, future context providers
│   └── router.tsx                ← Top-level route definitions
│
├── assets/                       ← SVGs, images, icons
│   ├── icons/                    ← Legacy icon SVGs
│   ├── images/                   ← Static images (login, onboarding, etc.)
│   ├── new/                      ← Current icon SVGs (dashboard, customers, etc.)
│   └── index.ts                  ← Barrel re-exports
│
├── core/                         ← Shared, reusable infrastructure
│   ├── components/               ← DataTable, Modal, PageLayout, Sidebar, Navbar, etc.
│   │   └── index.ts              ← Barrel exports
│   ├── constants/                ← App-wide constants (lifecycle stages, sources, etc.)
│   │   └── index.ts
│   ├── hooks/                    ← Shared hooks (useAuth, etc.)
│   ├── layouts/                  ← Dashboard layout (sidebar + navbar + content)
│   ├── types/                    ← Global type definitions (ApiResponse, UserType, etc.)
│   └── utils/                    ← (empty — use feature-level utils instead)
│
├── features/                     ← ⭐ DOMAIN MODULES — where all feature code lives
│   ├── customers/                ← Fully self-contained customer feature
│   │   ├── index.tsx             ← List page (entry point, default export)
│   │   ├── types.ts              ← All interfaces for this feature
│   │   ├── utils.ts              ← Pure helpers, constants, filtering logic
│   │   ├── customer.service.ts   ← API calls for this feature
│   │   ├── customer.hooks.ts     ← React Query hooks (useQuery, useMutation)
│   │   └── components/           ← UI components specific to this feature
│   │       ├── ActionMenu.tsx
│   │       ├── CustomerColumns.tsx
│   │       ├── CustomerFormModal.tsx
│   │       ├── CustomerProfile.tsx
│   │       └── FilterPanel.tsx
│   ├── segments/                 ← (skeleton) — follows same pattern
│   └── Contacts/                 ← (skeleton) — follows same pattern
│
├── lib/                          ← Third-party library wrappers
│   └── auth-client.ts            ← Better Auth client config
│
├── pages/                        ← Non-dashboard pages (auth, landing, onboarding)
│   ├── auth/
│   ├── landing/
│   └── onboarding/
│
├── store/                        ← Zustand global state
│   ├── auth.store.ts             ← Token, user, role, permissions
│   └── ui.store.ts               ← Sidebar state, theme (future)
│
├── index.css                     ← Global styles + CSS variables
├── main.tsx                      ← React DOM entry point
└── vite-env.d.ts                 ← Vite type declarations
```

---

## 3. Layer-by-Layer Breakdown

### `api/` — Network layer

- **`client.ts`**: The single Axios instance. Attaches Bearer token from `auth.store`. Auto-clears session on 401.
- **`endpoints/endpoints.ts`**: Every backend endpoint as a constant or function. Never hardcode a URL string in a component.
- **`services/`**: Legacy barrel. **Do not add new services here.** Feature services live in their own feature folder.

### `app/` — Application bootstrap

- **`providers.tsx`**: Wrap the app in React Query, Toaster, and any future providers (theme, i18n).
- **`router.tsx`**: Top-level routes only. Dashboard sub-routes live in `Dashboard.tsx`.

### `core/` — Shared infrastructure

Everything in `core/` must be **feature-agnostic**. If a component mentions "customer" or "order", it does NOT belong in core.

| Folder | Contains | Rule |
|---|---|---|
| `components/` | DataTable, Modal, PageLayout, Sidebar, Navbar, Icon, Image, Guards | Generic, reusable, zero business logic |
| `constants/` | Dropdown options, enum-like arrays | Used by multiple features |
| `hooks/` | useAuth | Only hooks used by 2+ features |
| `layouts/` | Dashboard shell | Route definitions for dashboard |
| `types/` | ApiResponse, UserType, BaseType | Shared contracts |

### `features/` — Domain modules

This is where 90% of your work happens. Each feature is isolated. See [Section 4](#4-the-feature-module-pattern).

### `store/` — Global state

Zustand stores. Keep them thin. Only two reasons for global state:
1. **Auth** — token, user, role, permissions
2. **UI** — sidebar state, theme toggle

**Do NOT** put feature state here. Customer filters? Local state in the component. Selected customer? `useState` in the page.

---

## 4. The Feature Module Pattern

Every feature follows this exact structure:

```
features/<feature-name>/
├── index.tsx               ← List/main page component (default export)
├── types.ts                ← All interfaces and type definitions
├── utils.ts                ← Pure functions, constants, helpers
├── <feature>.service.ts    ← API calls (getAll, getOne, create, update, remove)
├── <feature>.hooks.ts      ← React Query hooks (useQuery, useMutation)
└── components/             ← UI sub-components
    ├── <Feature>Columns.tsx     ← DataTable column definitions
    ├── <Feature>FormModal.tsx   ← Create/Edit modal
    ├── <Feature>Profile.tsx     ← Detail/profile page (if applicable)
    ├── ActionMenu.tsx           ← Row action dropdown
    └── FilterPanel.tsx          ← Filter dropdown
```

### File responsibilities

| File | Knows about | Does NOT know about |
|---|---|---|
| `index.tsx` | State orchestration, which components to render | How to fetch data, how to filter, how to render a form |
| `types.ts` | Data shapes and contracts | Nothing else |
| `utils.ts` | Pure transformations, color maps, filter logic, form defaults | React, API calls, state |
| `<feature>.service.ts` | Endpoints, Axios | React, UI, components |
| `<feature>.hooks.ts` | React Query, cache invalidation, Services | UI components, DOM |
| `components/*` | Rendering UI, calling callbacks | Direct API calls (they receive callbacks or use hooks) |

### Import direction (dependency flow)

```
index.tsx
  ├── imports from types.ts
  ├── imports from utils.ts
  ├── imports from <feature>.hooks.ts
  └── imports from components/*
         ├── imports from ../types.ts
         ├── imports from ../utils.ts
         └── imports from ../<feature>.hooks.ts
```

Components **never** import from `index.tsx`. The service **never** imports from components. This keeps the dependency graph a clean tree — no cycles.

---

## 5. Step-by-Step: Creating a New Feature

Let's say you're building the **Orders** feature. Follow these steps exactly:

### Step 1: Create the folder structure

```
src/features/orders/
├── index.tsx
├── types.ts
├── utils.ts
├── order.service.ts
├── order.hooks.ts
└── components/
```

### Step 2: Define types (`types.ts`)

```typescript
export interface Order {
    id: string;
    customerId: string;
    totalAmount: string;
    currency: string;
    paymentStatus: string;
    shippingStatus: string;
    createdAt: string;
    // ... all fields from the API response
}

export interface OrderFormData {
    customerId: string;
    totalAmount: string;
    currency: string;
    // ... only the fields the form needs
}

export interface OrderFilterState {
    status: string;
    dateFrom: string;
    dateTo: string;
    // ...
}
```

### Step 3: Create the service (`order.service.ts`)

```typescript
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints/endpoints";
import type { Order } from "./types";

export const orderService = {
    async getAll(): Promise<Order[]> {
        const { data } = await apiClient.get(ENDPOINTS.ORDER.GET_ALL);
        return data?.data || data || [];
    },

    async getOne(id: string): Promise<Order> {
        const { data } = await apiClient.get(ENDPOINTS.ORDER.GET_ONE(id));
        return data?.data || data;
    },

    async create(payload: Record<string, unknown>): Promise<Order> {
        const { data } = await apiClient.post(ENDPOINTS.ORDER.CREATE, payload);
        return data;
    },

    async update(id: string, payload: Record<string, unknown>): Promise<Order> {
        const { data } = await apiClient.patch(ENDPOINTS.ORDER.UPDATE(id), payload);
        return data;
    },

    async remove(id: string): Promise<void> {
        await apiClient.delete(ENDPOINTS.ORDER.DELETE(id));
    },
};
```

### Step 4: Create hooks (`order.hooks.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "./order.service";
import toast from "react-hot-toast";

export const orderKeys = {
    all: ["orders"] as const,
    list: () => [...orderKeys.all, "list"] as const,
    detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export const useOrders = () => useQuery({
    queryKey: orderKeys.list(),
    queryFn: orderService.getAll,
});

export const useCreateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, unknown>) => orderService.create(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
            toast.success("Order created!");
        },
    });
};
```

### Step 5: Write utils (`utils.ts`)

```typescript
import type { Order, OrderFilterState } from "./types";

// Style maps
export const PAYMENT_STATUS_COLORS = { ... };

// Filter defaults
export const DEFAULT_FILTERS: OrderFilterState = { ... };
export const freshFilters = (): OrderFilterState => ({ ...DEFAULT_FILTERS });

// Pure filter function
export const filterOrders = (orders: Order[], search: string, filters: OrderFilterState): Order[] => { ... };

// Form helpers
export const EMPTY_FORM: OrderFormData = { ... };
export const orderToFormData = (o: Order): OrderFormData => ({ ... });
export const formDataToPayload = (f: OrderFormData) => ({ ... });
```

### Step 6: Build components

Copy the pattern from `customers/components/`:
- `OrderColumns.tsx` — column definitions for DataTable
- `OrderFormModal.tsx` — create/edit modal (uses `useCreateOrder` hook)
- `ActionMenu.tsx` — row actions (view, edit, delete)
- `FilterPanel.tsx` — filter dropdown (if needed)

### Step 7: Wire up in `index.tsx`

```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageLayout from "@/core/components/PageLayout";
import DataTable from "@/core/components/DataTable";
import type { Order, OrderFilterState } from "./types";
import { useOrders } from "./order.hooks";
import { freshFilters, filterOrders, countActiveFilters } from "./utils";
import { columns } from "./components/OrderColumns";
import ActionMenu from "./components/ActionMenu";
import FilterPanel from "./components/FilterPanel";
import OrderFormModal from "./components/OrderFormModal";

const Orders = () => {
    // 1. UI State (search, filters, modal open)
    // 2. React Query Hooks (const { data, isLoading } = useOrders())
    // 3. Action handlers
    // 4. Derived data (filtered orders)
    // 5. Render
};

export default Orders;
```

### Step 8: Register the route

In `src/core/layouts/Dashboard.tsx`:

```typescript
import Orders from "@/features/orders";

// Inside <Routes>:
<Route path="orders" element={<Orders />} />
```

### Step 9: Add to sidebar (if needed)

In `src/core/components/Sidebar.tsx`, add the navigation item.

---

## 6. Core Components & When to Use Them

### `DataTable<T>`

The universal table component. Features:
- Generic type `T` for row data
- Column definitions with custom render functions
- Built-in pagination, selection, sorting
- `renderRowAction` prop for action menus
- Loading skeletons
- Empty state

**Usage:** Every list page should use this. Define columns in a separate `<Feature>Columns.tsx` file.

### `PageLayout`

The standard page wrapper. Provides:
- Search bar
- Filter button with badge count
- Import/Export buttons
- Create button
- `filterContent` slot for the filter dropdown

**Usage:** Wrap every feature list page with this.

### `Modal`

The shared modal system with built-in form helpers:
- `FormCard` — grouped section with icon
- `FormField` — label + input wrapper with optional `required` indicator
- `FormRow` — horizontal row of form fields
- `inputClasses` / `selectClasses` — consistent input styling

**Usage:** Every create/edit form modal should use this.

### `Icon`

SVG icon wrapper component. Import SVGs from `@/assets` and render with `<Icon icon={myIcon} />`.

---

## 7. API & Service Layer

### Architecture

```
Component → Feature Hooks (React Query) → Feature Service → apiClient → Backend
                                                               ↓
                                                        Interceptors:
                                                        - Attach Bearer token
                                                        - Auto-logout on 401
```

### Rules

1. **Components NEVER call `apiClient` directly.** Always go through a feature service.
2. **Services return clean data.** They unwrap `data.data` so components don't have to.
3. **Error handling lives in the component.** Services throw; components catch and show toasts.
4. **Endpoints live in `endpoints.ts`.** Never hardcode `/api/orders` in a service.

### Adding a new endpoint

1. Add it to `src/api/endpoints/endpoints.ts`:
   ```typescript
   ORDER: {
       CREATE: "/orders",
       GET_ALL: "/orders",
       GET_ONE: (id: string) => `/orders/${id}`,
       // ...
   },
   ```

2. Create a service method:
   ```typescript
   async getOne(id: string): Promise<Order> {
       const { data } = await apiClient.get(ENDPOINTS.ORDER.GET_ONE(id));
       return data?.data || data;
   },
   ```

---

## 8. State Management Rules

### When to use what

| Situation | Solution |
|---|---|
| Component-local UI (modals, dropdowns, form inputs) | `useState` |
| Derived data from other state | Compute in render (or `useMemo` for expensive) |
| Shared state between sibling components | Lift state to parent |
| App-wide state (auth, theme) | Zustand store |
| Server state (API data) | React Query (`useQuery`, `useMutation`) |

### Do NOT

- Put filter state in Zustand. It's local to the page.
- Create a store per feature. Use local state.
- Put API call logic inside stores.
- Use `useState + useEffect` for data fetching. Always use React Query.

---

## 9. Routing & Navigation

### Route hierarchy

```
/                          → Landing page (public)
/login                     → Login (guest only)
/signup                    → Signup (guest only)
/onboarding                → Onboarding (protected)
/dashboard/*               → Dashboard layout (protected)
  /dashboard/              → Home
  /dashboard/customers     → Customer list
  /dashboard/customers/:id → Customer profile
  /dashboard/orders        → Order list (future)
  /dashboard/orders/:id    → Order detail (future)
  /dashboard/segments      → Segment list (future)
  /dashboard/campaigns     → Campaign list (future)
```

### Adding a new route

1. **Top-level page** (auth, landing): Add to `src/app/router.tsx`
2. **Dashboard page**: Add to `src/core/layouts/Dashboard.tsx`
3. **Sub-page of a feature** (profile, detail): Add to `Dashboard.tsx` with the `:id` param

### Navigation pattern

Always use `useNavigate` from React Router:
```typescript
const navigate = useNavigate();
navigate("/dashboard/customers/abc123");
```

---

## 10. Styling Conventions

### CSS approach

- **TailwindCSS** utility classes for all styling
- **CSS variables** for brand colors: `var(--color-primary-500)`, `var(--color-primary-600)`
- **No inline `style` props** except for dynamic positioning (portals)

### Color system

| Usage | How |
|---|---|
| Brand/primary actions | `bg-[var(--color-primary-500)]`, `text-[var(--color-primary-600)]` |
| Status badges | Direct Tailwind: `bg-green-50 text-green-600` |
| Text hierarchy | `text-gray-900` (heading), `text-gray-700` (body), `text-gray-400` (muted) |
| Backgrounds | `bg-white` (cards), `bg-[#F8FAFC]` (page), `bg-gray-50` (inputs) |

### Card pattern

Every data section uses this:
```html
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
```

### Badge pattern

```html
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600">
    PAID
</span>
```

---

## 11. TypeScript Standards

### Import types correctly

With `verbatimModuleSyntax` enabled, always use `import type` for type-only imports:

```typescript
// ✅ Correct
import type { Customer } from "./types";
import { customerService } from "./customer.service";

// ❌ Wrong — will fail build
import { Customer } from "./types";
```

### Interface naming

- **Data models**: PascalCase noun → `Customer`, `Order`, `Segment`
- **Form data**: `<Model>FormData` → `CustomerFormData`, `OrderFormData`
- **Filter state**: `FilterState` or `<Model>FilterState`
- **Component props**: `<Component>Props` → `CustomerFormModalProps`

### Avoid `any`

Use `unknown` or proper types. Exception: error catches where Axios types are unhelpful:
```typescript
catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed");
}
```

---

## 12. File Naming & Export Rules

### Naming

| Type | Convention | Example |
|---|---|---|
| Feature folder | lowercase | `customers/`, `orders/` |
| Component file | PascalCase | `CustomerProfile.tsx`, `ActionMenu.tsx` |
| Service file | `<feature>.service.ts` | `customer.service.ts` |
| Hooks file | `<feature>.hooks.ts` | `customer.hooks.ts` |
| Types file | `types.ts` | Always `types.ts` |
| Utils file | `utils.ts` | Always `utils.ts` |
| Constants | UPPER_SNAKE_CASE | `LIFECYCLE_OPTIONS`, `TAG_COLORS` |
| Functions | camelCase | `getLifecycleClasses`, `filterCustomers` |

### Export rules

- **Feature `index.tsx`**: `export default` for the page component
- **Service**: Named export → `export const customerService = { ... }`
- **Hooks**: Named exports → `export const useCustomers = () => ...`
- **Types**: Named exports → `export interface Customer { ... }`
- **Utils**: Named exports → `export const filterCustomers = ...`
- **Components**: `export default` for each component file
- **Columns**: Named export → `export const columns = [...]`

---

## 13. Scaling Patterns

### Adding a list page to an existing feature

1. Add the route in `Dashboard.tsx`
2. Create the page component
3. Reuse the existing service, types, and utils

### Adding a detail/profile page

1. Add `getOne()` to the feature service
2. Create `<Feature>Profile.tsx` in `components/`
3. Add `<Route path="<feature>/:id" element={<FeatureProfile />} />` to `Dashboard.tsx`

### Sharing logic between features

If two features need the same utility:
1. If it's a **UI component** → move to `core/components/`
2. If it's a **constant** → move to `core/constants/`
3. If it's a **hook** → move to `core/hooks/`
4. If it's a **type** → move to `core/types/`

**Never** import from one feature into another feature. If `orders/` needs something from `customers/`, extract it to `core/`.

### Adding new global state

Only if the state is needed across unrelated features:
1. Create `src/store/<name>.store.ts`
2. Follow the Zustand `persist` pattern from `auth.store.ts`
3. Keep actions minimal

### Future features roadmap

Here's where each planned feature should go:

```
features/
├── customers/     ✅ Done
├── orders/        → Copy customers/ pattern exactly
├── products/      → Copy customers/ pattern exactly
├── segments/      → Copy customers/ pattern (no profile page needed)
├── campaigns/     → Copy customers/ pattern + add campaign builder
├── tickets/       → Copy customers/ pattern + add ticket detail/thread
├── analytics/     → Different pattern: dashboard cards, charts, no CRUD
├── integrations/  → Settings-style page, connect/disconnect flows
└── notifications/ → Likely a dropdown + full page, not a CRUD table
```

---

## 14. Anti-Patterns to Avoid

### ❌ The 500-line component

If a file exceeds ~200 lines, extract. Move filtering to `utils.ts`, columns to `Columns.tsx`, forms to `FormModal.tsx`.

### ❌ API calls in components without hooks

```typescript
// ❌ Bad (Direct service call in component)
const handleDelete = async () => {
    await customerService.remove(id);
    setLoading(false);
};

// ❌ Bad (useState + useEffect for fetching)
useEffect(() => { ... fetch data ... }, []);

// ✅ Good (Using React Query mutations)
const deleteMutation = useDeleteCustomer();
const handleDelete = () => deleteMutation.mutate(id);
```

### ❌ Cross-feature imports

```typescript
// ❌ Never do this
import { Customer } from "@/features/customers/types";
// inside features/orders/

// ✅ Move shared types to core
import type { Customer } from "@/core/types";
```

### ❌ God utils file

If `utils.ts` exceeds ~200 lines, split into `utils/formatting.ts`, `utils/filtering.ts`, etc.

### ❌ Hardcoded endpoint strings

```typescript
// ❌ Bad
await apiClient.get("/customers");

// ✅ Good
await apiClient.get(ENDPOINTS.CUSTOMER.GET_ALL);
```

### ❌ Business logic in services

Services should be dumb data pipes. Validation, transformation, and business rules belong in `utils.ts` or the component.

### ❌ Prop drilling more than 2 levels

If a callback passes through 3+ components, consider:
1. Restructuring the component tree
2. Using composition (render props or children)
3. Creating a context (last resort)

---

## 15. Checklist Before Merging

Before opening a PR, verify:

- [ ] `npm run build` passes with zero errors
- [ ] No `any` types added (unless in catch blocks)
- [ ] All type imports use `import type`
- [ ] No direct `apiClient` calls from components
- [ ] Data fetching uses React Query hooks, not `useState + useEffect`
- [ ] No cross-feature imports
- [ ] Feature folder structure matches the pattern in [Section 4](#4-the-feature-module-pattern)
- [ ] New routes are added to `Dashboard.tsx` (not `router.tsx`)
- [ ] Constants are in `UPPER_SNAKE_CASE`
- [ ] Components are `PascalCase.tsx`
- [ ] No hardcoded endpoint strings
- [ ] New endpoints are added to `endpoints.ts`
- [ ] Loading and empty states are handled
- [ ] Error states show user-friendly toasts
- [ ] The page is responsive (test at mobile breakpoints)

---

## Quick Reference: Copy-Paste Checklist for New Feature

```
1. mkdir src/features/<name>/components
2. Create types.ts        ← interfaces
3. Create <name>.service.ts  ← API calls
4. Create <name>.hooks.ts    ← React Query hooks
5. Create utils.ts        ← helpers, filters, form defaults
6. Create components/     ← Columns, FormModal, ActionMenu, FilterPanel
7. Create index.tsx       ← wire everything together
8. Add route in Dashboard.tsx
9. Add sidebar link in Sidebar.tsx
10. npm run build          ← must pass
```

---

*This document is the source of truth. When in doubt, follow the pattern established in `features/customers/`. That module is the reference implementation.*
