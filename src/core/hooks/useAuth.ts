import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest, RegisterRequest } from "@/core/types/api.type";
import { authClient } from "@/lib/auth-client";
import { fetchAuthSession, fetchBearerAuthSession, recoverOrganizationSession } from "@/lib/auth-session";
import type { RestoredAuthSession } from "@/lib/auth-session";
import type { AuthUser } from "@/store/auth.store";

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

        // Extract token from the sign-in response BEFORE any session fetch attempts.
        // This is critical on Vercel cross-origin where:
        //  1) set-auth-token header is stripped (onSuccess callback can't set it)
        //  2) fetchAuthSession() fails or returns session without token (cookies blocked by SameSite=Lax)
        // The Bearer token is the only reliable auth mechanism cross-origin.
        const loginToken = (fallback as any)?.session?.token || (fallback as any)?.token || null;
        if (loginToken && !useAuthStore.getState().token) {
            useAuthStore.setState({ token: loginToken });
        }

        // Try cookie-based session fetch first, then Bearer token fallback,
        // then finally parse the login response directly.
        let session = await fetchAuthSession(3, 200);
        if (!session) {
            session = await fetchBearerAuthSession();
        }
        if (!session) {
            session = parseFallbackSession(fallback, onboardingDone);
        }
        if (!session) {
            return { ok: false as const, error: "Session data incomplete. Please try again." };
        }

        // Ensure the Bearer token is in the store for apiClient interceptor.
        // Covers the case where fetchAuthSession succeeded but didn't return a token.
        if (session.token && !useAuthStore.getState().token) {
            useAuthStore.setState({ token: session.token });
        }

        // Recovery: if session lacks org, attempt to find and set active via Bearer token.
        session = await recoverOrganizationSession(session);

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
    ): RestoredAuthSession | null => {
        if (!fallback.user) return null;

        const activeOrganizationId =
            fallback.session?.activeOrganizationId ?? fallback.activeOrganizationId ?? null;

        return {
            token: fallback.session?.token ?? fallback.token ?? "",
            user: fallback.user as AuthUser,
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
                // Check if this is an email verification error
                // Better Auth docs: the client error object may have status, statusCode, or code
                const err = error as any;
                const isVerificationError =
                    err?.status === 403 ||
                    err?.statusCode === 403 ||
                    err?.code === "EMAIL_NOT_VERIFIED" ||
                    err?.name === "EMAIL_NOT_VERIFIED" ||
                    String(error?.message ?? "").toLowerCase().includes("verify") ||
                    String(error?.message ?? "").toLowerCase().includes("email not verified");

                if (isVerificationError) {
                    clearSession();
                    navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
                    return { error: "Please verify your email before signing in." };
                }

                toast.error(error.message || "Login failed. Please try again.");
                return { error: error.message };
            }
            
            const hydrated = await hydrateAuthState(data, Boolean((data as any)?.session?.activeOrganizationId ?? (data as any)?.activeOrganizationId));
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
                callbackURL: `${window.location.origin}/verify-email?verified=true`,
            });

            if (error) {
                toast.error(error.message || "Registration failed.");
                return { error: error.message };
            }

            // Check if email verification is required but not yet verified
            const userData = (data as any)?.user ?? null;
            const emailVerified = userData?.emailVerified ?? true;

            if (!emailVerified) {
                // Clear any partial session and redirect to verification page
                const email = userData?.email || values.email;
                clearSession();
                toast.success("Account created! Check your email to verify.");
                navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                return { error: null };
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

    // ─── Social Login ───
    const loginWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: `${window.location.origin}/auth/callback`,
        });
    };

    const loginWithFacebook = async () => {
        await authClient.signIn.social({
            provider: "facebook",
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
        loginWithFacebook,
        logout,
    };
}

