import { useState, useMemo } from "react";
import { useSettingsRoles, useCreateRole, useUpdateRole, useDeleteRole } from "../settings.hooks";
import { inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import { Shield01Icon, Add01Icon, Delete01Icon, Edit01Icon, Search01Icon, Cancel01Icon } from "hugeicons-react";

interface PermissionRow {
    read: boolean;
    write: boolean;
    delete: boolean;
}

const RESOURCES = ["Customers", "Segments", "Campaigns", "Products", "Tickets", "Employees"];

const RolesPermissionsTab = () => {
    const { data: roles = [], isLoading } = useSettingsRoles();
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any | null>(null);

    // Form states
    const [roleName, setRoleName] = useState("");
    const [roleDesc, setRoleDesc] = useState("");
    const [permissions, setPermissions] = useState<Record<string, PermissionRow>>(
        RESOURCES.reduce((acc, resource) => {
            acc[resource.toLowerCase()] = { read: false, write: false, delete: false };
            return acc;
        }, {} as Record<string, PermissionRow>)
    );

    const filteredRoles = useMemo(() => {
        return roles.filter(role => {
            const name = role?.name || "";
            const desc = role?.description || "";
            return name.toLowerCase().includes(search.toLowerCase()) ||
                   desc.toLowerCase().includes(search.toLowerCase());
        });
    }, [roles, search]);

    const handleOpenCreateModal = () => {
        setEditingRole(null);
        setRoleName("");
        setRoleDesc("");
        setPermissions(
            RESOURCES.reduce((acc, resource) => {
                acc[resource.toLowerCase()] = { read: false, write: false, delete: false };
                return acc;
            }, {} as Record<string, PermissionRow>)
        );
        setModalOpen(true);
    };

    const handleOpenEditModal = (role: any) => {
        setEditingRole(role);
        setRoleName(role.name);
        setRoleDesc(role.description);

        const loadedPermissions: Record<string, PermissionRow> = {};
        RESOURCES.forEach(r => {
            const key = r.toLowerCase();
            const rolePerm = role.permissions?.[key] || { read: false, write: false, delete: false };
            loadedPermissions[key] = {
                read: !!rolePerm.read,
                write: !!rolePerm.write,
                delete: !!rolePerm.delete
            };
        });
        setPermissions(loadedPermissions);
        setModalOpen(true);
    };

    const handleDeleteRole = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the "${name}" role?`)) {
            deleteRoleMutation.mutate(id);
        }
    };

    const handleToggleAllRow = (resourceKey: string, checked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [resourceKey]: { read: checked, write: checked, delete: checked }
        }));
    };

    const handleToggleSingle = (resourceKey: string, field: keyof PermissionRow, checked: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [resourceKey]: {
                ...prev[resourceKey],
                [field]: checked
            }
        }));
    };

    const handleSaveRole = () => {
        if (!roleName.trim()) {
            toast.error("Role Name is required");
            return;
        }

        const payload = {
            name: roleName,
            description: roleDesc,
            permissions
        };

        if (editingRole) {
            updateRoleMutation.mutate({ id: editingRole.id, ...payload }, {
                onSuccess: () => {
                    setModalOpen(false);
                }
            });
        } else {
            createRoleMutation.mutate(payload, {
                onSuccess: () => {
                    setModalOpen(false);
                }
            });
        }
    };

    // Helper to count active permissions
    const getActivePermissionsCount = (rolePerms: any) => {
        if (!rolePerms) return 0;
        let count = 0;
        Object.values(rolePerms).forEach((p: any) => {
            if (p.read) count++;
            if (p.write) count++;
            if (p.delete) count++;
        });
        return count;
    };

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <input
                        type="text"
                        placeholder="Search anything"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`${inputClasses} pl-10`}
                    />
                    <Search01Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                    <Add01Icon size={16} /> Create Role
                </button>
            </div>

            {/* Roles Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading roles...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map((role) => {
                        const activeCount = getActivePermissionsCount(role.permissions);
                        const totalCount = RESOURCES.length * 3; // 6 resources * 3 actions (R, W, D) = 18 total

                        // Get enabled resource keys for tags
                        const enabledResources = Object.keys(role.permissions || {})
                            .filter(key => {
                                const p = role.permissions[key];
                                return p.read || p.write || p.delete;
                            })
                            .map(key => RESOURCES.find(r => r.toLowerCase() === key) || key);

                        return (
                            <div key={role.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="space-y-4">
                                    {/* Top Row: Icon, name, count, actions */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                                <Shield01Icon size={18} />
                                            </span>
                                            <div>
                                                <h4 className="text-base font-bold text-gray-900">{role.name}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">{role.userCount} Users</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenEditModal(role)}
                                                className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border-none"
                                            >
                                                <Edit01Icon size={14} />
                                            </button>
                                            {role.id !== "role-admin" && role.id !== "role-manager" && role.id !== "role-agent" && (
                                                <button
                                                    onClick={() => handleDeleteRole(role.id, role.name)}
                                                    className="p-2 text-red-400 hover:text-red-600 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border-none"
                                                >
                                                    <Delete01Icon size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
                                        {role.description}
                                    </p>

                                    {/* Progress */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Permissions</span>
                                            <span className="font-semibold text-gray-700">
                                                {activeCount}/{totalCount}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                                style={{ width: `${(activeCount / totalCount) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-50">
                                    {enabledResources.slice(0, 3).map((res) => (
                                        <span key={res} className="px-2.5 py-1 bg-blue-50/70 text-blue-500 rounded-md text-[11px] font-semibold">
                                            {res}
                                        </span>
                                    ))}
                                    {enabledResources.length > 3 && (
                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-md text-[11px] font-semibold">
                                            +{enabledResources.length - 3} More
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal Overlay */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-start pt-[50px]">
                    <div className="absolute inset-0 bg-black/15" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-[853px] max-h-[calc(100vh-70px)] flex flex-col z-10 animate-scaleUp">
                        {/* Header */}
                        <div className="flex items-start justify-between px-8 pt-7 pb-4 bg-white rounded-t-2xl border-b border-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {editingRole ? "Edit Role" : "Create New Role"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Define role name and set permissions for each resource
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
                            >
                                <Cancel01Icon size={18} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-xs">
                                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Role Name</label>
                                        <input
                                            type="text"
                                            placeholder="Manager"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                                        <input
                                            type="text"
                                            placeholder="Brief description of this Role"
                                            value={roleDesc}
                                            onChange={(e) => setRoleDesc(e.target.value)}
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4 shadow-xs">
                                <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-2">
                                    <Shield01Icon size={18} className="text-gray-400" />
                                    Permissions
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-gray-400 font-semibold text-xs">
                                                <th className="py-3 px-4">Resource</th>
                                                <th className="py-3 px-4 text-center">All</th>
                                                <th className="py-3 px-4 text-center">Read</th>
                                                <th className="py-3 px-4 text-center">Write</th>
                                                <th className="py-3 px-4 text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {RESOURCES.map((res) => {
                                                const key = res.toLowerCase();
                                                const row = permissions[key] || { read: false, write: false, delete: false };
                                                const isAll = row.read && row.write && row.delete;

                                                return (
                                                    <tr key={res} className="hover:bg-slate-50/50">
                                                        <td className="py-3 px-4 font-bold text-gray-800">{res}</td>
                                                        {/* ALL Checkbox */}
                                                        <td className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAll}
                                                                onChange={(e) => handleToggleAllRow(key, e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        {/* READ Checkbox */}
                                                        <td className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.read}
                                                                onChange={(e) => handleToggleSingle(key, "read", e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        {/* WRITE Checkbox */}
                                                        <td className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.write}
                                                                onChange={(e) => handleToggleSingle(key, "write", e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                        {/* DELETE Checkbox */}
                                                        <td className="py-3 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={row.delete}
                                                                onChange={(e) => handleToggleSingle(key, "delete", e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-8 py-5 bg-white rounded-b-2xl border-t border-gray-100">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveRole}
                                className="px-6 py-2.5 rounded-lg bg-[var(--color-primary-500)] text-white text-sm font-semibold hover:bg-[var(--color-primary-600)] shadow-sm transition-all cursor-pointer"
                            >
                                {editingRole ? "Save" : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPermissionsTab;
