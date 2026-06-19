import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, fetchBearerAuthSession, recoverOrganizationSession } from "@/lib/auth-session";
import { useAuthStore } from "@/store/auth.store";

/**
 * OAuth callback landing page.
 * Better Auth redirects here after Google sign-in so we can hydrate
 * session state before entering protected routes.
 *
 * Cross-origin (Vercel): tries cookie-based fetchAuthSession() first.
 * If that fails (SameSite=Lax blocks cookies), falls back to Bearer-token
 * fetchBearerAuthSession(). Then recovers org if session lacks it.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const setSession = useAuthStore((s) => s.setSession);
    const setSessionRestored = useAuthStore((s) => s.setSessionRestored);

    useEffect(() => {
        let cancelled = false;

        const completeOAuth = async () => {
            // 1. Try cookie-based session fetch (works same-origin)
            let session = await fetchAuthSession(5, 400);

            // 2. Fallback: Bearer token session fetch (works cross-origin on Vercel)
            if (!session) {
                session = await fetchBearerAuthSession();
            }

            if (cancelled) return;

            if (!session) {
                setSessionRestored(true);
                navigate("/login", { replace: true });
                return;
            }

            // 3. Org recovery: shared helper uses Bearer token API
            session = await recoverOrganizationSession(session);

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
