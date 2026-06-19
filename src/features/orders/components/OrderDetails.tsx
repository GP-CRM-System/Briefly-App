import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PackageIcon } from "hugeicons-react";
import { useOrder, useAddOrderNote } from "../order.hooks";
import { orderService } from "../order.service";
import toast from "react-hot-toast";

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
        hours = hours ? hours : 12;
        const strMinutes = minutes < 10 ? "0" + minutes : minutes;
        
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${hours}:${strMinutes} ${ampm}`;
    } catch {
        return d;
    }
};

const fulfillmentSteps = ["unfulfilled", "processing", "shipped", "delivered"];

const getFulfillmentStep = (status?: string) => {
    const idx = fulfillmentSteps.indexOf(status?.toLowerCase() ?? "");
    return idx >= 0 ? idx : 0;
};

const OrderDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: order, isLoading } = useOrder(id);
    const addNoteMutation = useAddOrderNote(id);

    const [newNote, setNewNote] = useState("");
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);

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

    if (!order) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <p className="text-gray-400 text-sm">Order not found</p>
            </div>
        );
    }

    const paymentLower = order.paymentStatus?.toLowerCase() ?? "";
    const isPaid = paymentLower === "paid";
    const fulfillmentStep = getFulfillmentStep(order.fulfillmentStatus);
    const paymentTransaction = order.transactions?.find((t) => t.type === "PAYMENT" && t.status === "SUCCESS");

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
                                {order.source || "Web Store"}
                            </span>
                            {isPaid && (
                                <button
                                    onClick={async () => {
                                        setDownloadingInvoice(true);
                                        try {
                                            const blob = await orderService.downloadInvoice(order.id);
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `invoice-${order.id}.pdf`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            window.URL.revokeObjectURL(url);
                                            toast.success("Invoice downloaded successfully!");
                                        } catch {
                                            toast.error("Failed to download invoice");
                                        } finally {
                                            setDownloadingInvoice(false);
                                        }
                                    }}
                                    disabled={downloadingInvoice}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold hover:bg-emerald-100 hover:text-emerald-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {downloadingInvoice ? (
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    )}
                                    {downloadingInvoice ? "Downloading…" : "Download Invoice"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Status Tracker Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Order Status</h3>
                            
                            <div className="space-y-4">
                                <div className="text-xs font-semibold text-gray-500">
                                    Fulfillment: <span className="text-gray-900 font-bold capitalize">{order.fulfillmentStatus || "unfulfilled"}</span>
                                </div>
                                
                                {/* Step Tracker Line */}
                                <div className="flex items-center w-full max-w-[400px] pt-2">
                                    {fulfillmentSteps.map((step, i) => (
                                        <div key={step} className="contents">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow ${
                                                i <= fulfillmentStep
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-100 border border-gray-200 text-gray-400"
                                            }`}>
                                                {i < fulfillmentStep ? "✓" : i + 1}
                                            </div>
                                            {i < fulfillmentSteps.length - 1 && (
                                                <div className={`flex-1 h-0.5 ${i < fulfillmentStep ? "bg-blue-500" : "bg-gray-200"}`}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50">
                            <div className="text-xs font-semibold text-gray-500 mb-2">
                                Payment Status: <span className="text-gray-900 font-bold capitalize">{isPaid ? "Paid in full" : order.paymentStatus}</span>
                            </div>
                            
                            {isPaid && paymentTransaction ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verified Payment — {paymentTransaction.provider} ({paymentTransaction.currency} {Number(paymentTransaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                                </div>
                            ) : isPaid ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Verified Payment</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
                                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Payment pending</span>
                                </div>
                            )}
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
                                                    <PackageIcon size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 leading-tight">{item.product?.name || "—"}</p>
                                                </div>
                                            </td>
                                            <td className="py-4 text-center font-semibold text-gray-600">{item.quantity}</td>
                                            <td className="py-4 text-right font-medium text-gray-700">
                                                ${Number(item.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 text-right font-bold text-gray-900">
                                                ${(Number(item.price ?? 0) * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                                <span>Discount</span>
                                <span className="font-semibold text-rose-500">-${Number(order.discountAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
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

                    {/* Customer Card */}
                    {order.customer && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Customer</h3>
                            <button
                                onClick={() => navigate(`/dashboard/customers/${order.customer!.id}`)}
                                className="text-sm font-semibold text-blue-600 hover:underline"
                            >
                                {order.customer.name}
                            </button>
                            <p className="text-xs text-gray-500">{order.customer.email}</p>
                            {order.customer.phone && <p className="text-xs text-gray-500">{order.customer.phone}</p>}
                            {order.customer.city && <p className="text-xs text-gray-400">{order.customer.city}{order.customer.address ? `, ${order.customer.address}` : ""}</p>}
                        </div>
                    )}

                    {/* Transactions Card */}
                    {order.transactions && order.transactions.length > 0 && (
                        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Transactions</h3>
                            {order.transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="font-semibold text-gray-800">{tx.provider}</p>
                                        <p className="text-gray-400">{tx.type} · {fmtOrderDetailsDate(tx.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-800">{tx.currency} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            tx.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Admin Notes Timeline Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Note</h3>

                        {order.note ? (
                            <div className="relative border border-gray-50 bg-gray-50/20 rounded-2xl p-4">
                                <span className="absolute top-2 left-2 text-3xl font-serif text-gray-200 leading-none">"</span>
                                <p className="text-xs text-gray-500 leading-relaxed pl-4 relative z-10 italic">
                                    {order.note}
                                </p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No notes yet</p>
                        )}

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
