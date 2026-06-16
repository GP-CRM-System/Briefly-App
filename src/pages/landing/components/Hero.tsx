

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { crmHome, customerFrame } from "@/assets/images";
import { play_blue as PlayBlue, maki_arrow_ri as MakiArrowRi } from "@/assets/icons";
import { sectionReveal } from "../motion";

const Hero: React.FC = () => {
    const headlinePrefix = "Manage your Entire Business From One ";
    const headlineAccent = "Briefly";
    const headlineText = `${headlinePrefix}${headlineAccent}`;
    const [typedLength, setTypedLength] = useState(0);

    useEffect(() => {
        if (typedLength >= headlineText.length) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setTypedLength((current) => current + 1);
        }, 42);

        return () => window.clearTimeout(timeoutId);
    }, [headlineText.length, typedLength]);

    const typedText = headlineText.slice(0, typedLength);
    const typedPrefix = typedText.slice(0, headlinePrefix.length);
    const typedAccent = typedText.slice(headlinePrefix.length);

    const primaryButtonClass =
        "min-w-[160px] sm:min-w-[200px] lg:min-w-[221px] bg-[#4A90E2] font-medium text-base sm:text-lg lg:text-[20px] text-center text-white py-3 px-6 rounded-lg border border-[#4A90E2] shadow-sm hover:bg-[#3a7bc8] hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/25 flex items-center justify-center gap-2";
    const secondaryButtonClass =
        "min-w-[160px] sm:min-w-[200px] lg:min-w-[221px] bg-white font-medium text-base sm:text-lg lg:text-[20px] text-[#4A90E2] py-3 px-6 rounded-lg border border-[#4A90E2] shadow-sm hover:bg-[#4A90E2] hover:text-white hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20 flex items-center justify-center gap-2";

    return (
        <div
            id="home"
            className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 relative max-w-360 mx-auto overflow-hidden"
        >
            {/* <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }}>
                <LeftBlur className="absolute left-0 top-[20%] w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 opacity-60 pointer-events-none" aria-hidden />
                <RightBlur className="absolute right-0 top-0 w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 opacity-60 pointer-events-none" aria-hidden />
            </motion.div> */}

            <motion.div className="flex flex-col relative z-10" variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.7 }}>
                <motion.div className="flex justify-center" whileHover={{ scale: 1.03 }} transition={{ duration: 0.25 }}>
                    <img src={customerFrame} alt="frame" className="w-37.5 sm:w-50 md:w-62.5" />
                </motion.div>
                <motion.p className="text-(--color-text-body) flex justify-center p-1 sm:p-2 mt-1 text-[12px] sm:text-[14px] md:text-[16px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }}>
                    Trusted by 100+ Customers
                </motion.p>
            </motion.div>

            <motion.div className="flex flex-col mt-6 sm:mt-8 max-w-[90%] sm:max-w-150 md:max-w-186 mx-auto" variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.7 }}>
                <h1 aria-label={headlineText} className="min-h-[5.4rem] sm:min-h-[6.2rem] md:min-h-[7rem] lg:min-h-[7.7rem] font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[44px] text-center leading-tight text-(--color-text-title)">
                    <span aria-hidden="true" className="inline-block max-w-[18ch] sm:max-w-[24ch] md:max-w-[26ch] lg:max-w-[29ch]">
                        {typedPrefix}
                        <span className="text-[#4A90E2]">{typedAccent}</span>
                        <motion.span
                            className="ml-1 inline-block h-[0.9em] w-0.5 translate-y-[0.08em] bg-[#4A90E2]"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </span>
                </h1>

                <motion.p className="font-medium text-(--color-text-body) text-base sm:text-lg md:text-xl lg:text-[24px] text-center mt-3 sm:mt-4 max-w-175 mx-auto" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                    A Smart CRM System that unifies sales, accounting, and HR Dashboards
                </motion.p>
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center mt-6 sm:mt-8 items-stretch sm:items-center" variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.7 }}>
                <Link to="/login" className={primaryButtonClass}>
                    Start Free Trial
                    <MakiArrowRi className="w-5 h-5" aria-hidden />
                </Link>

                <button className={`${secondaryButtonClass} group`}>
                    Watch Demo
                    <PlayBlue className="w-7 h-7 transition-all duration-300 group-hover:brightness-0 group-hover:invert" aria-hidden />
                </button>
            </motion.div>

            <motion.div className="mt-8 sm:mt-12 md:mt-16 flex justify-center mb-2" variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
                <motion.img
                    src={crmHome}
                    alt="home image"
                    whileHover={{ scale: 1.01, rotate: -0.5 }}
                    whileTap={{ scale: 0.995 }}
                    transition={{ duration: 0.3 }}
                />
            </motion.div>
        </div>
    );
};

export default Hero;
