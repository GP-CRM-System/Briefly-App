import { useAuthStore } from "@/store/auth.store";

type PermissionGuardProps = {
    /** Permission string in format "Resource.action" e.g. "Contact.read" */
    permission: string;
    /** Content shown when user DOES NOT have permission */
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

/**
 * Conditionally renders children based on user permissions.
 * Use this to hide sidebar items, buttons, or entire sections
 * that the current user's role doesn't have access to.
 *
 * @example
 * <PermissionGuard permission="Contact.read">
 *     <ContactsPage />
 * </PermissionGuard>
 */
export function PermissionGuard({
    permission,
    fallback = null,
    children,
}: PermissionGuardProps) {
    const permissions = useAuthStore((s) => s.permissions) || {};

    // console.log(permissions);

    const [resource, action] = permission.split(".");

    if (!resource || !action) {
        console.warn(`[PermissionGuard] Invalid permission format: "${permission}". Expected "Resource.action".`);
        return <>{fallback}</>;
    }

    const resourcePermissions = permissions[resource];
    const hasPermission = resourcePermissions?.includes(action);

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
