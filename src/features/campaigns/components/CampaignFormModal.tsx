import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Modal, { FormCard, FormField, FormRow, inputClasses, selectClasses } from "@/core/components/Modal";
import type { Campaign } from "../types";
import { useCreateCampaign, useUpdateCampaign, useTemplates, useSegmentsForDropdown } from "../campaign.hooks";

interface CampaignFormModalProps {
    open: boolean;
    onClose: () => void;
    campaign?: Campaign | null;
}

interface Template {
    id: string;
    name: string;
    subject: string;
}

const InfoIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const TargetIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

const ContentIcon = () => (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
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
    const [type, setType] = useState<"EMAIL" | "SMS">("EMAIL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Queries
    const { data: apiTemplates } = useTemplates();
    const { data: apiSegments } = useSegmentsForDropdown();

    const templates = apiTemplates && apiTemplates.length > 0 ? apiTemplates : MOCK_TEMPLATES;
    const segments = apiSegments || [];

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
                setType(campaign.type === "SMS" ? "SMS" : "EMAIL");
                
                if (campaign.scheduledAt) {
                    try {
                        const date = new Date(campaign.scheduledAt);
                        const formatted = date.toISOString().slice(0, 10);
                        setStartDate(formatted);
                    } catch {
                        setStartDate("");
                    }
                } else {
                    setStartDate("");
                }
                setEndDate("");
            } else {
                setName("");
                setSubject("");
                setType("EMAIL");
                setSegmentId(segments[0]?.id || "");
                setTemplateId(templates[0]?.id || "");
                setStartDate("");
                setEndDate("");
            }
        }
    }, [open, campaign, segments, templates]);

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Campaign name is required");
            return;
        }

        const payload: Record<string, any> = {
            name,
            subject: subject.trim() || "No Subject",
            segmentId: segmentId || null,
            templateId: templateId || null,
            type,
            status: startDate ? "SCHEDULED" : "DRAFT",
        };

        if (startDate) {
            payload.scheduledAt = new Date(startDate).toISOString();
        }

        if (isEditing) {
            updateMutation.mutate({ id: campaign!.id, payload }, {
                onSuccess: onClose,
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to update campaign");
                }
            });
        } else {
            createMutation.mutate(payload, {
                onSuccess: onClose,
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Failed to create campaign");
                }
            });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Campaign" : "Create New Campaigns"}
            subtitle={isEditing ? "Update details of this email campaign." : "create a new campaigns to your database."}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? "Save Changes" : "Create"}
            loading={isPending}
            width="max-w-[750px]"
        >
            {/* ── Basic Information Card ── */}
            <FormCard title="Basic Information" icon={<InfoIcon />}>
                <FormRow>
                    <FormField label="Campaigns Name" required>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Campaigns name"
                            className={inputClasses}
                        />
                    </FormField>
                    <FormField label="Segments">
                        <select
                            value={segmentId}
                            onChange={(e) => setSegmentId(e.target.value)}
                            className={selectClasses}
                        >
                            <option value="">Select Segment</option>
                            {segments.map((seg) => (
                                <option key={seg.id} value={seg.id}>{seg.name}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
            </FormCard>

            {/* ── Campaigns Setup Card ── */}
            <FormCard title="Campaigns Setup" icon={<TargetIcon />}>
                <FormRow>
                    <FormField label="Type">
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as "EMAIL" | "SMS")}
                            className={selectClasses}
                        >
                            <option value="EMAIL">E-mail</option>
                            <option value="SMS">SMS</option>
                        </select>
                    </FormField>
                    <FormField label="Email Template">
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className={selectClasses}
                            disabled={type === "SMS"}
                        >
                            {templates.map((tmpl) => (
                                <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                            ))}
                        </select>
                    </FormField>
                </FormRow>
                {type === "EMAIL" && (
                    <div className="mt-4">
                        <FormField label="Email Subject Line">
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g. Save 20% on all orders this weekend!"
                                className={inputClasses}
                            />
                        </FormField>
                    </div>
                )}
            </FormCard>

            {/* ── Content Card ── */}
            {type === "EMAIL" && (
                <FormCard title="Content" icon={<ContentIcon />}>
                    <FormField label="Template">
                        <div className="border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-colors">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-full mb-3">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">Upload Image</span>
                            <span className="text-xs text-gray-400 mt-1">or drop and drop</span>
                        </div>
                    </FormField>
                </FormCard>
            )}

            {/* ── Scheduled Time Card ── */}
            <FormCard title="Scheduled Time" icon={<ScheduleIcon />}>
                <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 tracking-wider">Date</span>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className={`${inputClasses} flex-1`}
                        />
                        <span className="text-gray-400">—</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className={`${inputClasses} flex-1`}
                        />
                    </div>
                </div>
            </FormCard>
        </Modal>
    );
};

export default CampaignFormModal;
