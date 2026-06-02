import { motion } from "framer-motion";
import { sectionReveal, staggerContainer, staggerItem, hoverLift } from "../motion";
// import { left_blur } from "../../../assets/icons/landingPage";


export default function LandingPageAbout() {
    return (
        <motion.div
            id="about"
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-12 sm:mt-16 md:mt-20 lg:mt-24 relative max-w-360 mx-auto overflow-hidden"
        >
            {/* Left Blur */}
            {/* <img 
                src={left_blur} 
                alt="" 
                className="absolute left-0 top-[10%] w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 pointer-events-none"
            /> */}
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
                <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px]">
                    About <span className="text-[#4A90E2]">Briefly</span>
                </h1>
                <motion.p variants={staggerItem} className="
                    font-medium text-[#1A1A1A] 
                     sm:text-lg 
                    lg:text-xl xl:text-[22px] 
                    mt-4 sm:mt-6 lg:mt-8 
                    leading-relaxed 
                    max-w-300"
                >
                    Nexify streamlines your business operations by improving workflow efficiency across all departments.
                    Our platform centralizes company data in one secure location, eliminating silos and reducing
                    redundancy. With built-in collaboration tools, your teams can work together seamlessly, share
                    insights in real-time, and make data-driven decisions that accelerate growth
                </motion.p>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="mt-8 sm:mt-12 lg:mt-16 xl:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 shadow-sm rounded-xl mb-1">
                <motion.div variants={staggerItem} whileHover={hoverLift} className="p-4 sm:p-5 text-center">
                    <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px]">
                        25 M+
                    </h1>
                    <p className="font-medium text-[#8A8A8A] text-base sm:text-lg lg:text-xl xl:text-[24px] mt-1">
                        Active User
                    </p>
                </motion.div>
                <motion.div variants={staggerItem} whileHover={hoverLift} className="p-4 sm:p-5 text-center">
                    <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px]">
                        500K+
                    </h1>
                    <p className="font-medium text-[#8A8A8A] text-base sm:text-lg lg:text-xl xl:text-[24px] mt-1">
                        Deals Closed Monthly
                    </p>
                </motion.div>
                <motion.div variants={staggerItem} whileHover={hoverLift} className="p-4 sm:p-5 text-center">
                    <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px]">
                        $50B+
                    </h1>
                    <p className="font-medium text-[#8A8A8A] text-base sm:text-lg lg:text-xl xl:text-[24px] mt-1">
                        Revenue Managed
                    </p>
                </motion.div>
                <motion.div variants={staggerItem} whileHover={hoverLift} className="p-4 sm:p-5 text-center">
                    <h1 className="font-medium text-2xl sm:text-3xl lg:text-[36px]">
                        300%
                    </h1>
                    <p className="font-medium text-[#8A8A8A] text-base sm:text-lg lg:text-xl xl:text-[24px] mt-1">
                        Faster Sales Cycle
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}