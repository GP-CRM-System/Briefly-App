import About from "./components/About"
import Cta from "./components/Cta"
import Features from "./components/Features"
import Footer from "./components/Footer"
import Hero from "./components/Hero"
import HowItWorks from "./components/HowItWorks"
import Navbar from "./components/Navbar"
import Pricing from "./components/Pricing"
import Testimonials from "./components/Testimonials"


export default function LandingPage() {
    return (
        <div className="flex flex-col gap-12 bg-white w-full mx-auto">
            <Navbar />
            <Hero />
            <About />
            <Features />
            <HowItWorks />
            <Pricing />
            <Testimonials />
            <Cta />
            <Footer />
        </div>
    );
}