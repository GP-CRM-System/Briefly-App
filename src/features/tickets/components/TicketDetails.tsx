import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useUpdateTicket, useDeleteTicket, useAddTicketNote } from "../ticket.hooks";
import { MOCK_TICKETS } from "../utils";
import toast from "react-hot-toast";

/* ── Date formatter matching Figma: "APR 22,2026  10:57 AM" ── */
const fmtTicketDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return d;
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        return `${months[date.getMonth()]} ${date.getDate()},${date.getFullYear()}  ${hours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

/* ── Time-ago helper ── */
const timeAgo = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
        const now = new Date();
        const past = new Date(d);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} minutes ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    } catch {
        return "—";
    }
};

/* ── SVG Icon Components (matching Figma assets) ── */
const MailIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const CartIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UpdateIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
);

const ChevronIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b3b3b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const TicketDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Queries
    const { data: ticketData, isLoading } = useTicket(id);
    const updateMutation = useUpdateTicket();
    const deleteMutation = useDeleteTicket();
    const addNoteMutation = useAddTicketNote(id);

    // Fallback to mock data if not loaded
    const ticket = ticketData || MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0];

    // State for actions
    const [status, setStatus] = useState<any>(ticket.status);
    const [priority, setPriority] = useState<any>(ticket.priority);
    const [assignee, setAssignee] = useState<any>(ticket.assignee || "Admin User");
    const [newNote, setNewNote] = useState("");

    // Sync state when ticket data loads
    useEffect(() => {
        if (ticketData) {
            setStatus(ticketData.status);
            setPriority(ticketData.priority);
            setAssignee(ticketData.assignee || "Admin User");
        }
    }, [ticketData]);

    const handleSaveActions = () => {
        updateMutation.mutate({
            id: ticket.id,
            payload: { status: status?.toUpperCase(), priority: priority?.toUpperCase(), assignee }
        });
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        addNoteMutation.mutate(newNote, {
            onSuccess: () => setNewNote("")
        });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            deleteMutation.mutate(ticket.id, {
                onSuccess: () => {
                    toast.success("Ticket deleted successfully!");
                    navigate("/dashboard/tickets");
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-[#4a90e2] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1200px]">
            {/* ── Breadcrumbs ── */}
            <div className="flex items-center gap-2">
                <span
                    className="text-[16px] font-medium text-[#8a8a8a] hover:text-[#1a1a1a] cursor-pointer transition-colors font-['Poppins']"
                    onClick={() => navigate("/dashboard/tickets")}
                >
                    Support tickets
                </span>
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#8a8a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 1l5 5-5 5" />
                </svg>
                <span className="text-[16px] font-medium text-[#1a1a1a] font-['Poppins']">
                    View Details
                </span>
            </div>

            {/* ── Main Layout Grid ── */}
            <div className="flex gap-6 items-start">

                {/* ══════════ Left Column ══════════ */}
                <div className="flex-1 min-w-0 flex flex-col gap-6">

                    {/* ── Customer Profile + Ticket Info Card ── */}
                    <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                        <div className="flex flex-col gap-9">
                            {/* Row: Avatar + Name + Buttons */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#4a90e2] to-[#357abd] text-white flex items-center justify-center text-[18px] font-semibold font-['Poppins'] flex-shrink-0">
                                        {ticket.customerName?.split(" ").map(n => n[0]).join("") || "AH"}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[20px] font-semibold text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                            {ticket.customerName}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <MailIcon />
                                            <p className="text-[12px] text-[#8a8a8a] font-normal font-['Poppins'] leading-[16px]">
                                                {ticket.customerEmail || "ahmedhassan55@gmail.com"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toast.success("Edit ticket description...")}
                                        className="flex items-center justify-center gap-2 h-[40px] px-4 bg-[#4a90e2] hover:bg-[#3a7bcc] text-white rounded-[8px] transition-all cursor-pointer min-w-[90px]"
                                    >
                                        <EditIcon />
                                        <span className="text-[16px] font-medium font-['Poppins']">Edit</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center justify-center gap-2 h-[40px] px-4 bg-[rgba(239,68,68,0.09)] hover:bg-[rgba(239,68,68,0.15)] border border-[#ef4444] text-[#ef4444] rounded-[8px] transition-all cursor-pointer min-w-[104px]"
                                    >
                                        <TrashIcon />
                                        <span className="text-[16px] font-medium font-['Poppins']">Delete</span>
                                    </button>
                                </div>
                            </div>

                            {/* Ticket title + reference tags */}
                            <div className="flex flex-col gap-4">
                                <p className="text-[18px] font-medium text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                    {ticket.name || ticket.subject}
                                </p>
                                <div className="flex items-center gap-8 flex-wrap">
                                    {ticket.orderId && (
                                        <div className="flex items-center gap-2">
                                            <CartIcon />
                                            <span className="text-[12px] font-normal text-[#1a1a1a] font-['Poppins'] leading-[16px]">
                                                {ticket.orderId}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon />
                                        <span className="text-[12px] font-normal text-[#8a8a8a] font-['Poppins'] leading-[16px]">
                                            Created {fmtTicketDate(ticket.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UpdateIcon />
                                        <span className="text-[12px] font-normal text-[#8a8a8a] font-['Poppins'] leading-[16px]">
                                            Updated : {timeAgo(ticket.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Description Card ── */}
                    <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                        <div className="flex flex-col gap-4">
                            <p className="text-[18px] font-medium text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                Description
                            </p>
                            <div className="bg-[rgba(138,138,138,0.04)] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
                                <div className="text-[14px] font-normal text-[#1a1a1a] leading-[32px] font-['Poppins'] whitespace-pre-wrap">
                                    {ticket.description}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Communication Logs ── */}
                    {ticket.notes && ticket.notes.length > 0 && (
                        <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                            <div className="flex flex-col gap-4">
                                <p className="text-[18px] font-medium text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                    Communication Logs
                                </p>
                                <div className="space-y-3">
                                    {ticket.notes.map((note) => (
                                        <div key={note.id} className="bg-[rgba(138,138,138,0.04)] rounded-[14px] p-5 flex flex-col gap-2">
                                            <p className="text-[13px] text-[#1a1a1a] font-normal leading-[22px] font-['Poppins']">
                                                {note.content}
                                            </p>
                                            <span className="text-[11px] text-[#4a90e2] font-medium self-end font-['Poppins']">
                                                — {note.author || "Sarah Ahmed"} at {fmtTicketDate(note.createdAt)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Add Note Form ── */}
                    <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                        <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                            <label className="text-[14px] font-medium text-[#8a8a8a] uppercase tracking-wider font-['Poppins']">
                                Add a new log note
                            </label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Type a support log note..."
                                    className="flex-1 h-[44px] px-4 rounded-[8px] border border-[#b3b3b3] text-[12px] text-[#1a1a1a] font-['Poppins'] outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-[#8a8a8a]"
                                />
                                <button
                                    type="submit"
                                    disabled={addNoteMutation.isPending}
                                    className="h-[44px] px-6 rounded-[8px] bg-[#4a90e2] hover:bg-[#3a7bcc] text-white text-[14px] font-medium font-['Poppins'] transition-all cursor-pointer disabled:opacity-60"
                                >
                                    {addNoteMutation.isPending ? "Sending..." : "Send Note"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* ══════════ Right Column ══════════ */}
                <div className="w-[356px] flex-shrink-0 flex flex-col gap-6">

                    {/* ── Ticket Action Card ── */}
                    <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                        <div className="flex flex-col gap-8">
                            {/* Header */}
                            <div className="flex flex-col gap-4">
                                <p className="text-[18px] font-medium text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                    Ticket Action
                                </p>

                                {/* Status */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[16px] font-normal text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full h-[44px] px-3 pr-10 rounded-[8px] border border-[#b3b3b3] bg-white text-[12px] text-[#8a8a8a] font-['Poppins'] outline-none focus:border-[#4a90e2] transition-all appearance-none cursor-pointer capitalize"
                                        >
                                            <option value="open">Open</option>
                                            <option value="pending">Pending</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronIcon />
                                        </div>
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[16px] font-normal text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                        Priority
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full h-[44px] px-3 pr-10 rounded-[8px] border border-[#b3b3b3] bg-white text-[12px] text-[#8a8a8a] font-['Poppins'] outline-none focus:border-[#4a90e2] transition-all appearance-none cursor-pointer capitalize"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronIcon />
                                        </div>
                                    </div>
                                </div>

                                {/* Assign to */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[16px] font-normal text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                        Assign to
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={assignee}
                                            onChange={(e) => setAssignee(e.target.value)}
                                            className="w-full h-[44px] px-3 pr-10 rounded-[8px] border border-[#b3b3b3] bg-white text-[12px] text-[#8a8a8a] font-['Poppins'] outline-none focus:border-[#4a90e2] transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="Admin User">Admin User</option>
                                            <option value="Sarah Ahmed">Sarah Ahmed</option>
                                            <option value="Ali Ibrahim">Ali Ibrahim</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronIcon />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save button */}
                            <button
                                onClick={handleSaveActions}
                                disabled={updateMutation.isPending}
                                className="w-full h-[44px] rounded-[8px] bg-[#4a90e2] hover:bg-[#3a7bcc] text-white text-[16px] font-medium font-['Poppins'] transition-all cursor-pointer disabled:opacity-60"
                            >
                                {updateMutation.isPending ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    {/* ── Customer History Card ── */}
                    <div className="bg-white border-[1.18px] border-[#e5e7eb] rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden p-8">
                        <div className="flex flex-col gap-5">
                            <p className="text-[18px] font-medium text-[#1a1a1a] leading-[32px] font-['Poppins']">
                                Customer History
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-normal text-[#8a8a8a] font-['Poppins']">Total Tickets</span>
                                    <span className="text-[14px] font-medium text-[#1a1a1a] font-['Poppins']">4</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-normal text-[#8a8a8a] font-['Poppins']">Total Spend</span>
                                    <span className="text-[14px] font-medium text-[#1a1a1a] font-['Poppins']">$1,240.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] font-normal text-[#8a8a8a] font-['Poppins']">Member Since</span>
                                    <span className="text-[14px] font-medium text-[#1a1a1a] uppercase font-['Poppins']">APR 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
