import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Auth Store — single source of truth for authentication.
 *
 * Stores the Bearer token, user object, and onboarding status.
 * Persisted to localStorage so it survives page refreshes.
 *
 * Flow:
 *   Signup  → token + user saved, onboardingComplete = false → /onboarding
 *   Login   → token + user saved, onboardingComplete = true  → /dashboard
 *   Logout  → everything cleared → /login
 */

export type AuthUser = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
};

type AuthState = {
    token: string | null;
    user: AuthUser | null;
    role: string | null;
    permissions: Record<string, string[]> | null;
    onboardingComplete: boolean;
    sessionRestored: boolean;

    // Actions
    setSession: (token: string, user: AuthUser, role: string | null, permissions: Record<string, string[]> | null, onboardingComplete?: boolean) => void;
    completeOnboarding: () => void;
    clearSession: () => void;
    setSessionRestored: (restored: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            role: null,
            permissions: null,
            onboardingComplete: false,

            setSession: (token, user, role, permissions, onboardingComplete = false) =>
                set({ token, user, role, permissions, onboardingComplete }),

            completeOnboarding: () =>
                set({ onboardingComplete: true }),

            sessionRestored: false,

            setSessionRestored: (restored) =>
                set({ sessionRestored: restored }),

            clearSession: () =>
                set({
                    token: null,
                    user: null,
                    role: null,
                    permissions: null,
                    onboardingComplete: false,
                }),
        }),
        {
            name: "briefly-auth",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
