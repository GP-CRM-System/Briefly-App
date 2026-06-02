import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTicket, useUpdateTicket, useAddTicketNote } from "../ticket.hooks";
import { MOCK_TICKETS } from "../utils";
import toast from "react-hot-toast";

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
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

const TicketDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Queries
    const { data: ticketData, isLoading } = useTicket(id);
    const updateMutation = useUpdateTicket();
    const addNoteMutation = useAddTicketNote(id);

    // Fallback to mock data if not loaded
    const ticket = ticketData || MOCK_TICKETS.find((t) => t.id === id) || MOCK_TICKETS[0];

    // State for actions
    const [status, setStatus] = useState<any>(ticket.status);
    const [priority, setPriority] = useState<any>(ticket.priority);
    const [assignee, setAssignee] = useState<any>(ticket.assignee || "Admin User");

    const [newNote, setNewNote] = useState("");

    const handleSaveActions = () => {
        updateMutation.mutate({
            id: ticket.id,
            payload: {
                status,
                priority,
                assignee,
            }
        });
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        addNoteMutation.mutate(newNote, {
            onSuccess: () => {
                setNewNote("");
            }
        });
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            toast.success("Ticket deleted successfully!");
            navigate("/dashboard/tickets");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1250px]">
            {/* Breadcrumbs */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/tickets")}>Support tickets</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Details</span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Customer Profile Banner Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                                    {ticket.customerName?.split(" ").map(n => n[0]).join("") || "AH"}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                        {ticket.customerName}
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1 font-medium flex items-center gap-1">
                                        📧 {ticket.customerEmail || "ahmedhassan55@gmail.com"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toast.success("Edit ticket description...")}
                                    className="inline-flex items-center gap-1.5 h-[36px] px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-sm"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center gap-1.5 h-[36px] px-4 rounded-xl border border-rose-200 text-rose-600 bg-white hover:bg-rose-50 text-xs font-bold transition-all"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>

                        {/* Title of ticket & Reference Tags */}
                        <div className="pt-2 space-y-3">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                {ticket.name || ticket.subject}
                            </h1>
                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 flex-wrap">
                                {ticket.orderId && (
                                    <span className="flex items-center gap-1.5">
                                        🛒 {ticket.orderId}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    📅 Created {fmtTicketDate(ticket.createdAt)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    🔄 Updated : 2 hours ago
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h3>
                        <div className="bg-gray-50/30 border border-gray-100 rounded-2xl p-5 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                            {ticket.description}
                        </div>
                    </div>

                    {/* Log History / Note Thread */}
                    {ticket.notes && ticket.notes.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Communication Logs</h3>
                            <div className="space-y-3">
                                {ticket.notes.map((note) => (
                                    <div key={note.id} className="border border-gray-50 bg-gray-50/20 rounded-2xl p-4 flex flex-col gap-1">
                                        <p className="text-xs text-gray-600 font-medium leading-relaxed">
                                            {note.content}
                                        </p>
                                        <span className="text-[10px] text-blue-500 font-bold self-end mt-1">
                                            — {note.author || "Sarah Ahmed"} at {fmtTicketDate(note.createdAt)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add note timeline form */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <form onSubmit={handleAddNote} className="space-y-3">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Add a new log note</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Type a support log note..."
                                    className="flex-1 h-[40px] px-3 rounded-xl border border-gray-200 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                                <button
                                    type="submit"
                                    className="h-[40px] px-5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all"
                                >
                                    Send Note
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    
                    {/* Ticket Action controls */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-5">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">Ticket Action</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full h-[40px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-blue-400 transition-all"
                                >
                                    <option value="open">Open</option>
                                    <option value="pending">Pending</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full h-[40px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-blue-400 transition-all"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assign to</label>
                                <select
                                    value={assignee}
                                    onChange={(e) => setAssignee(e.target.value)}
                                    className="w-full h-[40px] px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:border-blue-400 transition-all"
                                >
                                    <option value="Admin User">Admin User</option>
                                    <option value="Sarah Ahmed">Sarah Ahmed</option>
                                    <option value="Ali Ibrahim">Ali Ibrahim</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveActions}
                            disabled={updateMutation.isPending}
                            className="w-full h-[44px] rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm hover:shadow transition-all mt-2"
                        >
                            {updateMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>

                    {/* Customer History Stats card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">Customer History</h3>
                        
                        <div className="space-y-3.5 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Total Tickets</span>
                                <span className="font-bold text-gray-800">4</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Total Spend</span>
                                <span className="font-bold text-gray-800">$1,240.00</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Member Since</span>
                                <span className="font-bold text-gray-800 uppercase">APR 2026</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default TicketDetails;
