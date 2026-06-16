import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest, RegisterRequest } from "@/core/types/api.type";
import { authClient } from "@/lib/auth-client";
import { fetchAuthSession } from "@/lib/auth-session";

/**
 * Central auth hook — uses Better Auth client + Zustand store.
 *
 * Signup  → saves token with onboardingComplete=false → navigates to /onboarding
 * Login   → saves token with onboardingComplete=true  → navigates to /dashboard
 * Logout  → clears everything → navigates to /login
 */
export function useAuth() {
    const navigate = useNavigate();
    const { user, token, onboardingComplete, setSession, clearSession } = useAuthStore();

    const isAuthenticated = Boolean(user || token);

    const hydrateAuthState = async (fallbackData: unknown, onboardingDone: boolean) => {
        const fallback = (fallbackData ?? {}) as {
            token?: string;
            session?: { token?: string | null; activeOrganizationId?: string | null } | null;
            user?: unknown;
            activeOrganizationId?: string | null;
        };

        const session = (await fetchAuthSession(3, 200)) ?? parseFallbackSession(fallback, onboardingDone);
        if (!session) {
            return { ok: false as const, error: "Session data incomplete. Please try again." };
        }

        setSession(
            session.token,
            session.user as any,
            session.role,
            session.permissions,
            session.onboardingComplete
        );

        return { ok: true as const };
    };

    const parseFallbackSession = (
        fallback: {
            token?: string;
            session?: { token?: string | null; activeOrganizationId?: string | null } | null;
            user?: unknown;
            activeOrganizationId?: string | null;
        },
        onboardingDone: boolean
    ) => {
        if (!fallback.user) return null;

        const activeOrganizationId =
            fallback.session?.activeOrganizationId ?? fallback.activeOrganizationId ?? null;

        return {
            token: fallback.session?.token ?? fallback.token ?? "",
            user: fallback.user,
            role: null,
            permissions: null,
            onboardingComplete: onboardingDone || Boolean(activeOrganizationId),
        };
    };

    // ─── Login ───
    const login = async (values: LoginRequest) => {
        try {
            const { data, error } = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            });
            
            if (error) {
                toast.error(error.message || "Login failed. Please try again.");
                return { error: error.message };
            }
            
            const hydrated = await hydrateAuthState(data, Boolean(data?.session?.activeOrganizationId ?? data?.activeOrganizationId));
            if (!hydrated.ok) {
                toast.error(hydrated.error);
                return { error: hydrated.error };
            }

            const { onboardingComplete } = useAuthStore.getState();
            toast.success("Welcome back!");
            navigate(onboardingComplete ? "/dashboard" : "/onboarding");
            return { error: null };
        } catch (err: any) {
            const message = err?.message || "Login failed. Please try again.";
            toast.error(message);
            return { error: message };
        }
    };

    // ─── Register ───
    const register = async (values: RegisterRequest) => {
        try {
            const { data, error } = await authClient.signUp.email({
                email: values.email,
                password: values.password,
                name: values.name,
            });

            if (error) {
                toast.error(error.message || "Registration failed.");
                return { error: error.message };
            }

            const hydrated = await hydrateAuthState(data, false);
            if (!hydrated.ok) {
                toast.error(hydrated.error);
                return { error: hydrated.error };
            }

            toast.success("Account created!");
            navigate("/onboarding");
            return { error: null };
        } catch (err: any) {
            const message = err?.message || "Registration failed.";
            toast.error(message);
            return { error: message };
        }
    };

    // ─── Social Login (Google) ───
    const loginWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/auth/callback`,
        });
    };

    // ─── Logout ───
    const logout = async () => {
        try {
            await authClient.signOut();
        } catch {
            // Even if server call fails, clear local state
        }
        clearSession();
        toast.success("Logged out successfully.");
        navigate("/login");
    };

    return {
        user,
        token,
        isAuthenticated,
        onboardingComplete,
        isPending: false,

        login,
        register,
        loginWithGoogle,
        logout,
    };
}
