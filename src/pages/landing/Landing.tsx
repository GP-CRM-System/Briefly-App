import About from "./components/About";
import Cta from "./components/Cta";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";
import { left_blur as LeftBlur, right_blur as RightBlur } from "@/assets/icons";

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <LeftBlur
        className="pointer-events-none absolute -left-24 top-24 z-0 w-60 opacity-45 sm:w-72 lg:w-96"
        aria-hidden
      />
      <RightBlur
        className="pointer-events-none absolute -right-24 top-[38rem] z-0 w-60 opacity-45 sm:w-72 lg:w-96"
        aria-hidden
      />
      <LeftBlur
        className="pointer-events-none absolute -left-28 top-[74rem] z-0 w-64 opacity-40 sm:w-80 lg:w-[28rem]"
        aria-hidden
      />
      <RightBlur
        className="pointer-events-none absolute -right-28 top-[112rem] z-0 w-64 opacity-40 sm:w-80 lg:w-[28rem]"
        aria-hidden
      />
      <LeftBlur
        className="pointer-events-none absolute -left-24 top-[152rem] z-0 w-60 opacity-35 sm:w-72 lg:w-96"
        aria-hidden
      />
      <RightBlur
        className="pointer-events-none absolute -right-24 bottom-56 z-0 w-60 opacity-35 sm:w-72 lg:w-96"
        aria-hidden
      />

      <div className="relative z-10 flex w-full flex-col gap-12">
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
    </div>
  );
}
