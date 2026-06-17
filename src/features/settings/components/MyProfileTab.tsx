import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTourStore } from "@/store/tour.store";
import {
    useUpdateProfile,
    useChangePassword,
    useDeleteUser,
    useUploadImage,
    useLinkedAccounts,
    useLinkSocial,
    useUnlinkAccount,
    useChangeEmail
} from "../settings.hooks";
import { inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { Linkedin01Icon, NewTwitterIcon, ViewOffSlashIcon, GoogleIcon, LockPasswordIcon, CompassIcon } from "hugeicons-react";

const MyProfileTab = () => {
    const user = useAuthStore((s) => s.user);
    const role = useAuthStore((s) => s.role);
    const setSession = useAuthStore((s) => s.setSession);

    // Edit Profile state
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");

    // Change Password states
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    // Upload & Social mutations
    const uploadImageMutation = useUploadImage();
    const updateProfileMutation = useUpdateProfile();
    const changePasswordMutation = useChangePassword();
    const deleteUserMutation = useDeleteUser();

    const { data: linkedAccounts = [] } = useLinkedAccounts();
    const linkSocialMutation = useLinkSocial();
    const unlinkAccountMutation = useUnlinkAccount();
    const changeEmailMutation = useChangeEmail();

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "Ahmed Mohamed");
            setEmail(user.email || "ahmedmohamed55@gmail.com");
        } else {
            setDisplayName("Ahmed Mohamed");
            setEmail("ahmedmohamed55@gmail.com");
        }
    }, [user]);

    // Calculate Password Strength
    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: "Empty", color: "bg-gray-200" };
        let score = 0;
        if (pass.length >= 8) score += 1;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
        if (/[0-9]/.test(pass)) score += 1;
        if (/[^A-Za-z0-9]/.test(pass)) score += 1;

        const labels = ["Weak", "Fair", "Good", "Strong"];
        const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-blue-500"];
        return {
            score,
            label: labels[score - 1] || "Weak",
            color: colors[score - 1] || "bg-red-500",
            percent: score === 4 ? "85% Secure" : score === 3 ? "60% Secure" : score === 2 ? "40% Secure" : "20% Secure"
        };
    };

    const strength = getPasswordStrength(newPassword);

    const handleSaveProfile = () => {
        if (!displayName.trim() || !email.trim()) {
            toast.error("Name and Email are required");
            return;
        }

        updateProfileMutation.mutate(
            { name: displayName },
            {
                onSuccess: () => {
                    // Update the zustand auth session locally
                    if (user) {
                        const updatedUser = { ...user, name: displayName };
                        const token = useAuthStore.getState().token || "mock-token";
                        const currentRole = role || "Manager";
                        const permissions = useAuthStore.getState().permissions || {};
                        setSession(token, updatedUser, currentRole, permissions, true);
                    }
                    setIsEditing(false);
                }
            }
        );

        if (user && email.trim() !== user.email) {
            changeEmailMutation.mutate({ newEmail: email.trim() });
        }
    };

    const handleUpdatePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        changePasswordMutation.mutate(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                }
            }
        );
    };

    const handleDeleteAccount = () => {
        if (window.confirm("WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.")) {
            deleteUserMutation.mutate();
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadImageMutation.mutate(
            { file, type: "avatar" },
            {
                onSuccess: (data) => {
                    const imageUrl = data.url;
                    updateProfileMutation.mutate(
                        { image: imageUrl },
                        {
                            onSuccess: () => {
                                if (user) {
                                    const updatedUser = { ...user, image: imageUrl };
                                    const token = useAuthStore.getState().token || "mock-token";
                                    const currentRole = role || "Manager";
                                    const permissions = useAuthStore.getState().permissions || {};
                                    setSession(token, updatedUser, currentRole, permissions, true);
                                }
                            }
                        }
                    );
                }
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Change Password Sub-View/Modal */}
            {showChangePassword ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                        <span className="p-2.5 bg-blue-50 text-blue-500 rounded-lg">
                        <LockPasswordIcon size={18} />
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                            <p className="text-xs text-gray-400">Ensure your security with a strong password</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPass.current ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className={`${inputClasses} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(prev => ({ ...prev, current: !prev.current }))}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ViewOffSlashIcon size={18} />
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPass.new ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new secure password"
                                    className={`${inputClasses} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ViewOffSlashIcon size={18} />
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {newPassword && (
                                <div className="mt-3 space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 font-medium">
                                            Password Strength: <span className="font-bold text-blue-500">{strength.label}</span>
                                        </span>
                                        <span className="text-gray-400">{strength.percent}</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    i <= strength.score ? strength.color : "bg-gray-100"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPass.confirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your new password"
                                    className={`${inputClasses} pr-12`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <ViewOffSlashIcon size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-400">Last changed: {user?.last_password_change || 'Never'}</span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowChangePassword(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePassword}
                                className="px-5 py-2.5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all cursor-pointer"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header Card */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="h-[140px] bg-gradient-to-r from-blue-400 to-blue-500 relative" />
                        <div className="px-6 md:px-8 pb-6 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                            {/* Profile Info */}
                            <div className="flex items-end gap-4 -mt-12 sm:-mt-16 relative z-10">
                                <label className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex-shrink-0 cursor-pointer group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <img
                                        src={user?.image || "/profile.jpg"}
                                        alt={displayName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </label>
                                <div className="mb-2">
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                        {displayName}
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium capitalize mt-0.5">
                                        {role || "Manager"}
                                    </p>
                                    <div className="flex gap-2.5 mt-3">
                                        <a href="#" className="p-1.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-md transition-colors">
                                        <Linkedin01Icon size={18} />
                                        </a>
                                        <a href="#" className="p-1.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black rounded-md transition-colors">
                                        <NewTwitterIcon size={18} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Action */}
                            <div className="mb-2">
                                {isEditing ? (
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            className="px-4 py-2 bg-[var(--color-primary-500)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-600)] shadow-sm transition-colors cursor-pointer"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 border border-gray-200 text-sm font-medium text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-100 transition-all flex items-center gap-2 cursor-pointer font-semibold"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                        </svg>
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personal Details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900 border-b border-gray-50 pb-2.5">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    disabled={!isEditing}
                                    className={`${inputClasses} ${!isEditing ? "opacity-75 bg-gray-50 cursor-not-allowed" : "bg-white border-blue-300 ring-2 ring-blue-50"}`}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">E-Mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={!isEditing}
                                    className={`${inputClasses} ${!isEditing ? "opacity-75 bg-gray-50 cursor-not-allowed" : "bg-white border-blue-300 ring-2 ring-blue-50"}`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Change Password trigger */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Change Password</h3>
                            <p className="text-sm text-gray-400 mt-1 max-w-xl">
                                Ensure your account is using a long, random password to stay secure. We recommend using a password manager.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChangePassword(true)}
                            className="px-5 py-2.5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all cursor-pointer whitespace-nowrap"
                        >
                            Change Password
                        </button>
                    </div>

                    {/* Link Social Accounts */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <h3 className="text-base font-bold text-gray-900">Link Social Account</h3>
                        <div className="space-y-3">
                            {/* Google */}
                            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100/70 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                                        <GoogleIcon size={18} />
                                    </span>
                                    <span className="text-sm font-semibold text-gray-700">Google Account</span>
                                </div>
                                {linkedAccounts.some((acc: any) => acc.provider === "google") ? (
                                    <button
                                        onClick={() => {
                                            const googleAcc = linkedAccounts.find((acc: any) => acc.provider === "google");
                                            if ((googleAcc as any)?.id) {
                                                unlinkAccountMutation.mutate((googleAcc as any).id);
                                            }
                                        }}
                                        disabled={unlinkAccountMutation.isPending}
                                        className="px-4.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                                    >
                                        Disconnect
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => linkSocialMutation.mutate("google")}
                                        disabled={linkSocialMutation.isPending}
                                        className="px-4.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer bg-white text-blue-500 border border-gray-200 hover:bg-blue-50 hover:border-blue-100 disabled:opacity-50"
                                    >
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Replay Tour */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <CompassIcon className="text-yellow-500"/>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Onboarding Tour</h3>
                                <p className="text-sm text-gray-400 mt-0.5 max-w-xl">
                                    Replay the guided walkthrough to rediscover all features of Briefly CRM.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { useTourStore.getState().resetTour(); toast.success("Tour starting…"); }}
                            className="px-5 py-2.5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Replay Tour
                        </button>
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
                                <h4 className="text-sm font-bold text-gray-800">Delete Account</h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Permanently remove your account and all associated data. This action cannot be undone.
                                </p>
                            </div>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyProfileTab;

