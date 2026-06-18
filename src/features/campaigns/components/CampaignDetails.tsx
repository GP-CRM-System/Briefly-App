import toast from 'react-hot-toast';
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCampaign, useDeleteCampaign } from "../campaign.hooks";
import CampaignFormModal from "./CampaignFormModal";
import { gift } from "@assets";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-lg space-y-1.5 min-w-[150px]">
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                {payload.map((entry: any, index: number) => {
                    let colorClass = "text-gray-700";
                    if (entry.name === "Sent") colorClass = "text-blue-500";
                    else if (entry.name === "Opened ($)") colorClass = "text-blue-800";
                    else if (entry.name === "Clicked ($)") colorClass = "text-blue-600";
                    else if (entry.name === "Converted ($)") colorClass = "text-slate-900";
                    
                    return (
                        <p key={index} className={`text-xs font-semibold ${colorClass}`}>
                            {entry.name.replace(" ($)", "")} : {entry.value.toLocaleString()}
                        </p>
                    );
                })}
            </div>
        );
    }
    return null;
};

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
            toast.error("No subject to copy");
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
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                    Back to Campaigns
                </button>
            </div>
        );
    }

    const displayStatus = campaign.status || "draft";
    const segmentName = campaign.segment?.name || "All Customers";

    const metrics = (campaign.metrics as {
        sent?: number;
        opened?: number;
        clicked?: number;
        converted?: number;
    } | null) || {};

    const totalSent = metrics.sent ?? 0;
    const totalOpened = metrics.opened ?? 0;
    const totalClicked = metrics.clicked ?? 0;
    const totalConverted = metrics.converted ?? 0;

    // Create a time-series from 09:00 AM to 03:00 PM (7 steps)
    const chartData = [
        { 
            time: "09:00AM", 
            Sent: Math.round(totalSent * 0.1), 
            "Opened ($)": Math.round(totalOpened * 0.05), 
            "Clicked ($)": Math.round(totalClicked * 0.02), 
            "Converted ($)": Math.round(totalConverted * 0.01) 
        },
        { 
            time: "10:00AM", 
            Sent: Math.round(totalSent * 0.35), 
            "Opened ($)": Math.round(totalOpened * 0.25), 
            "Clicked ($)": Math.round(totalClicked * 0.18), 
            "Converted ($)": Math.round(totalConverted * 0.1) 
        },
        { 
            time: "11:00AM", 
            Sent: Math.round(totalSent * 0.65), 
            "Opened ($)": Math.round(totalOpened * 0.5), 
            "Clicked ($)": Math.round(totalClicked * 0.4), 
            "Converted ($)": Math.round(totalConverted * 0.3) 
        },
        { 
            time: "12:00PM", 
            Sent: Math.round(totalSent * 0.8), 
            "Opened ($)": Math.round(totalOpened * 0.7), 
            "Clicked ($)": Math.round(totalClicked * 0.6), 
            "Converted ($)": Math.round(totalConverted * 0.5) 
        },
        { 
            time: "01:00PM", 
            Sent: Math.round(totalSent * 0.9), 
            "Opened ($)": Math.round(totalOpened * 0.85), 
            "Clicked ($)": Math.round(totalClicked * 0.75), 
            "Converted ($)": Math.round(totalConverted * 0.7) 
        },
        { 
            time: "02:00PM", 
            Sent: Math.round(totalSent * 0.95), 
            "Opened ($)": Math.round(totalOpened * 0.92), 
            "Clicked ($)": Math.round(totalClicked * 0.88), 
            "Converted ($)": Math.round(totalConverted * 0.85) 
        },
        { 
            time: "03:00PM", 
            Sent: totalSent, 
            "Opened ($)": totalOpened, 
            "Clicked ($)": totalClicked, 
            "Converted ($)": totalConverted 
        },
    ];

    const statusStyles: Record<string, string> = {
        draft: "bg-gray-50 text-gray-600 border-gray-200",
        scheduled: "bg-blue-50 text-blue-500 border-blue-100",
        sending: "bg-amber-50 text-amber-600 border-amber-100",
        sent: "bg-green-50 text-green-600 border-green-200",
        completed: "bg-green-50 text-green-600 border-green-200",
        failed: "bg-red-50 text-red-600 border-red-200",
    };
    const statusClass = statusStyles[displayStatus] || statusStyles.draft;

    return (
        <div className="space-y-8 max-w-[1200px] pb-12 animate-fade-in">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                <span 
                    onClick={() => navigate("/dashboard/campaigns")} 
                    className="hover:text-gray-600 cursor-pointer transition-colors"
                >
                    Campaigns
                </span>
                <span>&gt;</span>
                <span className="text-gray-800 font-semibold">View Details</span>
            </div>

            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">{campaign.name}</h2>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${statusClass}`}>
                                {displayStatus}
                            </span>
                        </div>
                        
                        {/* Subheader info: Email and VIP Customers badges */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                <span>{campaign.type === "SMS" ? "SMS" : "Email"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>                                    <span>{segmentName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-blue-400 hover:bg-blue-500 active:scale-95 
                            text-sm font-medium text-white shadow-sm shadow-blue-200 transition-all cursor-pointer"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl border border-red-100 
                            bg-red-50/50 hover:bg-red-50 text-sm font-medium text-red-500 transition-all cursor-pointer"
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
                        <h3 className="text-base font-semibold text-gray-900">Campaign Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 tracking-wider">Description</p>
                            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/30 text-sm text-gray-700 leading-relaxed font-semibold">
                                {campaign.description || "No description provided."}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 tracking-wider">Segment</p>
                                <div>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-500 border border-blue-100/40">
                                        {segmentName}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-gray-400 tracking-wider">Status</p>
                                <div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize border ${statusClass}`}>
                                        {displayStatus}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 tracking-wider">Type</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <span>{campaign.type === "SMS" ? "SMS" : "Email"}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <p className="text-xs font-semibold text-gray-400 tracking-wider">Actual Start Time</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{fmtCampaignDate(campaign.sentAt)}</span>
                                </div>
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <p className="text-xs font-semibold text-gray-400 tracking-wider">Scheduled Time</p>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                    <span>{fmtCampaignDate(campaign.scheduledAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                    <h3 className="text-base font-semibold text-gray-900">Content</h3>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 tracking-wider">Subject</p>
                        <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-gray-700">{campaign.subject || "No subject set"}</span>
                            <button 
                                onClick={handleCopySubject}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 shadow-sm transition-all cursor-pointer"
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
                            <p className="text-xs font-semibold text-gray-400 tracking-wider">E-mail Body / Template</p>
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-500 hover:bg-blue-700 active:scale-95 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                            >
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit
                            </button>
                        </div>

                        {campaign.template ? (
                            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">{campaign.template.name}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    Template ID: {campaign.template.id}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                                <div className="space-y-4 max-w-[60%] flex-1">
                                    <h4 className="text-[20px] font-bold text-gray-900 leading-tight">
                                        Exclusive Offer<br />Just for You !
                                    </h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                        Enjoy amazing discounts on selected products. Don`t miss out!
                                    </p>
                                    <button className="px-5 py-2 bg-blue-500 hover:bg-blue-600 active:scale-95 text-xs font-semibold text-white rounded-xl shadow-sm transition-all cursor-pointer">
                                        Shop Now
                                    </button>
                                </div>
                                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                                    <div className="absolute inset-0 bg-blue-50 rounded-full scale-95 -z-10"></div>
                                    <img 
                                        src={gift} 
                                        alt="VIP Gift Box" 
                                        className="w-28 h-28 object-contain" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Campaign Performance Stats ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
                <h3 className="text-base font-semibold text-gray-900">Campaign Performance</h3>
                
                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h4 className="text-sm font-semibold text-gray-900 mb-6">Performance Over Time</h4>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis 
                                    dataKey="time" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10} 
                                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} 
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dx={-10} 
                                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }} 
                                    tickFormatter={(val) => val.toLocaleString()}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    align="center" 
                                    iconType="circle" 
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: 20 }}
                                    formatter={(value) => <span className="text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer">{value}</span>}
                                />
                                <Line type="monotone" dataKey="Sent" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Opened ($)" stroke="#1E3A8A" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Clicked ($)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Converted ($)" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 1.5, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
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

