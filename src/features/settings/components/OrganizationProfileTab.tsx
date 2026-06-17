import { useState, useEffect } from "react";
import { useOrganization, useUpdateOrg, useDeleteOrg, useUploadImage } from "../settings.hooks";
import { inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";

const OrganizationProfileTab = () => {
    const { data: org, isLoading } = useOrganization();
    
    const [orgName, setOrgName] = useState("");
    const [orgSlug, setOrgSlug] = useState("");
    const [logo, setLogo] = useState<string | null>(null);

    const updateOrgMutation = useUpdateOrg();
    const deleteOrgMutation = useDeleteOrg();
    const uploadImageMutation = useUploadImage();

    useEffect(() => {
        if (org) {
            const o = org as any;
            setOrgName(o.name || "");
            setOrgSlug(o.slug || "");
            setLogo(o.logo || null);
        }
    }, [org]);

    const handleSave = () => {
        if (!orgName.trim() || !orgSlug.trim()) {
            toast.error("Organization name and slug are required");
            return;
        }

        updateOrgMutation.mutate({
            name: orgName,
            slug: orgSlug,
            logo: logo
        });
    };

    const handleDeleteOrg = () => {
        if (window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this organization? All data, logs, and member profiles will be permanently destroyed. This action is immediate and irreversible.")) {
            deleteOrgMutation.mutate();
        }
    };

    const handleReplaceLogo = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                uploadImageMutation.mutate(
                    { file, type: "logo" },
                    {
                        onSuccess: (data) => {
                            setLogo(data.url);
                            toast.success("Logo uploaded successfully!");
                        }
                    }
                );
            }
        };
        input.click();
    };

    const handleRemoveLogo = () => {
        setLogo(null);
        toast.success("Logo removed");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="text-gray-400 font-semibold animate-pulse">Loading Organization...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top Logo Upload Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* Logo Image */}
                <div className="relative w-28 h-28 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0 group">
                    {logo ? (
                        <div className="w-full h-full flex items-center justify-center p-4">
                            <img src={logo} alt="Org Logo" className="w-full h-full object-contain" />
                            <button
                                onClick={handleReplaceLogo}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-gray-400 text-xs font-semibold">
                            No Logo
                        </div>
                    )}
                </div>

                {/* Logo Details / Controls */}
                <div className="text-center sm:text-left flex-1 space-y-3">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">{orgName || "Nexora"}</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            Accepted formats: PNG, SVG, or WebP. Minimum recommended size: 512x512px.
                        </p>
                    </div>
                    <div className="flex justify-center sm:justify-start gap-3">
                        <button
                            onClick={handleReplaceLogo}
                            className="px-4.5 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
                        >
                            Replace Image
                        </button>
                        {logo && (
                            <button
                                onClick={handleRemoveLogo}
                                className="px-4.5 py-2.5 rounded-lg border border-red-100 text-sm font-semibold text-red-600 bg-white hover:bg-red-50 transition-all cursor-pointer"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Identity Details Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-50">
                    <h3 className="text-base font-bold text-gray-900">Identity Details</h3>
                    <button
                        onClick={handleSave}
                        className="px-4.5 py-2 bg-[var(--color-primary-500)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-600)] shadow-sm transition-colors cursor-pointer"
                    >
                        Save Changes
                    </button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Organization Name</label>
                        <input
                            type="text"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1.5">Organization Slug</label>
                        <input
                            type="text"
                            value={orgSlug}
                            onChange={(e) => setOrgSlug(e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>
            </div>

            {/* Account Actions */}
            <div className="bg-red-50/25 rounded-xl border border-red-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-base font-bold text-red-900">Account Actions</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Delete Organization</h4>
                        <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                            Permanently remove the organization and all associated data, logs, and members. This action is immediate and irreversible.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteOrg}
                        className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                        Delete Organization
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrganizationProfileTab;

