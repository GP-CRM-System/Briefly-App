import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTourStore } from "@/store/tour.store";
import { TOUR_STEPS } from "./TourSteps";
import type { TourStep } from "./TourSteps";
import {
    Sparkles,
    LayoutDashboard,
    Users,
    Target,
    Megaphone,
    TrendingUp,
    Bot,
    Settings,
    Building2,
    Shield,
    Link,
    CreditCard,
    X,
    ArrowRight
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>> = {
    Sparkles,
    LayoutDashboard,
    Users,
    Target,
    Megaphone,
    TrendingUp,
    Bot,
    Settings,
    Building2,
    Shield,
    Link,
    CreditCard,
};

/* ─── helpers ─────────────────────────────────────────────────── */

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const EMPTY_RECT: Rect = { top: 0, left: 0, width: 0, height: 0 };
const PAD = 14; // spotlight padding around element
const TOOLTIP_W = 380;
const TOOLTIP_H = 320; // approx

function getTooltipPosition(rect: Rect, placement: TourStep["placement"]) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let top = 0;
    let left = 0;

    switch (placement) {
        case "right":
            top = cy - TOOLTIP_H / 2;
            left = rect.left + rect.width + PAD + 16;
            break;
        case "left":
            top = cy - TOOLTIP_H / 2;
            left = rect.left - TOOLTIP_W - PAD - 16;
            break;
        case "bottom":
            top = rect.top + rect.height + PAD + 16;
            left = cx - TOOLTIP_W / 2;
            break;
        case "top":
        default:
            top = rect.top - TOOLTIP_H - PAD - 16;
            left = cx - TOOLTIP_W / 2;
            break;
    }

    // clamp to viewport
    left = Math.max(12, Math.min(left, vw - TOOLTIP_W - 12));
    top = Math.max(12, Math.min(top, vh - TOOLTIP_H - 12));

    return { top, left };
}

/* ─── arrow SVG ───────────────────────────────────────────────── */

interface ArrowProps {
    fromRect: Rect;
    tooltipPos: { top: number; left: number };
    placement: TourStep["placement"];
}

const Arrow = ({ fromRect, tooltipPos, placement }: ArrowProps) => {
    const cx = fromRect.left + fromRect.width / 2;
    const cy = fromRect.top + fromRect.height / 2;

    const tx = tooltipPos.left + (placement === "right" ? 0 : placement === "left" ? TOOLTIP_W : TOOLTIP_W / 2);
    const ty = tooltipPos.top + (placement === "bottom" ? 0 : placement === "top" ? TOOLTIP_H : TOOLTIP_H / 2);

    const mx = (cx + tx) / 2;
    const my = (cy + ty) / 2;

    const path = `M${cx},${cy} Q${mx},${my} ${tx},${ty}`;

    return (
        <svg
            style={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 10001,
            }}
        >
            <defs>
                <marker id="tour-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#0056C6" />
                </marker>
            </defs>
            <path
                d={path}
                fill="none"
                stroke="#0056C6"
                strokeWidth="2"
                strokeDasharray="6 4"
                markerEnd="url(#tour-arrowhead)"
                style={{
                    animation: "tourDash 1.2s linear infinite",
                }}
            />
        </svg>
    );
};

/* ─── main component ──────────────────────────────────────────── */

