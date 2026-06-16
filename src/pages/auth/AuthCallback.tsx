import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/store/auth.store";

/**
 * OAuth callback landing page.
 * Better Auth redirects here after Google sign-in so we can hydrate
 * session state before entering protected routes.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const setSession = useAuthStore((s) => s.setSession);
    const setSessionRestored = useAuthStore((s) => s.setSessionRestored);

    useEffect(() => {
        let cancelled = false;

        const completeOAuth = async () => {
            const session = await fetchAuthSession();

            if (cancelled) return;

            if (!session) {
                setSessionRestored(true);
                navigate("/login", { replace: true });
                return;
            }

            setSession(
                session.token,
                session.user,
                session.role,
                session.permissions,
                session.onboardingComplete
            );
            setSessionRestored(true);

            navigate(
                session.onboardingComplete ? "/dashboard" : "/onboarding",
                { replace: true }
            );
        };

        completeOAuth();

        return () => {
            cancelled = true;
        };
    }, [navigate, setSession, setSessionRestored]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <p className="text-sm text-gray-500">Completing sign in...</p>
        </div>
    );
}
