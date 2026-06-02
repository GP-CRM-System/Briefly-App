
import { motion } from "framer-motion";
import { sectionReveal, staggerContainer, staggerItem, hoverLift } from "../motion";
import { smartContact, salesDeals, automatedTicketing, hrEmployee, right_blur as RightBlur } from "@/assets/icons";

const Features: React.FC = () => {
    const featureCards = [
        {
            img: smartContact,
            h1: "Smart Contact",
            p: "Centralized profiles, leave tracking & performance",
        },
        {
            img: salesDeals,
            h1: "Sales & Deals",
            p: "Track pipeline with boards & workflows",
        },
        {
            img: automatedTicketing,
            h1: "Automated Ticketing",
            p: "Smart routing, priorities & assignments",
        },
        {
            img: hrEmployee,
            h1: "HR & Employee",
            p: "Employee profiles, leave & performance",
        },
    ];

    return (
        <motion.div
            id="features"
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-12 sm:mt-16 md:mt-20 lg:mt-24 relative max-w-360 mx-auto overflow-hidden"
        >
            <RightBlur className="absolute right-0 top-[15%] w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 opacity-60 pointer-events-none" aria-hidden />

            <motion.div className="flex justify-center" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
                <h1 className="max-w-199 mx-auto text-center text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-medium leading-tight">
                    Discover the Powerful <span className="text-[#4A90E2]"> Features </span> that Simplify Your Business Operation
                </h1>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {featureCards.map((card, index) => (
                    <motion.div key={index} variants={staggerItem} whileHover={hoverLift} className="flex flex-col items-center p-5 hover:shadow-md transition-shadow">
                        {(() => {
                            const Icon = card.img as any;
                            return <Icon className="mb-5 w-16 h-16" aria-hidden />;
                        })()}
                        <h1 className="font-medium text-xl sm:text-2xl text-center mb-2">{card.h1}</h1>
                        <p className="font-medium text-[#8A8A8A] text-base sm:text-lg text-center">{card.p}</p>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};

export default Features;