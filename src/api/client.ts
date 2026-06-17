import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { hasValidAuthSession } from "@/lib/auth-session";

/**
 * Axios client — for ALL API calls (auth + CRM data).
 *
 * The request interceptor reads the token from the Zustand auth store
 * and attaches it as a Bearer token on every request.
 *
 * The response interceptor catches 401s and clears the session
 * so the user gets redirected to login on the next render.
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// ─── Request interceptor: attach Bearer token ───
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response interceptor: auto-logout on 401 ───
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const stillAuthenticated = await hasValidAuthSession();
            if (!stillAuthenticated) {
                useAuthStore.getState().clearSession();
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
