/**
 * Tour Steps Configuration
 * Each step defines a target element (via data-tour attr), route to navigate to,
 * and the content/placement of the tooltip.
 */

export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
    id: string;            // matches data-tour="id" on target DOM element
    route: string;         // navigate here before showing step
    icon: string;
    title: string;
    description: string;
    placement: TourPlacement;
}

export const TOUR_STEPS: TourStep[] = [
    {
        id: "sidebar-nav",
        route: "/dashboard",
        icon: "Sparkles",
        title: "Welcome to Briefly CRM!",
        description: "This is your navigation hub. Use the sidebar to jump between all major sections of the app. You can collapse it anytime for more space.",
        placement: "right",
    },
    {
        id: "dashboard-stats",
        route: "/dashboard",
        icon: "LayoutDashboard",
        title: "Your Dashboard",
        description: "Get a bird's eye view of your business — real-time stats, recent activity, and key metrics all in one place.",
        placement: "bottom",
    },
    {
        id: "customers-page",
        route: "/dashboard/customers",
        icon: "Users",
        title: "Customers",
        description: "Manage your entire customer base here. Search, filter, view profiles, and track every interaction with your clients.",
        placement: "bottom",
    },
    {
        id: "segments-page",
        route: "/dashboard/segments",
        icon: "Target",
        title: "Segments",
        description: "Group customers into smart segments based on behavior, demographics, or custom rules — then target them with precision campaigns.",
        placement: "bottom",
    },
    {
        id: "campaigns-page",
        route: "/dashboard/campaigns",
        icon: "Megaphone",
        title: "Campaigns",
        description: "Create and launch multi-channel marketing campaigns. Track opens, clicks, and conversions all from one dashboard.",
        placement: "bottom",
    },
    {
        id: "analytics-page",
        route: "/dashboard/analytics",
        icon: "TrendingUp",
        title: "Analytics",
        description: "Deep-dive into your performance data. Understand trends, measure ROI, and make data-driven decisions with beautiful charts.",
        placement: "bottom",
    },
    {
        id: "ai-page",
        route: "/dashboard/ai",
        icon: "Bot",
        title: "AI Insights",
        description: "Let our AI analyze your data and surface actionable insights, predictions, and recommendations — automatically.",
        placement: "bottom",
    },
    {
        id: "settings-nav",
        route: "/dashboard/settings",
        icon: "Settings",
        title: "Settings Overview",
        description: "Configure everything about your workspace here — from your profile to your organization settings and integrations.",
        placement: "right",
    },
    {
        id: "settings-tab-org",
        route: "/dashboard/settings?tab=org",
        icon: "Building2",
        title: "Organization Profile",
        description: "Set up your company name, logo, timezone, and other organization-wide preferences that apply to all team members.",
        placement: "right",
    },
    {
        id: "settings-tab-roles",
        route: "/dashboard/settings?tab=roles",
        icon: "Shield",
        title: "Roles & Permissions",
        description: "Control who can see and do what. Create custom roles and assign granular permissions to each team member.",
        placement: "right",
    },
    {
        id: "settings-tab-connections",
        route: "/dashboard/settings?tab=connections",
        icon: "Link",
        title: "Connections",
        description: "Connect your CRM to third-party tools — email providers, social platforms, payment gateways, and more.",
        placement: "right",
    },
    {
        id: "settings-tab-billing",
        route: "/dashboard/settings?tab=billing",
        icon: "CreditCard",
        title: "Payment & Billing",
        description: "Manage your subscription plan, view invoices, and upgrade to unlock premium features. You're all set — enjoy Briefly!",
        placement: "right",
    },
];
