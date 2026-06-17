import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { useAuthStore } from "@/store/auth.store";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "").replace(/\/+$/, "") || "http://localhost:6892",
    fetchOptions: {
        credentials: "include" as RequestCredentials,
        auth: {
            type: "Bearer",
            token: () => useAuthStore.getState().token || "",
        },
        onSuccess: (ctx) => {
            const authToken = ctx.response.headers.get("set-auth-token");
            if (authToken) {
                useAuthStore.setState({ token: authToken });
            }
        }
    },
    plugins: [
        organizationClient()
    ]
});

// Export commonly used methods for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
