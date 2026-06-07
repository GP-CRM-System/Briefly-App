import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, inputClasses, selectClasses } from "@/core/components/Modal";
import { useInviteEmployee } from "../employee.hooks";
import toast from "react-hot-toast";

interface InviteEmployeeModalProps {
    open: boolean;
    onClose: () => void;
}

/* Icons */
const MailIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const RoleIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const InviteEmployeeModal = ({ open, onClose }: InviteEmployeeModalProps) => {
    const inviteMutation = useInviteEmployee();

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        if (open) {
            setEmail("");
            setRole("");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = () => {
        if (!email.trim()) {
            toast.error("Please enter email address");
            return;
        }
        if (!role) {
            toast.error("Please select a role");
            return;
        }

        inviteMutation.mutate(
            { email, role },
            {
                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Invite New Employee"
            subtitle="create a new customer to your database."
            onSubmit={handleSubmit}
            submitLabel="Send Invite"
            loading={inviteMutation.isPending}
            width="max-w-[600px]"
        >
            {/* ── Basic Information ── */}
            <FormCard title="Basic Information" icon={<MailIcon />}>
                <FormField label="E-mail Address" required>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={inputClasses}
                        required
                    />
                </FormField>
            </FormCard>

            {/* ── Role & Permissions ── */}
            <FormCard title="Role & Permissions" icon={<RoleIcon />}>
                <FormField label="Role" required>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={selectClasses}
                        required
                    >
                        <option value="">Select a Role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Manager">Manager</option>
                        <option value="UIUX Designer">UIUX Designer</option>
                        <option value="Member">Member</option>
                    </select>
                </FormField>
            </FormCard>
        </Modal>
    );
};

export default InviteEmployeeModal;
