import { useState, useEffect } from "react";
import AppRouter from "./router";
import Providers from "./providers";
import { useAuthStore } from "@/store/auth.store";
import { authClient } from "@/lib/auth-client";
import apiClient from "@/api/client";

function AuthInit({ children }: { children: React.ReactNode }) {
    const { token, setSession } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (!token) {
                try {
                    const sessionData = await authClient.getSession();
                    if (sessionData?.data) {
                        const { session } = sessionData.data;
                        const { data: meResponse } = await apiClient.get("/me");
                        const meData = meResponse.data;
                        const user = meData;
                        const role = meData?.role ?? null;
                        const permissions = meData?.permissions ?? null;
                        const tokenVal = session.token;
                        const onboardingComplete = !!meData?.activeOrganizationId;
                        setSession(tokenVal, user, role, permissions, onboardingComplete);
                    }
                } catch (err) {
                    console.error("Failed to restore session:", err);
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token, setSession]);

    if (isLoading) {
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
            <AuthInit>
                <AppRouter />
            </AuthInit>
        </Providers>
    );
}

export default App;

