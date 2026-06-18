export interface ActionIconStyle {
    icon: string;
    bg: string;
    text: string;
    border: string;
}

export const getActionIcon = (action: string): ActionIconStyle => {
    const a = action.toLowerCase();
    if (a.includes("create")) return { icon: "add", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" };
    if (a.includes("update") || a.includes("change") || a.includes("role")) return { icon: "edit", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
    if (a.includes("delete") || a.includes("remove")) return { icon: "delete", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" };
    if (a.includes("login") || a.includes("sign")) return { icon: "key", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" };
    if (a.includes("logout") || a.includes("sign-out")) return { icon: "logout", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
    if (a.includes("invite") || a.includes("accept")) return { icon: "mail", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" };
    if (a.includes("export") || a.includes("import")) return { icon: "transfer", bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" };
    if (a.includes("download")) return { icon: "download", bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100" };
    if (a.includes("send")) return { icon: "send", bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100" };
    return { icon: "clipboard", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-100" };
};

export const fmtRelativeTime = (dStr: string) => {
    if (!dStr) return "";
    try {
        const date = new Date(dStr);
        if (isNaN(date.getTime())) return dStr;
        const diffMs = new Date().getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${Math.max(1, diffMins)} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return "Yesterday";
        return `${diffDays} days ago`;
    } catch {
        return dStr;
    }
};

export const fmtDate = (d: string) => {
    if (!d) return "";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
    } catch {
        return d;
    }
};
