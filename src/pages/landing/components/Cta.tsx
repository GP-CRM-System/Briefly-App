import { Link } from "react-router-dom";

const Cta: React.FC = () => {
    const primaryButtonClass =
        "w-full sm:w-auto sm:min-w-[200px] lg:min-w-[221px] cursor-pointer text-[#4A90E2] font-medium text-lg md:text-[20px] bg-white py-3 px-6 rounded-lg border border-white shadow-sm hover:scale-[1.03] hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";
    const secondaryButtonClass =
        "w-full sm:w-auto sm:min-w-[200px] lg:min-w-[221px] cursor-pointer text-white font-medium text-lg md:text-[20px] bg-transparent py-3 px-6 rounded-lg border-2 border-white shadow-sm hover:scale-[1.03] hover:bg-white hover:text-[#4A90E2] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

    return (
        <div className="w-full bg-[#4A90E2] mt-12 sm:mt-16 md:mt-20 lg:mt-24 xl:mt-31 py-12 md:py-16 lg:py-20 overflow-hidden relative">
            <div className="text-center font-medium mx-auto max-w-181.75 px-4">
                <h1 className="text-white mt-6 sm:mt-8 md:mt-10 lg:mt-12.5 text-2xl sm:text-3xl md:text-4xl lg:text-[36px] leading-tight">Ready to turn leads into growth?</h1>

                <p className="text-[#E8E4E4] text-lg sm:text-xl md:text-2xl lg:text-[28px] mt-4 leading-relaxed">Organize your team and boost productivity. Try Briefly free for 30 Days</p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-7 justify-center mt-8 sm:mt-12 lg:mt-16 xl:mt-22">
                    <Link to="/login" className="w-full sm:w-auto">
                        <button className={`${primaryButtonClass} group flex items-center justify-center gap-2 mx-auto`}>
                            Start Free Trial
                            <span className="text-xl transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                        </button>
                    </Link>
                    <button className={`${secondaryButtonClass} group flex items-center justify-center gap-2 mx-auto sm:mx-0`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Demo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cta;