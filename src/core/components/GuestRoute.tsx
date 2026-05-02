import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

/**
 * Wraps routes only accessible to non-authenticated users (login, signup).
 *
 * - Has token + onboarding complete → redirect to /dashboard
 * - Has token + onboarding NOT complete → redirect to /onboarding
 * - No token → render children (show login/signup)
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
    const token = useAuthStore((s) => s.token);
    const onboardingComplete = useAuthStore((s) => s.onboardingComplete);

    if (token && onboardingComplete) {
        return <Navigate to="/dashboard" replace />;
    }

    if (token && !onboardingComplete) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
}
