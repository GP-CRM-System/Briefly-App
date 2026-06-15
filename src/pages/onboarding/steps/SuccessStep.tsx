import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Image } from '@/core/components';
import apiClient from '@/api/client';

type SuccessStepProps = {
    imageSrc: string;
};

export default function SuccessStep({ imageSrc }: SuccessStepProps) {
    const navigate = useNavigate();
    const { completeOnboarding, token } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            // Refresh the session by calling /me so the store gets the correct role/permissions
            // that are now available after the org was created during onboarding.
            const { data: meResponse } = await apiClient.get("/me");
            const meData = meResponse.data;
            
            if (meData && token) {
                const { role, permissions, activeOrganizationId, ...user } = meData;
                useAuthStore.getState().setSession(token, user as any, role ?? null, permissions ?? {}, true);
            } else {
                completeOnboarding();
            }
        } catch {
            // Even on failure, still complete onboarding and let the user in
            completeOnboarding();
        }

        // Signal DashboardHome to show the first-time welcome toast
        sessionStorage.setItem('briefly_show_welcome', '1');

        setIsLoading(false);
        navigate('/dashboard');
    };

    return (
        <div className="w-full max-w-lg flex flex-col items-center text-center">
            <Image
                src={imageSrc}
                alt="Success Illustration"
                className="w-full max-w-[400px] h-auto object-contain mb-8"
            />
            
            <h1 className="text-[24px] font-semibold text-[var(--color-text-title)] mb-8">
                You are successfully registered!
            </h1>

            <button
                onClick={handleStart}
                disabled={isLoading}
                className="w-full max-w-xs bg-[var(--color-primary-500)] text-white font-medium py-3 px-8 rounded-md hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                        </svg>
                        Setting up…
                    </>
                ) : (
                    "Let's Start"
                )}
            </button>
        </div>
    );
}
