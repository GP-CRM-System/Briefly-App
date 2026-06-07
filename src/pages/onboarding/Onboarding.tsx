import { useState } from 'react';
import CreateOrganization from './steps/CreateOrganization';
import InviteTeam from './steps/InviteTeam';
import SuccessStep from './steps/SuccessStep';
import { createCompany, inviteImage, confirm } from '@assets';
import { Image } from '@/core/components';

export default function Onboarding() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const handleNext = () => setStep((prev) => (prev < 3 ? (prev + 1 as 1 | 2 | 3) : prev));

    // Step 3 is full screen centered
    if (step === 3) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-poppins">
                <SuccessStep imageSrc={confirm} />
            </div>
        );
    }

    // Steps 1 & 2 use the split layout
    const isStep1 = step === 1;
    const rightImageSrc = isStep1 ? createCompany : inviteImage;

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            {/* Left Side - Form Area */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 border-r border-gray-100">
                <div className="w-full max-w-md">
                    {isStep1 && <CreateOrganization onNext={handleNext} />}
                    {!isStep1 && <InviteTeam onNext={handleNext} />}
                </div>
            </div>

            {/* Right Side - Illustration Area */}
            <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-[var(--color-primary-500)]">
                <Image
                    src={rightImageSrc}
                    alt="Onboarding Illustration"
                    className="w-full max-w-lg object-contain"
                />
            </div>
        </div>
    );
}
