

import { useState } from "react";
import { HashLink } from "react-router-hash-link";
import { Link, useLocation } from "react-router-dom";
import { logoSvg as Logo, right_blur as RightBlur, left_blur as LeftBlur } from "@/assets/icons";

const Navbar: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const desktopButtonClass =
        "cursor-pointer rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20";

    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const closeMenu = () => setMenuOpen(false);

    return (
        <div className="relative">
            <LeftBlur className="absolute left-0 sm:w-40 md:w-48 lg:w-64 xl:w-80 z-10 pointer-events-none" aria-hidden />
            <RightBlur className="absolute right-0 sm:w-40 md:w-48 lg:w-64 xl:w-80 z-10 pointer-events-none" aria-hidden />

            <header className="flex justify-between items-center py-5 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 max-w-1440 mx-auto">
                <Link to="/">
                    <div className="shrink-0">
                        <Logo className="w-28 sm:w-32 md:w-34" aria-hidden />
                    </div>
                </Link>

                <ul className="hidden lg:flex space-x-10 items-center font-medium">
                    <HashLink
                        smooth
                        to="#home"
                        className={`hover:text-[#4A90E2] hover:-translate-y-0.75 duration-300 ${
                            isHome ? 'text-[#4A90E2]' : 'text-(--color-text-subtitle)'
                        }`}
                    >
                        Home
                    </HashLink>
                    <HashLink smooth to="#about" className="text-(--color-text-subtitle) hover:text-[#4A90E2] hover:-translate-y-0.75 duration-300">
                        About
                    </HashLink>
                    <HashLink smooth to="#features" className="text-(--color-text-subtitle) hover:text-[#4A90E2] hover:-translate-y-0.75 duration-300">
                        Features
                    </HashLink>
                    <HashLink smooth to="#pricing" className="text-(--color-text-subtitle) hover:text-[#4A90E2] hover:-translate-y-0.75 duration-300">
                        Pricing
                    </HashLink>
                    <HashLink smooth to="#footer" className="text-(--color-text-subtitle) hover:text-[#4A90E2] hover:-translate-y-0.75 duration-300">
                        Contact
                    </HashLink>
                </ul>

                <div className="hidden lg:flex gap-3 items-center">
                    <Link to="/login">
                        <button className={`${desktopButtonClass} border border-[#4A90E2] text-gray-500 hover:bg-[#eef5ff]`}>
                            Sign in
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button className={`${desktopButtonClass} bg-[#4A90E2] text-white border-[#4A90E2] hover:bg-[#3a7bc8]`}>
                            Start for free
                        </button>
                    </Link>
                </div>

                <div className="lg:hidden">
                    <button onClick={toggleMenu} className="text-[#4A90E2] cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#eef5ff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20" aria-label="Toggle menu">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            <div className={`fixed top-0 right-0 bottom-0 bg-white z-50 transition-transform duration-300 ${
                menuOpen ? "translate-x-0" : "translate-x-full"
            } w-70 sm:w-[320px]`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-end p-5 border-b border-gray-100">
                        <button onClick={closeMenu} className="text-gray-600 hover:text-[#4A90E2] cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#eef5ff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20" aria-label="Close menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 py-4 px-4">
                        <div className="flex flex-col space-y-1">
                            <HashLink smooth to="#home" onClick={closeMenu} className="text-base font-medium py-3 px-4 rounded-lg transition-colors text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50">
                                Home
                            </HashLink>
                            <HashLink smooth to="#about" onClick={closeMenu} className="text-base font-medium py-3 px-4 rounded-lg transition-colors text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50">
                                About
                            </HashLink>
                            <HashLink smooth to="#features" onClick={closeMenu} className="text-base font-medium py-3 px-4 rounded-lg transition-colors text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50">
                                Features
                            </HashLink>
                            <HashLink smooth to="#pricing" onClick={closeMenu} className="text-base font-medium py-3 px-4 rounded-lg transition-colors text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50">
                                Pricing
                            </HashLink>
                            <HashLink smooth to="#footer" onClick={closeMenu} className="text-base font-medium py-3 px-4 rounded-lg transition-colors text-gray-700 hover:text-[#4A90E2] hover:bg-blue-50">
                                Contact
                            </HashLink>
                        </div>
                    </nav>

                    <div className="p-4 border-t border-gray-100 space-y-2">
                        <Link to="/login" className="block">
                            <button onClick={closeMenu} className="text-[#4A90E2] text-base font-medium w-full py-2.5 rounded-lg border border-[#4A90E2] hover:bg-[#eef5ff] hover:shadow-sm transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20">
                                Login
                            </button>
                        </Link>
                        <Link to="/login" className="block">
                            <button onClick={closeMenu} className="text-white text-base font-medium bg-[#4A90E2] w-full py-2.5 rounded-lg border border-[#4A90E2] hover:bg-[#3a7bc8] hover:shadow-lg transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/20">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;