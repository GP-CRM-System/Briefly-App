/**
 * API Endpoints — synced with the Briefly backend Postman collection.
 *
 * Auth endpoints use `authUrl` = /api/auth/...
 * All other endpoints use `baseUrl` = /api/...
 *
 * The apiClient (src/api/client.ts) already has baseURL set to /api,
 * so paths here are relative to that.
 */

export const ENDPOINTS = {
  // ─── Auth (Better Auth) ───
  // These are called via apiClient which has baseURL = /api
  AUTH: {
    SIGN_IN_EMAIL: "/auth/sign-in/email",
    SIGN_UP_EMAIL: "/auth/sign-up/email",
    SIGN_OUT: "/auth/sign-out",
    GET_SESSION: "/auth/get-session",
    VERIFY_EMAIL: "/auth/verify-email",
    SEND_VERIFICATION_EMAIL: "/auth/send-verification-email",
    CHANGE_PASSWORD: "/auth/change-password",
    CHANGE_EMAIL: "/auth/change-email",
    REQUEST_PASSWORD_RESET: "/auth/request-password-reset",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_PASSWORD: "/auth/verify-password",
    UPDATE_USER: "/auth/update-user",
    DELETE_USER: "/auth/delete-user",
    LIST_SESSIONS: "/auth/list-sessions",
    REVOKE_SESSION: "/auth/revoke-session",
    REVOKE_SESSIONS: "/auth/revoke-sessions",
    REVOKE_OTHER_SESSIONS: "/auth/revoke-other-sessions",
    REFRESH_TOKEN: "/auth/refresh-token",
    GET_ACCESS_TOKEN: "/auth/get-access-token",
    LIST_ACCOUNTS: "/auth/list-accounts",
    UNLINK_ACCOUNT: "/auth/unlink-account",
    LINK_SOCIAL: "/auth/link-social",
    OK: "/auth/ok",
  },

  // ─── Organization (Better Auth plugin) ───
  ORGANIZATION: {
    CREATE: "/auth/organization/create",
    UPDATE: "/auth/organization/update",
    DELETE: "/auth/organization/delete",
    SET_ACTIVE: "/auth/organization/set-active",
    GET_FULL: "/auth/organization/get-full-organization",
    LIST: "/auth/organization/list",
    CHECK_SLUG: "/auth/organization/check-slug",
    LEAVE: "/auth/organization/leave",
    // Members
    INVITE_MEMBER: "/auth/organization/invite-member",
    CANCEL_INVITATION: "/auth/organization/cancel-invitation",
    ACCEPT_INVITATION: "/auth/organization/accept-invitation",
    REJECT_INVITATION: "/auth/organization/reject-invitation",
    GET_INVITATION: "/auth/organization/get-invitation",
    LIST_INVITATIONS: "/auth/organization/list-invitations",
    LIST_USER_INVITATIONS: "/auth/organization/list-user-invitations",
    REMOVE_MEMBER: "/auth/organization/remove-member",
    UPDATE_MEMBER_ROLE: "/auth/organization/update-member-role",
    GET_ACTIVE_MEMBER: "/auth/organization/get-active-member",
    GET_ACTIVE_MEMBER_ROLE: "/auth/organization/get-active-member-role",
    LIST_MEMBERS: "/auth/organization/list-members",
    // Roles
    CREATE_ROLE: "/auth/organization/create-role",
    DELETE_ROLE: "/auth/organization/delete-role",
    UPDATE_ROLE: "/auth/organization/update-role",
    LIST_ROLES: "/auth/organization/list-roles",
    GET_ROLE: "/auth/organization/get-role",
    HAS_PERMISSION: "/auth/organization/has-permission",
  },

  // ─── Customers ───
  CUSTOMER: {
    CREATE: "/customers",
    GET_ALL: "/customers",
    GET_ONE: (id: string) => `/customers/${id}`,
    UPDATE: (id: string) => `/customers/${id}`,
    DELETE: (id: string) => `/customers/${id}`,
    // Notes
    GET_NOTES: (id: string) => `/customers/${id}/notes`,
    CREATE_NOTE: (id: string) => `/customers/${id}/notes`,
    UPDATE_NOTE: (id: string, noteId: string) => `/customers/${id}/notes/${noteId}`,
    DELETE_NOTE: (id: string, noteId: string) => `/customers/${id}/notes/${noteId}`,
    // Events
    GET_EVENTS: (id: string) => `/customers/${id}/events`,
    CREATE_EVENT: (id: string) => `/customers/${id}/events`,
    UPDATE_EVENT: (id: string, eventId: string) => `/customers/${id}/events/${eventId}`,
    DELETE_EVENT: (id: string, eventId: string) => `/customers/${id}/events/${eventId}`,
    // Analytics
    GET_ANALYTICS: (id: string) => `/customers/${id}/analytics`,
    COMPUTE_RFM: "/customers/analytics/compute",
    RFM_DISTRIBUTION: "/customers/analytics/rfm",
  },

  // ─── Orders ───
  ORDER: {
    CREATE: "/orders",
    GET_ALL: "/orders",
    GET_ONE: (id: string) => `/orders/${id}`,
    UPDATE: (id: string) => `/orders/${id}`,
    DELETE: (id: string) => `/orders/${id}`,
  },

  // ─── Products ───
  PRODUCT: {
    CREATE: "/products",
    GET_ALL: "/products",
    GET_ONE: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },

  // ─── Tickets ───
  TICKET: {
    CREATE: "/tickets",
    GET_ALL: "/tickets",
    GET_ONE: (id: string) => `/tickets/${id}`,
    UPDATE: (id: string) => `/tickets/${id}`,
    ADD_NOTE: (id: string) => `/tickets/${id}/notes`,
  },

  // ─── Roles ───
  ROLE: {
    CREATE: "/roles",
    GET_ALL: "/roles",
    GET_ONE: (id: string) => `/roles/${id}`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    GET_PERMISSIONS: "/roles/permissions",
  },

  // ─── Segments ───
  SEGMENT: {
    CREATE: "/segments",
    GET_ALL: "/segments",
    GET_ONE: (id: string) => `/segments/${id}`,
    UPDATE: (id: string) => `/segments/${id}`,
    DELETE: (id: string) => `/segments/${id}`,
    GET_CUSTOMERS: (id: string) => `/segments/${id}/customers`,
    GET_COUNT: (id: string) => `/segments/${id}/count`,
    GET_PREVIEW: (id: string) => `/segments/${id}/preview`,
    EXPORT: (id: string) => `/segments/${id}/export`,
  },

  // ─── Imports ───
  IMPORT: {
    CREATE: "/imports",
    GET_ALL: "/imports",
    GET_ONE: (id: string) => `/imports/${id}`,
    GET_ERRORS: (id: string) => `/imports/${id}/errors`,
    ROLLBACK: (id: string) => `/imports/${id}/rollback`,
  },

  // ─── Exports ───
  EXPORT: {
    CREATE: "/exports",
    GET_ALL: "/exports",
    GET_ONE: (id: string) => `/exports/${id}`,
    DOWNLOAD: (id: string) => `/exports/${id}/download`,
  },

  // ─── Notifications ───
  NOTIFICATION: {
    GET_ALL: "/notifications",
    GET_ONE: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    DELETE: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: "/notifications/unread-count",
  },

  // ─── Email Templates ───
  TEMPLATE: {
    CREATE: "/templates",
    GET_ALL: "/templates",
    GET_ONE: (id: string) => `/templates/${id}`,
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
    PREVIEW: (id: string) => `/templates/${id}/preview`,
  },

  // ─── Campaigns ───
  CAMPAIGN: {
    CREATE: "/campaigns",
    GET_ALL: "/campaigns",
    GET_ONE: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    SEND: (id: string) => `/campaigns/${id}/send`,
    STATS: (id: string) => `/campaigns/${id}/stats`,
  },

  // ─── Conversations / Messaging ───
  CONVERSATION: {
    GET_ALL: "/messaging/conversations",
    GET_MESSAGES: (id: string) => `/messaging/conversations/${id}/messages`,
    SEND_MESSAGE: (id: string) => `/messaging/conversations/${id}/messages`,
    START: "/messaging/conversations",
  },

  // ─── Integrations ───
  INTEGRATION: {
    CONNECT_META: "/integrations/meta/connect",
    CONNECT_SHOPIFY: "/integrations/shopify/connect",
    GET_ALL: "/integrations",
    GET_ONE: (id: string) => `/integrations/${id}`,
    UPDATE: (id: string) => `/integrations/${id}`,
    DELETE: (id: string) => `/integrations/${id}`,
    TEST_CONNECTION: (id: string) => `/integrations/${id}/test-connection`,
    REGISTER_WEBHOOKS: (id: string) => `/integrations/${id}/webhooks/register`,
    FULL_SYNC: (id: string) => `/integrations/${id}/sync/full`,
    SYNC_LOGS: (id: string) => `/integrations/${id}/sync/logs`,
  },

  // ─── Uploads ───
  UPLOAD: "/uploads",

  // ─── Subscriptions ───
  SUBSCRIPTION: {
    LIST_PLANS: "/subscriptions/plans",
    CURRENT: "/subscriptions/current",
    SUBSCRIBE: "/subscriptions",
    CANCEL: "/subscriptions/cancel",
    INITIALIZE: "/subscriptions/initialize",
  },

  // ─── Payments ───
  PAYMENT: {
    INITIALIZE: (orderId: string) => `/payments/initialize/${orderId}`,
    FAWRY_CALLBACK: "/payments/fawry/callback",
  },

  // ─── Reports ───
  REPORT: {
    DASHBOARD: "/reports/dashboard",
    AUDIT: "/reports/audit",
  },

  // ─── Audit Logs ───
  AUDIT_LOG: {
    GET_ALL: "/audit-logs",
  },

  // ─── Cron (Admin) ───
  CRON: {
    RFM: "/cron/rfm",
    LIFECYCLE: "/cron/lifecycle",
    VIP: "/cron/vip",
    CLEANUP_IDEMPOTENCY: "/cron/cleanup/idempotency",
  },

  // ─── AI Intelligence ───
  AI: {
    COMPUTE_CHURN: "/ai/churn",
    GET_CHURN: "/ai/churn",
    COMPUTE_SEGMENTS: "/ai/segment",
    GET_SEGMENTS: "/ai/segment",
    COMPUTE_RECOMMENDATIONS: "/ai/recommend",
    GET_RECOMMENDATIONS: (productId: string) => `/ai/recommend/${productId}`,
    GET_HEALTH: "/ai/health",
  },

  // ─── Health ───
  HEALTH: "/health",
};
