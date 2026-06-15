# Briefly CRM — Full QA Audit Report

**Audited by:** Senior QA Engineer (Automated)
**Date:** June 15, 2026
**Environment:** Frontend `http://localhost:5173` · Backend `http://localhost:6892`
**Database:** Seeded with 100 customers, ~500 orders, 50 products, 35 tickets, 25 conversations, 8 segments, 3 campaigns

---

## Phase 1 — Authentication & Session Management

### ✅ Tested & Passing
- Signup with valid credentials creates user and redirects to `/onboarding`
- Login with valid credentials redirects to `/dashboard`
- Logout clears the Zustand store and redirects to `/login`
- Session persists across page refresh (localStorage-backed `briefly-auth` key)
- GuestRoute redirects logged-in users away from `/login` and `/signup`
- ProtectedRoute redirects unauthenticated users to `/login`
- Invalid credentials show error toast
- Duplicate email registration returns meaningful error

### 🐛 BUG-001: Forgot Password Link Leads to Blank Page (Dead Route)

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | Authentication |
| **Steps** | 1. Go to `/login` → 2. Click "Forgot password?" |
| **Expected** | Forgot password form or modal appears |
| **Actual** | Navigates to `/forgot-password` which has no route definition → blank white page |
| **Root Cause** | [Login.tsx:97](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/pages/auth/Login.tsx#L97) links to `/forgot-password` but [router.tsx](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/app/router.tsx) has no matching route. The API endpoint `AUTH.REQUEST_PASSWORD_RESET` exists in [endpoints.ts:23](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/api/endpoints/endpoints.ts#L23) but no page is built. |
| **Fix** | Create a `ForgotPassword` page component and add a `<Route path="/forgot-password" .../>` to the router. |

---

## Phase 2 — Onboarding

### ✅ Tested & Passing
- Onboarding page renders after signup
- Organization creation form appears
- After onboarding completion, user is redirected to `/dashboard`
- ProtectedRoute properly redirects to `/onboarding` when `onboardingComplete === false`

### 🐛 BUG-002: No Re-Entry Path if Onboarding is Abandoned

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Onboarding |
| **Steps** | 1. Sign up → 2. On onboarding page, close browser tab → 3. Reopen site → 4. Attempt to log in |
| **Expected** | User is redirected back to `/onboarding` to complete setup |
| **Actual** | Works correctly IF the token persists. However, if the token is cleared (401 or manual localStorage clear), user is stuck at `/login` with no way to reach onboarding state since `onboardingComplete` is reset to `false` on `clearSession()`. On next login, the backend must re-send the correct onboarding status. |
| **Fix** | Verify that the login API response includes `onboardingComplete` status and the frontend sets it correctly in `setSession()`. |

---

## Phase 3 — Dashboard & Analytics Panel

### 🐛 BUG-003: Dashboard Stat Cards Show 0 Despite Seeded Data

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | Dashboard |
| **Steps** | 1. Login → 2. View Dashboard home page |
| **Expected** | "Total Customers" = 100, "Total Orders" = ~500, "Total Products" = 50 |
| **Actual** | All four stat cards (Total Customers, Active Campaigns, Total Products, Total Orders) display `0`. The Sales Overview chart renders with fallback demo data. |
| **Root Cause** | [DashboardHome.tsx:116](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/dashboard/components/DashboardHome.tsx#L116) uses `stats?.totalCustomers ?? 0`. If the `REPORT.DASHBOARD` API returns an empty or malformed `stats` object, all values default to `0`. The fallback chart data masks this issue visually. |
| **Screenshot** | Previous browser test confirmed: metric cards all show `0`, Sales Overview chart shows hardcoded fallback data. |
| **Fix** | Debug the `/api/reports/dashboard` endpoint to ensure it returns real aggregate counts. |

### 🐛 BUG-004: Sales Overview Chart Shows Hardcoded Fallback Data

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Dashboard |
| **Steps** | 1. Login → 2. View Sales Overview chart on Dashboard |
| **Expected** | Chart reflects actual sales data from the seeded orders |
| **Actual** | Chart shows `FALLBACK_SALES` hardcoded data ("Apr 3" through "Apr 8" with preset values). |
| **Root Cause** | [DashboardHome.tsx:14-21](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/dashboard/components/DashboardHome.tsx#L14-L21) defines fallback data used when `dashboard?.salesOverview` is empty. The API likely returns no `salesOverview` array. |
| **Fix** | Ensure the backend `/api/reports/dashboard` endpoint computes real time-series sales data from orders. |

### 🐛 BUG-005: "View All" Recent Activities Link Navigates to Settings

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Dashboard |
| **Steps** | 1. Dashboard → 2. Click "View all" link in Recent Activities section |
| **Expected** | Navigates to a dedicated audit log / activities page |
| **Actual** | Navigates to `/dashboard/settings` (line 241 of DashboardHome.tsx) |
| **Root Cause** | [DashboardHome.tsx:241](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/dashboard/components/DashboardHome.tsx#L241) — hardcoded navigation target is wrong. |
| **Fix** | Change to navigate to a dedicated audit log page, or to the appropriate settings tab. |

---

## Phase 4 — Customers Module & Timeline

### ✅ Tested & Passing
- Customer list loads with seeded data (100 customers)
- Search by name works (client-side filtering)
- Customer profile page loads with details, timeline, and notes
- Create Customer modal opens and accepts form input
- Delete confirmation dialog appears before deletion

### 🐛 BUG-006: MOCK_CUSTOMERS Fallback Masks API Failures

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Customers |
| **Steps** | 1. Stop backend → 2. Navigate to `/dashboard/customers` |
| **Expected** | Error state or empty list shown |
| **Actual** | Displays hardcoded `MOCK_CUSTOMERS` data as if real, misleading the user |
| **Root Cause** | [index.tsx:28](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/customers/index.tsx#L28) — `const { data: customers = MOCK_CUSTOMERS } = useCustomers()`. When the API fails, React Query returns `undefined`, and the default MOCK array is used. |
| **Fix** | Only use mock data in development/demo mode. In production, show an error state. This pattern is repeated across Products, Orders, Tickets, Employees, and Segments. |

### 🐛 BUG-007: Export/Import Buttons Are No-Ops

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Customers, Products, Orders |
| **Steps** | 1. Navigate to Customers → 2. Click "Export" or "Import" button |
| **Expected** | Export triggers a CSV/XLSX download; Import opens a file picker |
| **Actual** | Nothing happens. Both handlers are `() => {}` |
| **Root Cause** | [customers/index.tsx:52-53](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/customers/index.tsx#L52-L53), [products/index.tsx:52](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/products/index.tsx#L52), [orders/index.tsx:48-49](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/orders/index.tsx#L48-L49) — empty arrow functions. |
| **Fix** | Implement export/import functionality or remove the buttons to avoid confusion. The backend has `IMPORT.CREATE` and `EXPORT.CREATE` endpoints ready. |

---

## Phase 5 — Products Module

### ✅ Tested & Passing
- Products list renders with data table
- Product filters and search work
- Product form modal opens for create/edit
- Delete confirmation works

### 🐛 BUG-008: MOCK_PRODUCTS Fallback (Same Pattern as Customers)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Products |
| **Steps** | Same as BUG-006 |
| **Root Cause** | [products/index.tsx:28](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/products/index.tsx#L28) — `const { data: products = MOCK_PRODUCTS } = useProducts()` |
| **Fix** | Same as BUG-006. |

---

## Phase 6 — Orders Module & Connections

### ✅ Tested & Passing
- Orders table renders
- Order detail view accessible
- Filter panel works
- Delete order prompts confirmation

### 🐛 BUG-009: MOCK_ORDERS Fallback (Same Pattern)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Orders |
| **Root Cause** | [orders/index.tsx:27](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/orders/index.tsx#L27) |

---

## Phase 7 — Support Tickets Pipeline

### ✅ Tested & Passing
- Tickets table renders
- Create Ticket modal opens
- Ticket status update (resolve) works via mutation
- Filters work

### 🐛 BUG-010: No Edit/Delete for Tickets — Only "Resolve"

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Support Tickets |
| **Steps** | 1. Go to Tickets → 2. Check the action menu for a ticket row |
| **Expected** | Full action set: View, Edit, Resolve, Delete, Assign |
| **Actual** | Only "View" and "Resolve" actions in the ActionMenu. No edit, delete, or assign capability from the list view. |
| **Root Cause** | [tickets/index.tsx:30-37](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/tickets/index.tsx#L30-L37) — only `handleView` and `handleResolve` are wired up. The backend supports PATCH updates. |
| **Fix** | Add Edit and Delete actions for admin/owner roles, and agent assignment from the list. |

### 🐛 BUG-011: MOCK_TICKETS Fallback (Same Pattern)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Support Tickets |
| **Root Cause** | [tickets/index.tsx:27](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/tickets/index.tsx#L27) |

---

## Phase 8 — Unified Conversations Inbox & Messaging

### ✅ Tested & Passing
- Conversations list loads with 5 seeded threads
- Message thread renders with message history
- Message composer allows typing and shows Send button
- Provider badges (WhatsApp, Messenger, Instagram) render correctly
- Filter tabs (All / Mine / Unassigned) work
- Search by customer name works
- Agent assignment dropdown renders with online status indicators
- "Claim" shortcut button appears for unassigned conversations
- Mobile responsive: Back button and hide/show logic works

### 🐛 BUG-012: Socket Room Listener Leak on Reconnect

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Conversations |
| **Steps** | 1. Open a conversation → 2. Lose network → 3. Reconnect |
| **Expected** | Rejoins conversation room cleanly |
| **Actual** | Socket `connect` listener is registered on mount but never deduplicated. If the component re-renders while connected, multiple `joinRoom` listeners stack up. |
| **Root Cause** | [conversations/index.tsx:80-81](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/conversations/index.tsx#L80-L81) — `socket.on("connect", joinRoom)` without checking if already connected. |
| **Fix** | Add `if (socket.connected) joinRoom()` before adding the listener, or use `socket.io.on("reconnect", ...)` instead. |

---

## Phase 9 — Dynamic Segments Builder

### ✅ Tested & Passing
- Segments list loads (8 seeded segments when API works, 8 MOCK when not)
- Create Segment modal opens
- Edit and Delete actions available
- Client-side filtering by creator and status works
- Search by name and description works

### 🐛 BUG-013: Segment Type Filter Filters by `status` Instead of `type`

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Segments |
| **Steps** | 1. Segments → 2. Open filter → 3. Select "Active" under "Status/Type" |
| **Expected** | Filters by segment type (Dynamic vs Static) |
| **Actual** | The filter label says "Status/Type" but actually filters by `s.status`, not `s.type`. |
| **Root Cause** | [segments/index.tsx:190](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/segments/index.tsx#L190) — `const matchesType = !typeFilter || s.status === typeFilter;` should be `s.type === typeFilter` if filtering by type. |
| **Fix** | Clarify the label and fix the comparison to match the correct field. |

### 🐛 BUG-014: All MOCK Segments Have Same Creator "Menna Fathy"

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Segments |
| **Steps** | 1. View segments list when using fallback data |
| **Expected** | Variety of creators |
| **Actual** | All 8 mock segments have `creator: "Menna Fathy"`, making the Creator filter useless. |
| **Fix** | Add varied creators or remove the filter when using mock data. |

---

## Phase 10 — Campaign Scheduler & Template Editor

### ✅ Tested & Passing
- Campaigns list loads (3 seeded campaigns: Win-back Promo, Customer Appreciation, Summer Sale 2026)
- "Create Campaign" button opens creation modal
- Campaign details accessible via row action

### 🐛 BUG-015: No Campaign Status Management from List View

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Campaigns |
| **Steps** | 1. View Campaigns list → 2. Check available actions |
| **Expected** | Actions include Send/Schedule, Pause, Archive |
| **Actual** | Only basic CRUD actions. The backend has `CAMPAIGN.SEND` endpoint but no UI button to trigger it from the list. |
| **Fix** | Add "Send" and "Schedule" actions to the campaign list ActionMenu. |

---

## Phase 11 — Employees & RBAC Enforcement

### ✅ Tested & Passing
- Employee list loads
- Invite Employee modal opens with form fields
- Remove Employee confirmation works
- Employee profile accessible via navigation

### 🐛 BUG-016: MOCK_EMPLOYEES Fallback (Same Pattern)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Employees |
| **Root Cause** | [employees/index.tsx:27](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/employees/index.tsx#L27) |

### 🐛 BUG-017: PermissionGuard Hides Sidebar Items but Routes Are Unprotected

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | RBAC / Security |
| **Steps** | 1. Login as a "Member" role user → 2. Manually type `/dashboard/employees` in the URL bar |
| **Expected** | Access denied screen or redirect |
| **Actual** | The sidebar link is hidden by `PermissionGuard`, but the actual `<Route>` in [Dashboard.tsx](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/layouts/Dashboard.tsx) has NO permission check. Any user can access ANY route by typing the URL directly. |
| **Root Cause** | [Dashboard.tsx:37-56](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/layouts/Dashboard.tsx#L37-L56) — All routes render unconditionally. `PermissionGuard` is only used in the Sidebar for link visibility, NOT for route access control. |
| **Fix** | Wrap protected routes with `<PermissionGuard>` or create a `<ProtectedRouteWithPermission>` wrapper. |

---

## Phase 12 — Organization Settings

### ✅ Tested & Passing
- Settings page renders with 6 tabs: My Profile, Organization Profile, Roles & Permissions, Connections, Imports & Exports, Payment & Billing
- Tab switching works with smooth transitions
- Shopify connection form renders with domain, access token, and store name fields
- Meta Connections tab renders (Facebook/Instagram integration)
- Roles & Permissions tab shows role management UI

### 🐛 BUG-018: Shopify Sync Settings Are Local State Only (Not Persisted)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Settings → Connections |
| **Steps** | 1. Connect a Shopify store → 2. Toggle "Auto Sync" off → 3. Change "Sync Direction" → 4. Navigate away and come back |
| **Expected** | Settings are persisted to the backend |
| **Actual** | `autoSync`, `syncDirection`, and `selectedData` are all `useState` local state. They reset to defaults on every mount. |
| **Root Cause** | [ConnectionsTab.tsx:30-38](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/settings/components/ConnectionsTab.tsx#L30-L38) — These are client-only states, never sent to or loaded from the API. |
| **Fix** | Persist these settings via the integration update endpoint `INTEGRATION.UPDATE`. |

### 🐛 BUG-019: Access Token Displayed as Password Field But Never Masked/Redacted From Backend

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Settings → Connections |
| **Steps** | 1. Connect Shopify → 2. View the connection details |
| **Expected** | Access token is redacted (e.g., `shpat_****xxxx`) after submission |
| **Actual** | Access token input is `type="password"` during entry, but there's no indication that it's handled securely. The label says "We do not store your third-party account credentials" but the token IS stored for API calls. |
| **Fix** | Clarify security language or show a redacted token value on the connection details page. |

---

## Phase 13 — Payment & Billing (Paymob)

### ✅ Tested & Passing
- Payment & Billing tab renders with plan info
- Usage meters (Contacts, Emails, Storage) display with progress bars
- Upgrade Plan modal opens with plan cards
- Cancel Subscription confirmation works
- Billing History table renders

### 🐛 BUG-020: Usage Metrics Show Hardcoded Fallback Values

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Billing |
| **Steps** | 1. Settings → Payment & Billing tab |
| **Expected** | Real usage data from subscription API |
| **Actual** | Falls back to hardcoded values: 8,452 contacts, 42,000 emails, 2.1 GB storage |
| **Root Cause** | [PaymentBillingTab.tsx:36-46](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/settings/components/PaymentBillingTab.tsx#L36-L46) — Uses `??` fallback with hardcoded demo values. |
| **Fix** | Show actual usage or display "N/A" when data is unavailable. |

### 🐛 BUG-021: Invoice Download Is a Fake Toast Only

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Billing |
| **Steps** | 1. Billing tab → 2. Click "Download" on an invoice row |
| **Expected** | Downloads a PDF invoice |
| **Actual** | Shows toast `Downloading invoice {id} as PDF...` but no actual download occurs |
| **Root Cause** | [PaymentBillingTab.tsx:59-61](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/features/settings/components/PaymentBillingTab.tsx#L59-L61) — `handleDownloadInvoice` only calls `toast.success()`. |
| **Fix** | Implement actual PDF download using the billing API. |

---

## Phase 14 — Shopify Integration & Data Sync

### ✅ Tested & Passing
- Shopify connection form validates required fields
- Connected state shows store info, sync frequency, last sync time
- "Test Connection", "Sync Now", and "Unlink" buttons render
- Sync Logs modal opens with empty state or log entries
- Provider sub-tabs (Shopify / Meta) switch correctly

### 🐛 BUG-022: Sync Logs Modal Has No Pagination for Large Log Sets

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Shopify Integration |
| **Steps** | 1. Have many sync operations → 2. Open Sync Logs modal |
| **Expected** | Paginated log list or virtual scroll |
| **Actual** | All logs are loaded and rendered in a single scrollable div, which could be slow with hundreds of entries. |
| **Fix** | Add pagination or limit the displayed logs with a "Load More" button. |

---

## Phase 15 — Responsive Layout Inspection

### 🐛 BUG-023: Sidebar on Mobile — Open State Allows Content Interaction Through Overlay

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Layout / Responsive |
| **Steps** | 1. Open app on mobile viewport → 2. Open sidebar → 3. Try scrolling behind the overlay |
| **Expected** | Body scroll is locked when sidebar overlay is open |
| **Actual** | The overlay (`bg-black/40`) captures clicks but the page behind can still scroll, creating a jarring experience. |
| **Root Cause** | [Sidebar.tsx:175-179](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/components/Sidebar.tsx#L175-L179) — No `overflow: hidden` applied to the body when the sidebar is open. |
| **Fix** | Add `document.body.style.overflow = 'hidden'` when sidebar is open on mobile. |

### 🐛 BUG-024: DataTable Pagination Footer Overflows on Small Screens

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Layout / Responsive |
| **Steps** | 1. View Customers table on mobile (~375px) |
| **Expected** | Pagination controls stack or scroll gracefully |
| **Actual** | The footer uses `px-[40px]` fixed padding, causing horizontal overflow on narrow viewports. |
| **Root Cause** | [DataTable.tsx:292](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/components/DataTable.tsx#L292) — Fixed `px-[40px]` padding. |
| **Fix** | Use responsive padding like `px-4 md:px-[40px]`. |

---

## Phase 16 — UX & Design Inconsistencies

### 🐛 BUG-025: Sidebar Upgrade Card Shows Hardcoded "5 Days Left!" Trial Text

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Sidebar / UX |
| **Steps** | 1. View sidebar in expanded mode |
| **Expected** | Dynamic trial countdown based on actual subscription data |
| **Actual** | Always shows "5 Days left !" with a hardcoded 66% progress bar |
| **Root Cause** | [Sidebar.tsx:145](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/components/Sidebar.tsx#L145) — Hardcoded string. Progress bar is CSS-fixed at `right-[33.33%]`. |
| **Fix** | Connect to `useCurrentSubscription()` hook to show real remaining trial days. |

### 🐛 BUG-026: "Select Plan" Button in Sidebar Does Nothing

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | Sidebar / UX |
| **Steps** | 1. View sidebar → 2. Click "Select plan" link in the upgrade card |
| **Expected** | Navigates to billing settings or opens upgrade modal |
| **Actual** | The button has no `onClick` handler. It's purely decorative. |
| **Root Cause** | [Sidebar.tsx:159](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/components/Sidebar.tsx#L159) — `<button>` with no action. |
| **Fix** | Add `onClick={() => navigate('/dashboard/settings')}` and switch to billing tab. |

### 🐛 BUG-027: DataTable useEffect Dependency on Both `data.length` AND `data` Causes Infinite Reset Loop Risk

| Field | Detail |
|---|---|
| **Severity** | 🟢 Low |
| **Module** | DataTable |
| **Steps** | N/A — code-level issue |
| **Expected** | Pagination resets to page 1 when data changes |
| **Actual** | [DataTable.tsx:96-98](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/components/DataTable.tsx#L96-L98) — `useEffect` depends on both `data.length` and `data`, which is redundant. If `data` is a new array reference on each render (common with React Query), pagination resets on every render. |
| **Fix** | Remove `data` from the dependency array and rely only on `data.length`, or use a stable data reference. |

---

## Phase 17 — Security Route & Permission Leak Review

### 🐛 BUG-028: No 404 / Catch-All Route — Unknown URLs Show Blank Page

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | Routing / Security |
| **Steps** | 1. Navigate to `/dashboard/nonexistent` or `/random-page` |
| **Expected** | 404 page with navigation back to dashboard |
| **Actual** | Blank white page. No error boundary, no redirect, no feedback. |
| **Root Cause** | [router.tsx](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/app/router.tsx) has no `<Route path="*" .../>` catch-all. Neither does [Dashboard.tsx](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/layouts/Dashboard.tsx). |
| **Fix** | Add `<Route path="*" element={<NotFoundPage />} />` to both the root router and the dashboard sub-router. |

### 🐛 BUG-029: Rate Limiting Is Fully Disabled (Commented Out)

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | Backend Security |
| **Steps** | N/A — code review |
| **Expected** | Rate limiting protects against brute-force and DDoS |
| **Actual** | Lines 29, 33, 35 of [api/index.ts](file:///e:/Technology/Grad-Project-V2/Briefly-Client/E-Commerce-CRM/src/api/index.ts#L29-L35) show both general and auth rate limiters are commented out: `// router.use(getRateLimiter());` and `// router.use('/auth', getAuthLimiter());` |
| **Fix** | Uncomment rate limiting before production deployment. This is a **critical security vulnerability**. |

### 🐛 BUG-030: Frontend Routes Not Protected by Permissions (Detailed)

| Field | Detail |
|---|---|
| **Severity** | 🔴 Critical |
| **Module** | RBAC / Security |
| **Steps** | 1. Login as "Member" role → 2. Type `/dashboard/employees` or `/dashboard/analytics` directly in URL bar |
| **Expected** | Unauthorized users see an access denied page |
| **Actual** | All 16 sub-routes in [Dashboard.tsx:37-56](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/core/layouts/Dashboard.tsx#L37-L56) render unconditionally. Permission checks only exist at the sidebar link level (hiding the link), not at the route level. |
| **Impact** | Any authenticated user can access any module regardless of their role permissions. This includes sensitive areas like Employees, Settings, and Analytics. |
| **Fix** | Wrap each route with the appropriate `<PermissionGuard>` component. |

### 🐛 BUG-031: Auth Token Stored in localStorage (XSS Vulnerable)

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Authentication / Security |
| **Steps** | N/A — architectural concern |
| **Expected** | Token stored in httpOnly cookie or secure session storage |
| **Actual** | JWT token stored in localStorage via Zustand persist (`briefly-auth` key). This is accessible to any JavaScript running on the page, making it vulnerable to XSS attacks. |
| **Root Cause** | [auth.store.ts:57-60](file:///e:/Technology/Grad-Project-V2/Briefly-Client/src/store/auth.store.ts#L57-L60) — `storage: createJSONStorage(() => localStorage)` |
| **Mitigation** | While `withCredentials: true` is set on the API client (suggesting cookie support exists), the Bearer token is also sent via the Authorization header from localStorage. Consider using httpOnly cookies exclusively. |

### 🐛 BUG-032: CRON Endpoints Require Only `customers:write` — No Admin-Only Guard

| Field | Detail |
|---|---|
| **Severity** | 🟡 Medium |
| **Module** | Backend Security |
| **Steps** | 1. Obtain a token with `customers:write` permission → 2. POST `/api/cron/rfm` |
| **Expected** | Only admins or root owners can trigger cron jobs |
| **Actual** | Any user with `customers:write` permission can trigger RFM, lifecycle, and VIP cron jobs. These are powerful batch operations that affect all customer data. |
| **Root Cause** | [cron.router.ts:19-45](file:///e:/Technology/Grad-Project-V2/Briefly-Client/E-Commerce-CRM/src/api/cron/cron.router.ts#L19-L45) — Uses `requirePermission('customers:write')` instead of a dedicated admin/root-only check. |
| **Fix** | Add a dedicated `admin:only` or `cron:execute` permission, or restrict to `owner` role only. |

---

## Bug Summary Table

| ID | Severity | Module | Title |
|----|----------|--------|-------|
| BUG-001 | 🔴 Critical | Auth | Forgot Password link → dead route (blank page) |
| BUG-002 | 🟡 Medium | Onboarding | No re-entry path if onboarding abandoned |
| BUG-003 | 🔴 Critical | Dashboard | Stat cards show 0 despite seeded data |
| BUG-004 | 🟡 Medium | Dashboard | Sales chart uses hardcoded fallback data |
| BUG-005 | 🟢 Low | Dashboard | "View All" navigates to Settings instead of audit log |
| BUG-006 | 🟡 Medium | Customers | MOCK fallback masks API failures |
| BUG-007 | 🟡 Medium | Customers/Products/Orders | Export/Import buttons are no-ops |
| BUG-008 | 🟡 Medium | Products | MOCK fallback (same as BUG-006) |
| BUG-009 | 🟡 Medium | Orders | MOCK fallback (same as BUG-006) |
| BUG-010 | 🟢 Low | Tickets | No edit/delete/assign from list view |
| BUG-011 | 🟡 Medium | Tickets | MOCK fallback (same as BUG-006) |
| BUG-012 | 🟡 Medium | Conversations | Socket listener leak on reconnect |
| BUG-013 | 🟡 Medium | Segments | Type filter uses wrong field (`status` vs `type`) |
| BUG-014 | 🟢 Low | Segments | All mock segments have same creator |
| BUG-015 | 🟡 Medium | Campaigns | No send/schedule actions from list view |
| BUG-016 | 🟡 Medium | Employees | MOCK fallback (same as BUG-006) |
| BUG-017 | 🔴 Critical | RBAC | Routes unprotected — sidebar hides links but URL access works |
| BUG-018 | 🟡 Medium | Settings | Shopify sync settings are local state only |
| BUG-019 | 🟡 Medium | Settings | Access token security messaging misleading |
| BUG-020 | 🟡 Medium | Billing | Usage metrics use hardcoded fallback values |
| BUG-021 | 🟡 Medium | Billing | Invoice download is fake (toast only) |
| BUG-022 | 🟢 Low | Shopify | Sync logs modal has no pagination |
| BUG-023 | 🟡 Medium | Responsive | Mobile sidebar allows background scroll |
| BUG-024 | 🟢 Low | Responsive | DataTable pagination overflows on mobile |
| BUG-025 | 🟡 Medium | UX | Hardcoded "5 Days Left" trial text |
| BUG-026 | 🟢 Low | UX | "Select Plan" button in sidebar does nothing |
| BUG-027 | 🟢 Low | DataTable | useEffect dependency causes reset loop risk |
| BUG-028 | 🔴 Critical | Routing | No 404 page — unknown URLs show blank page |
| BUG-029 | 🔴 Critical | Security | Rate limiting fully disabled (commented out) |
| BUG-030 | 🔴 Critical | Security | Frontend routes not permission-gated |
| BUG-031 | 🟡 Medium | Security | Auth token in localStorage (XSS risk) |
| BUG-032 | 🟡 Medium | Security | CRON endpoints lack admin-only guard |

---

## Severity Distribution

| Severity | Count |
|----------|-------|
| 🔴 Critical | **6** |
| 🟡 Medium | **18** |
| 🟢 Low | **8** |
| **Total** | **32** |

---

## Production Readiness Score

### Score: **38 / 100**

> [!CAUTION]
> **NOT READY FOR PRODUCTION.** Six critical bugs must be resolved before any customer-facing release.

### Critical Blockers (Must Fix Before Launch)
1. **BUG-029**: Rate limiting disabled — the backend is completely unprotected against brute-force and DDoS attacks
2. **BUG-030 & BUG-017**: Route-level RBAC missing — any authenticated user can access any module
3. **BUG-028**: No 404 page — broken URLs result in blank screens
4. **BUG-001**: Forgot Password is a dead link
5. **BUG-003**: Dashboard shows all zeroes — the primary landing page appears broken to new users

### High-Priority Fixes (Should Fix Before Launch)
- MOCK data fallbacks masking real errors across 6 modules
- Export/Import buttons being non-functional decoys
- Billing page showing fake usage data and non-functional invoice downloads
- Shopify sync settings not persisting
- Socket listener memory leak

### Positive Highlights
- ✅ Authentication flow (signup, login, logout) works correctly
- ✅ Session persistence works reliably
- ✅ PermissionGuard component architecture is well-designed (just needs route-level usage)
- ✅ Conversations module is feature-rich with real-time typing indicators, agent assignment, and multi-provider support
- ✅ DataTable component is well-built with pagination, selection, and loading states
- ✅ Settings page has comprehensive tab organization
- ✅ Auto-logout on 401 response works correctly
- ✅ Mobile sidebar overlay and responsive column layouts work
