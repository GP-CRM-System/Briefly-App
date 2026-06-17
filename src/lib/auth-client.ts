import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, "").replace(/\/+$/, "") || "http://localhost:6892",
    fetchOptions: {
        credentials: "include" as RequestCredentials
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
