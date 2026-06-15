import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] px-4 font-poppins">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full text-center flex flex-col items-center gap-6"
            >
                <div className="relative">
                    <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 leading-none select-none tracking-tighter">
                        404
                    </h1>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-2xl opacity-10 -z-10" />
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[320px] mx-auto">
                        We can't seem to find the page you're looking for. It might have been moved or deleted.
                    </p>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3 mt-2 justify-center">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 py-3 px-6 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-semibold rounded-xl transition duration-300 shadow-lg shadow-blue-500/10 cursor-pointer"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 py-3 px-6 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition duration-300 border border-gray-200 cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default NotFoundPage;
