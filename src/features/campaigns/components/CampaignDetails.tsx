import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCampaign, useDeleteCampaign } from "../campaign.hooks";
import CampaignFormModal from "./CampaignFormModal";
import { gift } from "@/assets/images";
import toast from "react-hot-toast";

const fmtCampaignDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        const strHours = hours < 10 ? "0" + hours : hours;
        
        return `${months[date.getMonth()]} ${date.getDate()},${date.getFullYear()}-${strHours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

const CampaignDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Queries
    const { data: campaign, isLoading: isCampaignLoading } = useCampaign(id);

    // Mutations
    const deleteMutation = useDeleteCampaign();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
            deleteMutation.mutate(id!, {
                onSuccess: () => {
                    navigate("/dashboard/campaigns");
                }
            });
        }
    };

    const handleCopySubject = () => {
        if (campaign?.subject) {
            navigator.clipboard.writeText(campaign.subject);
            toast.success("Subject copied to clipboard!");
        } else {
            navigator.clipboard.writeText("Limited time over !");
            toast.success("Subject copied to clipboard!");
        }
    };

    if (isCampaignLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">Campaign not found</p>
                <button
                    onClick={() => navigate("/dashboard/campaigns")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const displayStatus = campaign.status || "active";
    const segmentName = campaign.segmentName || "VIP Customers";
    const descriptionText = "Special discounts for our VIP customers on selected products . Limited time offer to increase engagement and drive conversions.";

    const formattedTime = fmtCampaignDate(campaign.scheduledAt || campaign.createdAt || "2026-03-10T20:00:00.000Z");

    return (
        <div className="space-y-8 max-w-[1200px] pb-12 animate-fade-in">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span 
                    onClick={() => navigate("/dashboard/campaigns")} 
                    className="hover:text-gray-600 cursor-pointer transition-colors"
                >
                    Campaigns
                </span>
                <span className="text-gray-300">&gt;</span>
                <span className="text-gray-800 font-bold">View Details</span>
            </div>

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{campaign.name}</h2>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border bg-green-50 text-green-600 border-green-200">
                                {displayStatus}
                            </span>
                        </div>
                        
                        {/* Subheader info: Email and VIP Customers badges */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>Email</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                <span>{segmentName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all cursor-pointer"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 text-sm font-semibold text-red-600 transition-all cursor-pointer"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Two Column Details Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Campaign Information */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <h3 className="text-base font-bold text-gray-900">Campaign Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</p>
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/30 text-sm text-gray-700 leading-relaxed font-semibold">
                                {descriptionText}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Segment</p>
                                <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100/40">
                                        {segmentName}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                                <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize bg-green-50 text-green-600 border border-green-200">
                                        {displayStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</p>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <span>Email</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actual Start Time</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{formattedTime}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled Time</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{formattedTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h3 className="text-base font-bold text-gray-900">Content</h3>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</p>
                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-gray-700">{campaign.subject || "Limited time over !"}</span>
                            <button 
                                onClick={handleCopySubject}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-50 active:scale-95 shadow-sm transition-all cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail Body / Template</p>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                            >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                            </button>
                        </div>

                        {/* Email Body Preview Box */}
                        <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-sm">
                            <div className="space-y-4 max-w-[60%]">
                                <h4 className="text-base font-black text-gray-900 tracking-tight leading-tight">
                                    Exclusive Offer<br />Just for You !
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                    Enjoy amazing discounts on selected products . Don't miss out !
                                </p>
                                <button
                                    onClick={() => toast.success("Shopping link clicked!")}
                                    className="inline-flex items-center h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
                                >
                                    Shop Now
                                </button>
                            </div>

                            {/* 3D Gift Box Visual (using imported gift.svg and custom VIP ONLY overlapping badge) */}
                            <div className="relative flex items-center justify-center flex-shrink-0 self-center md:self-auto">
                                <img 
                                    src={gift} 
                                    alt="Gift Visual" 
                                    className="w-[125px] h-[125px] object-contain drop-shadow-xl animate-bounce-slow"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Campaign Performance Graph ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-bold text-gray-900">Campaign Performance</h3>
                
                <div className="bg-gray-50/30 border border-gray-50 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                    <h4 className="text-sm font-bold text-gray-800 mb-6">Performance Over Time</h4>
                    
                    <div className="relative w-full overflow-x-auto">
                        <div className="min-w-[680px] h-[250px] relative">
                            {/* Static/Interactive Tooltip exactly at 10:00 AM (x = 155px) */}
                            <div 
                                className="absolute bg-white border border-gray-100 rounded-xl p-3.5 shadow-md shadow-gray-100/80 z-20 pointer-events-none select-none"
                                style={{ left: "155px", top: "20px", width: "120px" }}
                            >
                                <p className="text-[10px] font-bold text-gray-800 leading-tight">10:00 AM</p>
                                <p className="text-[10px] font-bold text-blue-500 mt-1.5 flex items-center justify-between">
                                    <span>Sent :</span>
                                    <span>{campaign.metrics?.sent ?? 52}</span>
                                </p>
                                <p className="text-[10px] font-bold text-gray-600 mt-1 flex items-center justify-between">
                                    <span>Opened :</span>
                                    <span>{campaign.metrics?.opened ?? 40}</span>
                                </p>
                                <p className="text-[10px] font-bold text-gray-600 mt-1 flex items-center justify-between">
                                    <span>Clicked :</span>
                                    <span>{campaign.metrics?.clicked ?? 30}</span>
                                </p>
                                <p className="text-[10px] font-bold text-gray-600 mt-1 flex items-center justify-between">
                                    <span>Converted :</span>
                                    <span>{campaign.metrics?.converted ?? 100}</span>
                                </p>
                            </div>

                            {/* SVG Chart Plot */}
                            <svg className="w-full h-full" viewBox="0 0 680 250" fill="none">
                                {/* Horizontal gridlines at 0, 500, 1000, 1500, 2000 */}
                                <g stroke="#f8fafc" strokeWidth="1" strokeDasharray="3 3">
                                    {/* 2000 limit */}
                                    <line x1="60" y1="20" x2="660" y2="20" />
                                    {/* 1500 limit */}
                                    <line x1="60" y1="70" x2="660" y2="70" />
                                    {/* 1000 limit */}
                                    <line x1="60" y1="120" x2="660" y2="120" />
                                    {/* 500 limit */}
                                    <line x1="60" y1="170" x2="660" y2="170" />
                                </g>

                                {/* Y-Axis Labels */}
                                <g fill="#94a3b8" className="text-[10px] font-bold font-mono text-right" textAnchor="end">
                                    <text x="50" y="24">2,000</text>
                                    <text x="50" y="74">1,500</text>
                                    <text x="50" y="124">1,000</text>
                                    <text x="50" y="174">500</text>
                                    <text x="50" y="224">0</text>
                                </g>

                                {/* Axis Solid Bottom Baseline */}
                                <line x1="60" y1="220" x2="660" y2="220" stroke="#475569" strokeWidth="1.5" />
                                {/* Bottom ticks */}
                                <g stroke="#475569" strokeWidth="1.5">
                                    <line x1="80" y1="220" x2="80" y2="225" />
                                    <line x1="175" y1="220" x2="175" y2="225" />
                                    <line x1="270" y1="220" x2="270" y2="225" />
                                    <line x1="365" y1="220" x2="365" y2="225" />
                                    <line x1="460" y1="220" x2="460" y2="225" />
                                    <line x1="555" y1="220" x2="555" y2="225" />
                                    <line x1="650" y1="220" x2="650" y2="225" />
                                </g>

                                {/* Vertical alignment guide line for 10:00 AM */}
                                <line x1="175" y1="20" x2="175" y2="220" stroke="#f1f5f9" strokeWidth="1.5" />

                                {/* Bottom Time Labels */}
                                <g fill="#94a3b8" className="text-[9px] font-bold" textAnchor="middle">
                                    <text x="80" y="238">09:00AM</text>
                                    <text x="175" y="238">10:00AM</text>
                                    <text x="270" y="238">11:00AM</text>
                                    <text x="365" y="238">12:00 PM</text>
                                    <text x="460" y="238">01:00 PM</text>
                                    <text x="555" y="238">02:00 PM</text>
                                    <text x="650" y="238">03:00 PM</text>
                                </g>

                                {/* 
                                   Data Lines:
                                   Formula: y = 220 - (val / 2000) * 200
                                   Points mapping: x coordinates = [80, 175, 270, 365, 460, 555, 650]
                                */}

                                {/* 1. Converted Line (Dark Navy Blue #1e3a8a) */}
                                <path 
                                    d="M 80 219.8 L 175 210 L 270 219.5 L 365 219.5 L 460 219.5 L 555 219.5 L 650 219.5" 
                                    stroke="#1e3a8a" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />

                                {/* 2. Clicked Line (Medium Blue #1d4ed8) */}
                                <path 
                                    d="M 80 219.5 L 175 217 L 270 218 L 365 218 L 460 218 L 555 218 L 650 218" 
                                    stroke="#1d4ed8" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />

                                {/* 3. Opened Line (Blue #2563eb) */}
                                <path 
                                    d="M 80 219 L 175 216 L 270 215.5 L 365 215.5 L 460 215.5 L 555 215.5 L 650 215.5" 
                                    stroke="#2563eb" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />

                                {/* 4. Sent Line (Light Blue #60a5fa) */}
                                <path 
                                    d="M 80 218 L 175 214.8 L 270 212 L 365 212 L 460 212 L 555 212 L 650 212" 
                                    stroke="#60a5fa" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />

                                {/* Dot Indicators at 10:00 AM (x = 175) */}
                                <circle cx="175" cy="214.8" r="3.5" fill="white" stroke="#60a5fa" strokeWidth="2.5" />
                                <circle cx="175" cy="216" r="3.5" fill="white" stroke="#2563eb" strokeWidth="2.5" />
                                <circle cx="175" cy="217" r="3.5" fill="white" stroke="#1d4ed8" strokeWidth="2.5" />
                                <circle cx="175" cy="210" r="3.5" fill="white" stroke="#1e3a8a" strokeWidth="2.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Legends Row */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-4 select-none">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <span className="flex items-center text-blue-400">
                                <svg className="w-8 h-2" viewBox="0 0 32 8" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="0" y1="4" x2="32" y2="4" />
                                    <circle cx="16" cy="4" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </span>
                            <span>Sent</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <span className="flex items-center text-blue-600">
                                <svg className="w-8 h-2" viewBox="0 0 32 8" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="0" y1="4" x2="32" y2="4" />
                                    <circle cx="16" cy="4" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </span>
                            <span>Opened ($)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <span className="flex items-center text-blue-800">
                                <svg className="w-8 h-2" viewBox="0 0 32 8" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="0" y1="4" x2="32" y2="4" />
                                    <circle cx="16" cy="4" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </span>
                            <span>Clicked ($)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <span className="flex items-center text-blue-950">
                                <svg className="w-8 h-2" viewBox="0 0 32 8" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="0" y1="4" x2="32" y2="4" />
                                    <circle cx="16" cy="4" r="3.5" fill="white" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </span>
                            <span>Converted($)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Form Modal ── */}
            <CampaignFormModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                campaign={campaign}
            />
        </div>
    );
};

export default CampaignDetails;
