import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/auth.store";
import type { AuthUser } from "@/store/auth.store";

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
