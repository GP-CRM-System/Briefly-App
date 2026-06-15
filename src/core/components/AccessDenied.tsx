import { useNavigate } from "react-router-dom";
import { Shield01Icon } from "hugeicons-react";
import { motion } from "framer-motion";

export function AccessDenied() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-poppins">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl border border-red-100 shadow-xl p-8 text-center flex flex-col items-center gap-6"
            >
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                    <Shield01Icon size={36} className="text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        You do not have the required permissions to view this resource. 
                        Please contact your organization administrator if you believe this is an error.
                    </p>
                </div>

                <div className="w-full flex flex-col gap-2 mt-2">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-semibold rounded-xl transition duration-300 shadow-lg shadow-blue-500/10 cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition duration-300 border border-gray-100 cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
