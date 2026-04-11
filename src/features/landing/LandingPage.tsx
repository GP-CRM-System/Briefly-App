export default function LandingPage() {
    return (
        <main className="relative min-h-screen 
            overflow-hidden bg-linear-to-br from-[#F40076] via-[#FFC6AC] to-[#EBA6A9] 
            px-6 py-10 grid place-items-center">
            <div className="pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full bg-[#002A32]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-[#002A32]/20 blur-3xl" />

            <section className="
                relative w-full max-w-3xl rounded-3xl border border-[#002A32]/20 bg-white/85 px-6 
                py-12 text-center shadow-[0_24px_70px_rgba(34,76,135,0.18)] backdrop-blur-[6px] sm:px-9 sm:py-14">
                <p className="
                    inline-block rounded-full bg-[#002A32] px-3.5 py-2 text-xs font-bold 
                    uppercase tracking-[0.08em] text-[#C4A29E]">
                    Temporary Landing
                </p>
                <h1 className="mt-4.5 mb-3 text-[clamp(34px,6vw,62px)] leading-[1.05] tracking-[0.01em] text-[#10355f]">
                    Briefly CRM
                </h1>
                <p className="mx-auto max-w-2xl text-[clamp(16px,2.3vw,21px)] leading-[1.6] text-[#3f5f83]">
                    Just a placeholder for now, but stay tuned for something amazing!
                </p>
            </section>
        </main>
    );
}