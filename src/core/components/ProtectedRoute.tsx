import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

/**
 * Wraps routes that require FULL authentication (token + onboarding done).
 *
 * - No token → redirect to /login
 * - Has token but onboarding not complete → redirect to /onboarding
 * - Has token and onboarding complete → render children
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token);
    const onboardingComplete = useAuthStore((s) => s.onboardingComplete);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!onboardingComplete && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}
