import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrder, useAddOrderNote } from "../order.hooks";
import { MOCK_ORDERS } from "../utils";

const fmtOrderDetailsDate = (d: string | null | undefined) => {
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
        
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${hours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

const OrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Query Hook
    const { data: orderData, isLoading } = useOrder(id);
    const addNoteMutation = useAddOrderNote(id);

    const [newNote, setNewNote] = useState("");

    // Fallback to mock data if loading fails/not found
    const order = orderData || MOCK_ORDERS.find((o) => o.id === id) || MOCK_ORDERS[0];

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        addNoteMutation.mutate(newNote, {
            onSuccess: () => {
                setNewNote("");
            }
        });
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
                    <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate("/dashboard/orders")}>Orders</span>
                    <span>&gt;</span>
                    <span className="text-gray-900 font-bold">View Details</span>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Columns - Detailed Sections */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Header Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                #{order.id}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1 font-medium">
                                Placed on {fmtOrderDetailsDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold capitalize">
                                🌐 {order.source || "Web Store"}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-100 text-xs font-semibold">
                                👥 VIP Customers
                            </span>
                        </div>
                    </div>

                    {/* Order Status Tracker Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Status</h3>
                            
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-gray-500">
                                    Shipping Status: <span className="text-gray-900 font-bold capitalize">{order.shippingStatus}</span> <span className="text-gray-400">(Pending)</span>
                                </div>
                                
                                {/* Step Tracker Line */}
                                <div className="flex items-center w-full max-w-[400px] pt-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                                        ✓
                                    </div>
                                    <div className="flex-1 h-0.5 bg-blue-500"></div>
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                                        2
                                    </div>
                                    <div className="flex-1 h-0.5 bg-gray-200"></div>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                                        3
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="text-xs font-semibold text-gray-500 mb-2">
                                Payment Status: <span className="text-gray-900 font-bold capitalize">{order.paymentStatus === "paid" ? "Paid in full" : order.paymentStatus}</span> <span className="text-gray-400">({order.paymentStatus === "paid" ? "Paid" : "Unpaid"})</span>
                            </div>
                            
                            {/* Card green banner */}
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Verified Payment - Visa **** 4242</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Table Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Items</h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3">Product</th>
                                        <th className="pb-3 text-center">Quantity</th>
                                        <th className="pb-3 text-right">Price</th>
                                        <th className="pb-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {order.orderItems?.map((item) => (
                                        <tr key={item.id} className="align-middle">
                                            <td className="py-4 pr-3 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                                    📦
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 leading-tight">{item.productName}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">ID: {item.productSku}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center font-semibold text-gray-600">{item.quantity}</td>
                                            <td className="py-4 text-right font-medium text-gray-700">
                                                ${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 text-right font-bold text-gray-900">
                                                ${(Number(item.price) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebars */}
                <div className="space-y-6">
                    
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">Order Summary</h3>
                        
                        <div className="space-y-3 text-sm text-gray-500">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold text-gray-800">${Number(order.subtotal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Discount <span className="text-xs text-rose-500 font-medium">(-10%)</span></span>
                                <span className="font-semibold text-rose-500">-${Number(order.discountAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (8%)</span>
                                <span className="font-semibold text-gray-800">${Number(order.taxAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-semibold text-gray-800">${Number(order.shippingAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-black text-blue-600">
                                ${Number(order.totalAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Warning Box */}
                    <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-rose-700 text-sm font-bold">
                            <svg className="w-4.5 h-4.5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Partial Refund Issued</span>
                        </div>
                        <p className="text-xs text-rose-600 leading-relaxed">
                            A refund of $150.00 was processed for 'Damaged Item' on Oct 25.
                        </p>
                    </div>

                    {/* Admin Notes Timeline Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Admin Notes</h3>
                            <button className="text-xs font-bold text-blue-500 hover:underline">✏️ Edit</button>
                        </div>

                        {/* Timeline quote box */}
                        <div className="relative border border-gray-50 bg-gray-50/20 rounded-2xl p-4 mt-2">
                            <span className="absolute top-2 left-2 text-3xl font-serif text-gray-200 leading-none">“</span>
                            <p className="text-xs text-gray-500 leading-relaxed pl-4 relative z-10 italic">
                                {order.note || "Customer requested express delivery as they need the support package by end of week."}
                            </p>
                            <div className="text-right mt-2 text-[10px] font-bold text-blue-500">
                                — Sarah Ahmed, Oct 24
                            </div>
                        </div>

                        {/* Add note interface */}
                        <form onSubmit={handleAddNote} className="space-y-2 pt-2">
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Add a new note</label>
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Type a note..."
                                    className="w-full h-[38px] pl-3 pr-10 rounded-xl border border-gray-200 text-xs text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 text-blue-500 hover:text-blue-600 focus:outline-none"
                                >
                                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default OrderDetails;
