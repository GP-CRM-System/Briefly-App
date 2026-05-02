import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "http://localhost:5000",
    fetchOptions: {
        credentials: "include" as RequestCredentials,
        auth: {
            type: "Bearer",
            token: () => localStorage.getItem("auth_token") || ""
        }
    },
});

// Export commonly used methods for convenience
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
