import { useEffect, useState } from "react";
import AppRouter from "./router";
import Providers from "./providers";
import { fetchAuthSession } from "@/lib/auth-session";
import { useAuthStore } from "@/store/auth.store";

/**
 * Restores Better Auth session after app load.
 *
 * Waits for Zustand persist hydration first so OAuth cookie sessions
 * are not overwritten by stale localStorage state.
 */
function SessionInitializer({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const setSession = useAuthStore((s) => s.setSession);
    const sessionRestored = useAuthStore((s) => s.sessionRestored);
    const setSessionRestored = useAuthStore((s) => s.setSessionRestored);
    const [storeHydrated, setStoreHydrated] = useState(
        () => useAuthStore.persist.hasHydrated()
    );

    useEffect(() => {
        if (storeHydrated) return;

        return useAuthStore.persist.onFinishHydration(() => {
            setStoreHydrated(true);
        });
    }, [storeHydrated]);

    useEffect(() => {
        if (!storeHydrated) return;

        if (user || token) {
            setSessionRestored(true);
            return;
        }

        let cancelled = false;

        const restoreSession = async () => {
            try {
                const session = await fetchAuthSession();

                if (cancelled) return;

                if (session) {
                    setSession(
                        session.token,
                        session.user,
                        session.role,
                        session.permissions,
                        session.onboardingComplete
                    );
                }
            } finally {
                if (!cancelled) {
                    setSessionRestored(true);
                }
            }
        };

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, [storeHydrated, user, token, setSession, setSessionRestored]);

    if (!storeHydrated || !sessionRestored) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return <>{children}</>;
}

function App() {
    return (
        <Providers>
            <SessionInitializer>
                <AppRouter />
            </SessionInitializer>
        </Providers>
    );
}

export default App;

