import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest, RegisterRequest } from "@/core/types/api.type";
import apiClient from "@/api/client";

/**
 * Central auth hook — direct axios calls + Zustand store.
 *
 * Signup  → saves token with onboardingComplete=false → navigates to /onboarding
 * Login   → saves token with onboardingComplete=true  → navigates to /dashboard
 * Logout  → clears everything → navigates to /login
 */
export function useAuth() {
    const navigate = useNavigate();
    const { user, token, onboardingComplete, setSession, clearSession } = useAuthStore();

    const isAuthenticated = !!token;

    // ─── Login ───
    const login = async (values: LoginRequest) => {
        try {
            const { data: authData } = await apiClient.post("/auth/sign-in/email", {
                email: values.email,
                password: values.password,
            });
            
            // Now fetch the user details and role/permissions using /me
            const { data: meResponse } = await apiClient.get("/me", {
                headers: { Authorization: `Bearer ${authData.token}` }
            });
            const meData = meResponse.data;
            const user = meData;
            const role = meData?.role ?? null;
            const permissions = meData?.permissions ?? null;
            const token = authData.token;
            const onboardingComplete = !!meData?.activeOrganizationId;

            setSession(token, user, role, permissions, onboardingComplete);
            toast.success("Welcome back!");
            if (onboardingComplete) {
                navigate("/dashboard");
            } else {
                navigate("/onboarding");
            }
            return { error: null };
        } catch (err: any) {
            const message = err?.response?.data?.message || "Login failed. Please try again.";
            toast.error(message);
            return { error: message };
        }
    };

    // ─── Register ───
    const register = async (values: RegisterRequest) => {
        try {
            const { data: authData } = await apiClient.post("/auth/sign-up/email", {
                email: values.email,
                password: values.password,
                name: values.name,
            });

            // Now fetch the user details using /me
            const { data: meResponse } = await apiClient.get("/me", {
                headers: { Authorization: `Bearer ${authData.token}` }
            });
            const meData = meResponse.data;
            const user = meData;
            const role = meData?.role ?? null;
            const permissions = meData?.permissions ?? null;
            const token = authData.token;

            // New user — must complete onboarding first
            setSession(token, user, role, permissions, false);
            toast.success("Account created!");
            navigate("/onboarding");
            return { error: null };
        } catch (err: any) {
            const message = err?.response?.data?.message || "Registration failed.";
            toast.error(message);
            return { error: message };
        }
    };

    // ─── Social Login (Google) ───
    const loginWithGoogle = async () => {
        const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "";
        window.location.href = `${baseURL}/api/auth/sign-in/social?provider=google&callbackURL=${window.location.origin}/dashboard`;
    };

    // ─── Logout ───
    const logout = async () => {
        try {
            await apiClient.post("/auth/sign-out");
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
