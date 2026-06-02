import { useState, useEffect } from "react";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import toast from "react-hot-toast";
import type { Campaign, Template } from "../types";
import { useCreateCampaign, useUpdateCampaign, useTemplates, useSegmentsForDropdown } from "../campaign.hooks";
import { MOCK_SEGMENTS } from "@/features/segments";

interface CampaignFormModalProps {
    open: boolean;
    onClose: () => void;
    campaign?: Campaign | null;
}

const InfoIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </svg>
);

const TargetIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const ScheduleIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// Fallback Mock Templates if API returns empty
const MOCK_TEMPLATES: Template[] = [
    { id: "tmpl-1", name: "Welcome Email Template", subject: "Welcome to Briefly!" },
    { id: "tmpl-2", name: "Monthly Newsletter", subject: "Briefly Monthly Digest" },
    { id: "tmpl-3", name: "Loyalty Discount Offer", subject: "A special gift just for you" },
    { id: "tmpl-4", name: "Abandoned Cart Reminder", subject: "You left items in your cart!" },
];

const CampaignFormModal = ({ open, onClose, campaign }: CampaignFormModalProps) => {
    const isEditing = !!campaign;
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [segmentId, setSegmentId] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");

    // Queries
    const { data: apiTemplates } = useTemplates();
    const { data: apiSegments } = useSegmentsForDropdown();

    const templates = apiTemplates && apiTemplates.length > 0 ? apiTemplates : MOCK_TEMPLATES;
    const segments = apiSegments && apiSegments.length > 0 ? apiSegments : MOCK_SEGMENTS;

    // Mutations
    const createMutation = useCreateCampaign();
    const updateMutation = useUpdateCampaign();
    const isPending = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (open) {
            if (campaign) {
                setName(campaign.name || "");
                setSubject(campaign.subject || "");
                setSegmentId(campaign.segmentId || "");
                setTemplateId(campaign.templateId || "");
                
                // Format date for datetime-local input (YYYY-MM-DDThh:mm)
                if (campaign.scheduledAt) {
                    try {
                        const date = new Date(campaign.scheduledAt);
                        const formatted = date.toISOString().slice(0, 16);
                        setScheduledAt(formatted);
                    } catch {
                        setScheduledAt("");
                    }
                } else {
                    setScheduledAt("");
                }
            } else {
                setName("");
                setSubject("");
                // Set default selections
                setSegmentId(segments[0]?.id || "");
                setTemplateId(templates[0]?.id || "");
                setScheduledAt("");
            }
        }
    }, [open, campaign, segments, templates]);

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Campaign name is required");
            return;
        }
        if (!subject.trim()) {
            toast.error("Email subject line is required");
            return;
        }

        const payload = {
            name,
            subject,
            segmentId,
            templateId,
            status: scheduledAt ? "scheduled" : "draft",
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        };

        if (isEditing) {
            updateMutation.mutate({ id: campaign!.id, payload }, { onSuccess: onClose });
        } else {
            createMutation.mutate(payload, { onSuccess: onClose });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Campaign" : "Create New Campaign"}
            subtitle={isEditing ? "Update details of this email campaign." : "Launch a targeted email campaign to your selected segment."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
        >
            {/* Campaign Info Card */}
            <FormCard title="Campaign Details" icon={<InfoIcon />}>
                <FormField label="Campaign Name" required>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Summer Promo, June Newsletter"
                        className={inputClasses}
                    />
                </FormField>
                <FormField label="Email Subject Line" required>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Save 20% on all orders this weekend!"
                        className={inputClasses}
                    />
                </FormField>
            </FormCard>

            {/* Targeting Card */}
            <FormCard title="Targeting & Template" icon={<TargetIcon />}>
                <FormRow>
                    <FormField label="Target Segment">
                        <select
                            value={segmentId}
                            onChange={(e) => setSegmentId(e.target.value)}
                            className={selectClasses}
                        >
                            {segments.map((seg) => (
                                <option key={seg.id} value={seg.id}>{seg.name}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Email Template">
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className={selectClasses}
                        >
                            {templates.map((tmpl) => (
                                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
            </FormCard>

            {/* Scheduling Card */}
            <FormCard title="Schedule Dispatch" icon={<ScheduleIcon />}>
                <FormField label="Schedule Date & Time (Optional)">
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className={inputClasses}
                    />
                </FormField>
                <p className="text-xs text-gray-400 mt-2">
                    Leave blank to save as a draft. You can launch drafts manually at any time.
                </p>
            </FormCard>
        </Modal>
    );
};

export default CampaignFormModal;
