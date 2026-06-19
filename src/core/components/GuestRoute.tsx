import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

/**
 * Wraps routes only accessible to non-authenticated users (login, signup).
 *
 * NEVER redirects to /onboarding — that decision is made by the login
 * function after all recovery checks complete. GuestRoute only redirects
 * to /dashboard when authenticated, and ProtectedRoute handles the
 * onboarding redirect if the user lands there without completing it.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = Boolean(user || token);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
