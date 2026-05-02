import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * UI Store — for client-side UI state ONLY.
 *
 * DO NOT store auth/user data here.
 * Auth is fully managed by Better Auth (see src/lib/auth-client.ts).
 *
 * Use this for: sidebar state, theme, modals, etc.
 */
type UIStoreType = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
};

export const useUIStore = create<UIStoreType>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: "briefly-ui",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
