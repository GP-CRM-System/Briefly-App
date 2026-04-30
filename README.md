# Briefly CRM - Client

Briefly is a modern, high-performance Customer Relationship Management (CRM) dashboard designed to streamline business operations and centralize company data. This repository contains the React-based frontend client.

## 🚀 Tech Stack

We use a modern, robust tech stack designed for scalability and developer experience:

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: 
  - Server State: [TanStack Query v5](https://tanstack.com/query/latest) (Caching, fetching, synchronization)
  - Client State: [Zustand v5](https://zustand-demo.pmnd.rs/) (Lightweight UI state)
- **Forms & Validation**: [Formik](https://formik.org/) + [Yup](https://github.com/jquense/yup)
- **API Client**: [Axios](https://axios-http.com/)
- **UI Notifications**: [React Hot Toast](https://react-hot-toast.com/)

## 📂 Folder Structure

The project follows a feature-sliced architectural pattern to keep domains separated as the CRM scales:

```text
src/
├── api/                  # API client setup and endpoint definitions
│   ├── client.ts         # Axios instance and interceptors (planned)
│   └── endpoints/        # API route constants and typed fetch functions
├── app/                  # Application entry point and global wrappers
│   ├── App.tsx           # Main component rendering providers and router
│   ├── providers.tsx     # Global context providers (React Query, Toaster, etc.)
│   └── router.tsx        # Centralized route definitions
├── core/                 # Shared, feature-agnostic code
│   ├── components/       # Reusable UI components (Buttons, Inputs, Icons)
│   ├── hooks/            # Global custom hooks
│   ├── layouts/          # Layout shells (Dashboard, Auth)
│   ├── types/            # Shared TypeScript interfaces
│   └── utils/            # Helper functions and formatters
├── features/             # Business domain modules (e.g., Contacts, Deals)
│   └── Analytics/        # Example feature module
├── pages/                # Public/unauthenticated routes
│   ├── auth/             # Login, Signup
│   └── landing/          # Landing page sections
├── index.css             # Global CSS and Tailwind entry
└── main.tsx              # React DOM render entry
```

## 🛠️ Development Setup

1. **Install Dependencies**
   Make sure you are using Node.js v20+.
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Architecture Guidelines

- **Server State vs Client State**: Do not sync API data into Zustand. Use React Query (`useQuery`, `useMutation`) for all server interactions. Use Zustand only for global UI coordination (e.g., sidebar state, theme).
- **Feature Slices**: When creating a new CRM module (like Tickets), create a new folder under `features/Tickets/`. Keep all components, hooks, and types specific to that domain inside that folder.
- **Routing**: All new routes should be registered in `src/app/router.tsx`.
