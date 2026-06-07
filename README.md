<p align="center">
  <img src="public/favicon.svg" alt="Briefly Logo" width="120" height="120" />
</p>

<h1 align="center">Briefly CRM</h1>

<p align="center">
  <strong>A Scaleable, Multi-Tenant E-Commerce CRM Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.4-blue?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0.2-blue?logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.2.2-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT" />
</p>

---

Briefly is a high-performance Customer Relationship Management (CRM) platform designed specifically for modern e-commerce merchants. The system aggregates transaction details, tracks customer behavioral metrics (such as RFM categories, lifetime value, and churn risk), manages customer support ticketing workflows, and streamlines third-party integrations (such as Shopify) into a single workspace.

This repository contains the single-page application (SPA) frontend client.

---

## ⚡ Key Features

*   **Customer Intelligence Dashboard**: Detailed customer profiles featuring advanced telemetry (Recency, Frequency, Monetary segmentation), activity logs, and chronological support histories.
*   **Multi-Tenant Organization Management**: Isolated workflows allowing administrators to manage organization profiles, customize active roles, and delete tenant resources safely.
*   **Support Ticket Center**: Integrated conversation threads and status tracking for handling client inquiries.
*   **Shopify Integration Controls**: Simplified connection flows for external Shopify stores using custom credentials, automatic conflict resolution policies, and live sync progress reports.
*   **Granular Role-Based Access Control (RBAC)**: Custom role definitions mapped to explicit Resource-Action scopes (Read, Write, Delete).

---

## 🚀 Tech Stack

Briefly leverages a modern, unified technology stack optimized for high runtime efficiency and type-safe scaling:

*   **Core Framework**: [React 19.2.4](https://react.dev/) + [Vite 8.0.4](https://vitejs.dev/)
*   **Routing**: [React Router v7](https://reactrouter.com/) (Declarative nested layout routing)
*   **State Management**:
    *   *Server State*: [TanStack Query v5](https://tanstack.com/query) (Automatic stale-while-revalidate caching and invalidation cascades)
    *   *Client State*: [Zustand v5](https://github.com/pmndrs/zustand) (Lightweight, locally persisted app session storage)
*   **Forms & Validation**: [Formik](https://formik.org/) & [Yup](https://github.com/jquense/yup)
*   **Network Client**: [Axios](https://axios-http.com/) (Equipped with centralized request token injection and automatic 401 handling interceptors)
*   **Visual System**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom CSS custom properties
*   **UI Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📂 Project Structure

Briefly follows a **Feature-Isolated Layered Pattern** to prevent cross-domain coupling and visual clutter as modules expand:

```text
src/
├── api/                   # Global network client and interceptors configuration
│   ├── client.ts          # Central Axios client instance
│   └── endpoints/         # Centralized API path dictionary mapping
├── app/                   # Top-level shell bootstrap
│   ├── App.tsx            # Main application component
│   ├── providers.tsx      # Global context providers (React Query, UI, Toast)
│   └── router.tsx         # Consolidated client router mapping
├── assets/                # Graphic assets (SVGs, logos, custom iconography)
├── core/                  # Shared, feature-agnostic infrastructure
│   ├── components/        # Generic UI widgets (DataTable, PageLayout, Modal, etc.)
│   ├── layouts/           # Dashboard shell layout structure (Sidebar + Navbar)
│   ├── types/             # Shared TypeScript interface definitions
│   └── hooks/             # Shared custom hooks (e.g., useAuth session manager)
├── features/              # Self-contained business domain feature modules
│   ├── customers/         # Customer profiles, notes, list page, hooks, services
│   ├── orders/            # Transaction listing, status updates, detail view
│   ├── segments/          # Customer cohort filtering and rule definition
│   └── settings/          # Multi-tenant settings, RBAC profiles, integrations
├── store/                 # Zustand global client-side state engines
└── pages/                 # Public entry views (landing, signup, login)
```

---

## 🛠️ Development Setup

Ensure you have [Node.js](https://nodejs.org/) v20+ and `npm` installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start the Development Server
```bash
npm run dev
```
The client dashboard will launch at `http://localhost:5173`.

### 4. Build for Production
Generate optimized, production-ready static assets:
```bash
npm run build
```

---

## 🏗️ Core Architecture Guidelines

Before writing code in this repository, please review these key guidelines:

1.  **Feature Isolation**: Keep all domain-specific UI, hooks, service files, and types within their respective feature folder under `src/features/`. Never import files directly from one feature folder into another. If logic must be shared, promote it to `src/core/`.
2.  **Server State vs. Client State**: Do not copy server responses into Zustand stores. Rely entirely on TanStack Query cache mechanisms for data storage and dynamic invalidations.
3.  **Strict Token Injection**: Avoid invoking `apiClient` or raw Axios requests inside view components. Delegate all network operations to feature-level services, wrap them in custom React Query hooks, and call the hooks in components.
4.  **TypeScript Standards**: Enable type verification at compile time. Always use type-only imports (`import type { ... }`) for typescript declarations to allow optimized bundler compilation.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).
