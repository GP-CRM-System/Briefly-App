

import { check as CheckMark, left_blur as LeftBlur } from "@/assets/icons";
import { Link } from "react-router-dom";

type PricingCard = {
    title: string;
    description: string;
    price: string;
    period?: string;
    accent: boolean;
    badge?: string;
    features: string[];
    buttonClassName: string;
    cardClassName: string;
    titleClassName?: string;
    priceClassName?: string;
};

const pricingCards: PricingCard[] = [
    {
        title: "Free",
        description: "Freelancers and Micro-businesses",
        price: "0 EGP",
        accent: false,
        features: ["Small teams", "Contact management", "Basic sales tracking", "Lead organization"],
        buttonClassName: "text-[#4A90E2] border-[#9DC0FF] hover:bg-[#4A90E2] hover:text-white",
        cardClassName:
            "w-full max-w-[399px] h-[507px] rounded-[16px] border-2 border-[#D6D6D6] flex flex-col px-[25px] pt-[24px] pb-[24px] bg-white shrink-0",
    },
    {
        title: "Growth",
        description: "Startups and growing businesses",
        price: "450 EGP",
        accent: true,
        badge: "Most Popular",
        features: ["Up to 5 users", "Everything in Starter", "AI-driven social media moderation", "sentiment analysis"],
        buttonClassName: "text-white bg-[#4A90E2] border-[#4A90E2] hover:bg-[#3a7bc8]",
        cardClassName:
            "w-full max-w-[399px] h-[599px] rounded-[16px] border-2 border-[#4A90E2] flex flex-col px-[25px] pt-[44px] pb-[44px] bg-white shadow-lg relative lg:-top-[24px] shrink-0",
        titleClassName: "text-[#4A90E2]",
        priceClassName: "mt-8 sm:mt-10",
    },
    {
        title: "PRO",
        description: "Scaling SMBs",
        price: "1200 EGP",
        accent: false,
        features: ["unlimited users", "Everything in Growth", "Full API access", "Advanced analytics dashboards"],
        buttonClassName: "text-[#4A90E2] border-[#9DC0FF] hover:bg-[#4A90E2] hover:text-white",
        cardClassName:
            "w-full max-w-[399px] h-[507px] rounded-[16px] border-2 border-[#D6D6D6] flex flex-col px-[25px] pt-[24px] pb-[24px] bg-white shadow-md shrink-0",
    },
];

const Pricing: React.FC = () => {
    const primaryButtonClass =
        "w-full p-3 border rounded-lg border-[#4A90E2] cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A90E2]/25 active:scale-[0.98]";

    return (
        <div
            id="pricing"
            className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-25 mt-12 sm:mt-16 md:mt-20 lg:mt-24 relative max-w-360 mx-auto overflow-hidden"
        >
            <LeftBlur className="absolute left-0 top-[20%] w-32 sm:w-40 md:w-48 lg:w-64 xl:w-80 -z-10 opacity-60 pointer-events-none" aria-hidden />

            <h1 className="max-w-161.25 mx-auto text-center text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-medium leading-tight">
                Choose the Perfect <span className="text-[#4A90E2]">Plan</span> For Your Business
            </h1>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 justify-center mt-8 sm:mt-12 md:mt-16 lg:mt-20 items-center lg:items-start">
                {pricingCards.map((card) => (
                    <div key={card.title} className={`${card.cardClassName} transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                        {card.badge ? (
                            <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 bg-[#4A90E2] text-white px-4 py-2 rounded-[7px] text-base sm:text-[18px] font-medium shadow-md whitespace-nowrap">
                                {card.badge}
                            </div>
                        ) : null}

                        <div className="text-center">
                            <h1 className={`font-medium text-[28px] sm:text-[32px] ${card.titleClassName ?? ""}`.trim()}>
                                {card.title}
                            </h1>
                            <p className="mt-2 text-lg sm:text-[20px] text-[#8A8A8A]">
                                {card.description}
                            </p>
                            <h1 className={`font-medium text-[28px] sm:text-[32px] ${card.priceClassName ?? "mt-8 sm:mt-12"}`.trim()}>
                                {card.price}
                                {card.period ? (
                                    <span className="font-medium text-sm sm:text-[16px] text-[#8A8A8A]">{card.period}</span>
                                ) : null}
                            </h1>
                        </div>

                        <div className="flex flex-col gap-4 mt-6 sm:mt-8 text-[15px] sm:text-[17px] leading-snug">
                            {card.features.map((feature) => (
                                <p key={`${card.title}-${feature}`} className="flex gap-2">
                                    <span className="shrink-0 text-[#4CAF50]">
                                        <CheckMark className="w-5 h-5 mt-1" aria-hidden />
                                    </span>
                                    <span>{feature}</span>
                                </p>
                            ))}
                        </div>

                        <div className={`flex justify-center mt-auto ${card.accent ? "pt-12" : "pt-6"}`}>
                            <Link to="/login" className="w-full">
                                <button className={`${primaryButtonClass} ${card.buttonClassName} hover:-translate-y-0.5 hover:shadow-lg`}>
                                    Get Started
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;