const TourOverlay = () => {
    const navigate = useNavigate();
    const { tourActive, currentStep, nextStep, prevStep, skipTour } = useTourStore();

    const [targetRect, setTargetRect] = useState<Rect>(EMPTY_RECT);
    const [visible, setVisible] = useState(false);
    const rafRef = useRef<number | null>(null);
    const stepRef = useRef(currentStep);
    stepRef.current = currentStep;

    const step = TOUR_STEPS[currentStep];
    const IconComponent = step ? ICON_MAP[step.icon] : null;

    // ── Navigate and find element ──────────────────────────────
    const resolveTarget = useCallback(
        async (s: TourStep) => {
            setVisible(false);

            // Parse route/search
            const [pathname, search] = s.route.split("?");
            const currentUrl = window.location.pathname + window.location.search;
            const targetUrl = pathname + (search ? `?${search}` : "");

            if (currentUrl !== targetUrl) {
                navigate(pathname + (search ? `?${search}` : ""));
                // Wait for the page to render
                await new Promise((r) => setTimeout(r, 600));
            }

            // Poll for the data-tour element (max 2s)
            let el: Element | null = null;
            for (let i = 0; i < 20; i++) {
                el = document.querySelector(`[data-tour="${s.id}"]`);
                if (el) break;
                await new Promise((r) => setTimeout(r, 100));
            }

            if (!el) {
                // Element not found — skip to next
                if (stepRef.current < TOUR_STEPS.length - 1) {
                    useTourStore.getState().nextStep(TOUR_STEPS.length);
                } else {
                    useTourStore.getState().completeTour();
                }
                return;
            }

            // Scroll element into view
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            await new Promise((r) => setTimeout(r, 300));

            const r = el.getBoundingClientRect();
            setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
            setVisible(true);
        },
        [navigate]
    );

    useEffect(() => {
        if (!tourActive || !step) return;
        resolveTarget(step);
    }, [tourActive, currentStep, step, resolveTarget]);

    // Re-measure on resize / scroll
    useEffect(() => {
        if (!tourActive) return;
        const update = () => {
            const el = document.querySelector(`[data-tour="${step?.id}"]`);
            if (!el) return;
            const r = el.getBoundingClientRect();
            setTargetRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        };
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update, true);
        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update, true);
        };
    }, [tourActive, step]);

    // cleanup raf on unmount
    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    if (!tourActive || !step) return null;

    const spotlight = {
        top: targetRect.top - PAD,
        left: targetRect.left - PAD,
        width: targetRect.width + PAD * 2,
        height: targetRect.height + PAD * 2,
    };

    const tooltipPos = getTooltipPosition(
        { ...targetRect, top: targetRect.top - PAD, left: targetRect.left - PAD, width: targetRect.width + PAD * 2, height: targetRect.height + PAD * 2 },
        step.placement
    );

    const isFirst = currentStep === 0;
    const isLast = currentStep === TOUR_STEPS.length - 1;
    const progressPct = ((currentStep + 1) / TOUR_STEPS.length) * 100;

    return (
        <>
            {/* Global tour CSS */}
            <style>{`
                @keyframes tourPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(0,86,198,0.55), 0 0 0 4px rgba(0,86,198,0.18); }
                    50% { box-shadow: 0 0 0 8px rgba(0,86,198,0.15), 0 0 0 14px rgba(0,86,198,0.06); }
                }
                @keyframes tourFadeIn {
                    from { opacity: 0; transform: scale(0.94) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes tourDash {
                    to { stroke-dashoffset: -20; }
                }
                @keyframes tourSpotIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .tour-tooltip { animation: tourFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .tour-spotlight-ring { animation: tourPulse 2s ease-in-out infinite; }
                .tour-backdrop-enter { animation: tourSpotIn 0.25s ease both; }
            `}</style>

            {/* ── Backdrop with spotlight hole ─────────────────── */}
            {visible && (
                <div
                    className="tour-backdrop-enter"
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        pointerEvents: "none",
                        /* four shadow rects that leave the spotlight clear */
                        background: "transparent",
                        boxShadow: `
                            0 0 0 9999px rgba(8,10,20,0.62)
                        `,
                        // We use clip-path inset to punch the hole
                        clipPath: `polygon(
                            0% 0%, 100% 0%, 100% 100%, 0% 100%,
                            0% ${spotlight.top}px,
                            ${spotlight.left}px ${spotlight.top}px,
                            ${spotlight.left}px ${spotlight.top + spotlight.height}px,
                            ${spotlight.left + spotlight.width}px ${spotlight.top + spotlight.height}px,
                            ${spotlight.left + spotlight.width}px ${spotlight.top}px,
                            0% ${spotlight.top}px
                        )`,
                    }}
                />
            )}

            {/* ── Spotlight ring around element ────────────────── */}
            {visible && (
                <div
                    className="tour-spotlight-ring"
                    style={{
                        position: "fixed",
                        top: spotlight.top,
                        left: spotlight.left,
                        width: spotlight.width,
                        height: spotlight.height,
                        borderRadius: 12,
                        border: "2px solid rgba(0, 86, 198, 0.85)",
                        zIndex: 10000,
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* ── Animated connector arrow ─────────────────────── */}
            {visible && targetRect.width > 0 && (
                <Arrow
                    fromRect={{
                        top: spotlight.top,
                        left: spotlight.left,
                        width: spotlight.width,
                        height: spotlight.height,
                    }}
                    tooltipPos={tooltipPos}
                    placement={step.placement}
                />
            )}

            {/* ── Tooltip card ─────────────────────────────────── */}
            {visible && (
                <div
                    className="tour-tooltip"
                    style={{
                        position: "fixed",
                        top: tooltipPos.top,
                        left: tooltipPos.left,
                        width: TOOLTIP_W,
                        zIndex: 10002,
                    }}
                >
                    <div
                        style={{
                            background: "#ffffff",
                            border: "1px solid #E2E8F0",
                            borderRadius: 20,
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                            overflow: "hidden", // clip the top section's background
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Top Section */}
                        <div
                            style={{
                                background: "#F1F3F5",
                                padding: "24px",
                                position: "relative",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderBottom: "1px solid #E2E8F0",
                                height: 130,
                            }}
                        >
                            {/* Close button x */}
                            <button
                                onClick={skipTour}
                                style={{
                                    position: "absolute",
                                    top: 16,
                                    left: 16,
                                    background: "none",
                                    border: "none",
                                    color: "#94A3B8",
                                    cursor: "pointer",
                                    padding: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#475569")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                            >
                                <X size={16} />
                            </button>

                            {/* Step badge */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 16,
                                    right: 16,
                                    background: "#000000",
                                    borderRadius: 99,
                                    padding: "4px 10px",
                                    color: "#FFFFFF",
                                    fontSize: 9,
                                    fontWeight: 800,
                                    letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                    fontFamily: "var(--font-body, system-ui)",
                                }}
                            >
                                STEP {currentStep + 1} OF {TOUR_STEPS.length}
                            </div>

                            {/* Preview Card */}
                            <div
                                style={{
                                    background: "#FFFFFF",
                                    borderRadius: 12,
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
                                    padding: "12px 18px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    width: "80%",
                                    maxWidth: 240,
                                }}
                            >
                                {/* Blue Icon container */}
                                <div
                                    style={{
                                        background: "#0056C6", // premium blue
                                        borderRadius: 10,
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#FFFFFF",
                                        flexShrink: 0,
                                    }}
                                >
                                    {IconComponent ? <IconComponent size={20} strokeWidth={2.2} /> : null}
                                </div>
                                {/* Skeleton text lines */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                                    <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, width: "70%" }} />
                                    <div style={{ height: 8, background: "#E2E8F0", borderRadius: 4, width: "45%" }} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
                            {/* Title */}
                            <h3
                                style={{
                                    margin: "0 0 8px 0",
                                    fontSize: 20,
                                    fontWeight: 700,
                                    color: "#0F172A",
                                    fontFamily: "var(--font-body, system-ui)",
                                }}
                            >
                                {step.title}
                            </h3>

                            {/* Description */}
                            <p
                                style={{
                                    margin: "0 0 20px 0",
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    color: "#475569",
                                    fontFamily: "var(--font-body, system-ui)",
                                    minHeight: 60, // ensure alignment
                                }}
                            >
                                {step.description}
                            </p>

                            {/* Progress bar */}
                            <div
                                style={{
                                    height: 4,
                                    background: "#F1F5F9",
                                    borderRadius: 99,
                                    marginBottom: 20,
                                    overflow: "hidden",
                                    width: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${progressPct}%`,
                                        background: "#0056C6",
                                        borderRadius: 99,
                                        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
                                    }}
                                />
                            </div>

                            {/* Navigation buttons */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <button
                                    onClick={() => prevStep()}
                                    disabled={isFirst}
                                    style={{
                                        background: "#FFFFFF",
                                        border: "1px solid #D1D5DB",
                                        color: isFirst ? "#9CA3AF" : "#374151",
                                        borderRadius: 8,
                                        padding: "8px 16px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: isFirst ? "not-allowed" : "pointer",
                                        transition: "all 0.15s",
                                        fontFamily: "var(--font-body, system-ui)",
                                        opacity: isFirst ? 0.5 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isFirst) {
                                            e.currentTarget.style.background = "#F9FAFB";
                                            e.currentTarget.style.borderColor = "#9CA3AF";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isFirst) {
                                            e.currentTarget.style.background = "#FFFFFF";
                                            e.currentTarget.style.borderColor = "#D1D5DB";
                                        }
                                    }}
                                >
                                    Back
                                </button>

                                <button
                                    onClick={() => nextStep(TOUR_STEPS.length)}
                                    style={{
                                        background: "#0056C6",
                                        border: "none",
                                        color: "#FFFFFF",
                                        borderRadius: 8,
                                        padding: "8px 20px",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        fontFamily: "var(--font-body, system-ui)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#024CAE";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#0056C6";
                                    }}
                                >
                                    {isLast ? "Finish" : (
                                        <>
                                            Next <ArrowRight size={14} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Glow orb behind card */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 200,
                        height: 200,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(0,86,198,0.12) 0%, transparent 70%)",
                        pointerEvents: "none",
                        zIndex: -1,
                    }} />
                </div>
            )}
        </>
    );
};

export default TourOverlay;
