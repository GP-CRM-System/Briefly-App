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
            
            // Now fetch the full session with permissions
            const { data: sessionData } = await apiClient.get("/auth/get-session", {
                headers: { Authorization: `Bearer ${authData.token}` }
            });

            // console.log("test", sessionData);

            // Returning user — onboarding already done
            setSession(sessionData.token, sessionData.user, sessionData.role, sessionData.permissions, true);
            toast.success("Welcome back!");
            navigate("/dashboard");
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

            // Now fetch the full session with permissions
            const { data: sessionData } = await apiClient.get("/auth/get-session", {
                headers: { Authorization: `Bearer ${authData.token}` }
            });

            // New user — must complete onboarding first
            setSession(sessionData.token, sessionData.user, sessionData.role, sessionData.permissions, false);
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
