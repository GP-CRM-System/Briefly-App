

import { motion } from "framer-motion";
import { sectionReveal, staggerContainer } from "../motion";
import { Link } from "react-router-dom";
import { 
    face as Face, 
    insta as Insta, 
    logoSvg as Logo, 
    xlogo as X, 
    callBlue as CallBlue, 
    emailBlue as EmailBlue 
} from "@/assets";

import { HashLink } from "react-router-hash-link";

const Footer: React.FC = () => {
    const linkClassName =
        "transition-all duration-300 hover:text-[#4A90E2] hover:-translate-y-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20 rounded-sm";
    const socialClassName =
        "w-[40px] cursor-pointer transition-all duration-300 hover:-translate-y-[3px] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20 rounded-full";

    return (
        <motion.div id="footer" variants={sectionReveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-16 sm:mt-20 md:mt-24 max-w-360 mx-auto">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
                <div className="sm:col-span-2 lg:col-span-1">
                    <Link to="/">
                        <Logo className="w-28 sm:w-32" aria-hidden />
                    </Link>
                    <p className="max-w-full sm:max-w-55 text-sm sm:text-[16px] text-[#8A8A8A] mt-4 sm:mt-5 leading-[1.6]">A Smart CRM System that unifies sales, accounting and HR Dashboards</p>
                </div>

                <div>
                    <h1 className="text-[16px] text-[#4A90E2] font-medium mb-4">Services</h1>
                    <ul className="space-y-3 sm:space-y-4 lg:space-y-5 mt-6 text-[16px] text-[#8A8A8A]">
                        <li className={linkClassName}>Contacts</li>
                        <li className={linkClassName}>Companies</li>
                        <li className={linkClassName}>Deals</li>
                        <li className={linkClassName}>Tickets</li>
                        <li className={linkClassName}>Orders</li>
                        <li className={linkClassName}>Employees</li>
                        <li className={linkClassName}>Analytics</li>
                    </ul>
                </div>

                <div>
                    <h1 className="text-[16px] text-[#4A90E2] font-medium mb-4">Company</h1>
                    <ul className="space-y-3 sm:space-y-4 lg:space-y-5 mt-6 text-[16px] text-[#8A8A8A]">
                        <HashLink smooth to="#home" className={`${linkClassName} block`}>Demo</HashLink>
                        <HashLink smooth to="#about" className={`${linkClassName} block`}>About</HashLink>
                        <HashLink smooth to="#features" className={`${linkClassName} block`}>Features</HashLink>
                        <HashLink smooth to="#how-it-works" className={`${linkClassName} block`}>How it works?</HashLink>
                        <HashLink smooth to="#pricing" className={`${linkClassName} block`}>Pricing</HashLink>
                        <HashLink smooth to="#footer" className={`${linkClassName} block`}>Contact</HashLink>
                    </ul>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                    <h1 className="text-[16px] text-[#4A90E2] font-medium mb-4">Join Briefly</h1>

                    <label className="block mt-6 text-[16px] text-[#8A8A8A] mb-2">Your Email</label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                            type="text"
                            className="border border-[#D6D6D6] rounded-lg px-3 py-2.5 w-full outline-none transition-all duration-300 focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/15"
                            placeholder="Enter Your Email"
                        />
                        <button className="bg-[#4A90E2] text-white px-6 py-2.5 rounded-lg whitespace-nowrap shadow-sm hover:bg-[#3a7bc8] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/25">
                            Subscribe
                        </button>
                    </div>

                    <div className="flex gap-4 mt-6">
                        <motion.div whileHover={{ y: -4, scale: 1.05 }}>
                            <Insta className={socialClassName} aria-hidden />
                        </motion.div>
                        <motion.div whileHover={{ y: -4, scale: 1.05 }}>
                            <Face className={socialClassName} aria-hidden />
                        </motion.div>
                        <motion.div whileHover={{ y: -4, scale: 1.05 }}>
                            <X className={socialClassName} aria-hidden />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="h-[0.5px] mt-12 bg-[#4A90E2]"></div>

            <div className="mt-8 mb-12 text-[#8A8A8A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                <p className="text-sm sm:text-base">2026 Briefly. All rights reserved</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <EmailBlue className="w-5 h-5" aria-hidden />
                        <span className="text-sm sm:text-base">info@briefly.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CallBlue className="w-5 h-5" aria-hidden />
                        <span className="text-sm sm:text-base">+201068551047</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Footer;