import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/store/auth.store";
import apiClient from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export type RestoredAuthSession = {
    token: string;
    user: AuthUser;
    role: string | null;
    permissions: Record<string, string[]> | null;
    onboardingComplete: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseSessionPayload(session: unknown): RestoredAuthSession | null {
    if (!session || typeof session !== "object") return null;

    const payload = session as {
        user?: AuthUser;
        session?: { token?: string | null; activeOrganizationId?: string | null };
        activeOrganizationId?: string | null;
        role?: string | null;
        permissions?: Record<string, string[]> | null;
    };

    if (!payload.user) return null;

    const activeOrganizationId =
        payload.session?.activeOrganizationId ?? payload.activeOrganizationId ?? null;

    const currentToken = useAuthStore.getState().token;

    return {
        token: payload.session?.token ?? currentToken ?? "",
        user: payload.user,
        role: payload.role ?? null,
        permissions: payload.permissions ?? null,
        onboardingComplete: Boolean(activeOrganizationId),
    };
}

/** Fetch the current session using Bearer token instead of cookies.
 * Falls back when cookie-based fetchAuthSession() fails cross-origin.
 * The backend has the bearer plugin enabled — it accepts the session
 * token as Authorization: Bearer <token> on all endpoints.
 */
export async function fetchBearerAuthSession(): Promise<RestoredAuthSession | null> {
    const token = useAuthStore.getState().token;
    if (!token) return null;

    try {
        const response = await apiClient.get(ENDPOINTS.AUTH.GET_SESSION);
        return parseSessionPayload(response.data);
    } catch {
        return null;
    }
}

/**
 * Attempt to recover a session that lacks activeOrganizationId.
 * Fetches org list via Bearer-token API (works cross-origin) and sets
 * the first org as active. Returns the refreshed session on success.
 *
 * Extracted as a shared helper — used in hydrateAuthState, AuthCallback,
 * and SessionInitializer to keep recovery logic consistent.
 */
export async function recoverOrganizationSession(
    session: RestoredAuthSession
): Promise<RestoredAuthSession> {
    if (session.onboardingComplete) return session;

    try {
        const { data: orgs } = await apiClient.get(ENDPOINTS.ORGANIZATION.LIST);
        const orgList = Array.isArray(orgs) ? orgs : (orgs?.organizations || []);
        if (orgList.length > 0) {
            await apiClient.post(ENDPOINTS.ORGANIZATION.SET_ACTIVE, {
                organizationId: orgList[0].id
            });
            // Re-fetch to get updated role/permissions from refreshed session
            const refreshed = await fetchBearerAuthSession();
            if (refreshed) {
                return refreshed;
            }
            // Re-fetch failed but setActive succeeded — mark complete
            session.onboardingComplete = true;
        }
    } catch (e) {
        console.error("[OrgRecovery] Failed:", e);
    }

    return session;
}

/** Fetch the current Better Auth session, retrying for OAuth redirect races. */
export async function fetchAuthSession(
    attempts = 5,
    delayMs = 250
): Promise<RestoredAuthSession | null> {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        const { data, error } = await authClient.getSession();
        const parsed = parseSessionPayload(data);

        if (parsed && !error) return parsed;
        if (attempt < attempts - 1) await sleep(delayMs);
    }

    return null;
}

/** Returns true when a cookie-backed session is still valid after a 401. */
export async function hasValidAuthSession(): Promise<boolean> {
    const session = await fetchAuthSession(1, 0);
    return session !== null;
}
