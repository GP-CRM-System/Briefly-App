import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import type { Template } from "../types";
import { useCreateTemplate, useUpdateTemplate } from "../template.hooks";

interface TemplateFormModalProps {
    open: boolean;
    onClose: () => void;
    template?: Template | null;
}

const TemplateFormModal = ({ open, onClose, template }: TemplateFormModalProps) => {
    const isEditing = !!template;
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [htmlBody, setHtmlBody] = useState("");

    const createMutation = useCreateTemplate();
    const updateMutation = useUpdateTemplate();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (template) {
                setName(template.name || "");
                setSubject(template.subject || "");
                setHtmlBody(template.htmlBody || "");
            } else {
                setName("");
                setSubject("");
                setHtmlBody("");
            }
        }
    }, [open, template]);

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Template name is required");
            return;
        }
        if (!subject.trim()) {
            toast.error("Subject line is required");
            return;
        }
        if (!htmlBody.trim()) {
            toast.error("HTML body is required");
            return;
        }

        const payload = { name, subject, htmlBody };

        if (isEditing) {
            updateMutation.mutate({ id: template!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Template" : "Create New Template"}
            subtitle={isEditing ? "Update this email template." : "Create a reusable email template for campaigns."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
        >
            <FormCard title="Template Details">
                <FormField label="Template Name" required>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Welcome Email, Monthly Newsletter"
                        className={inputClasses}
                    />
                </FormField>
                <FormField label="Subject Line" required>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Welcome to {{companyName}}!"
                        className={inputClasses}
                    />
                </FormField>
                <FormField label="HTML Body" required>
                    <textarea
                        value={htmlBody}
                        onChange={(e) => setHtmlBody(e.target.value)}
                        placeholder="<h1>Hello {{customer.name}}</h1><p>Welcome to our platform!</p>"
                        className={`${inputClasses} h-[200px] py-3 resize-none font-mono text-xs`}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                        Use {'{{customer.name}}'}, {'{{customer.email}}'} etc. for dynamic variables.
                    </p>
                </FormField>
            </FormCard>
        </Modal>
    );
};

export default TemplateFormModal;
