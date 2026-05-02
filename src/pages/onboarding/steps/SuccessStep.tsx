import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Image } from '@/core/components';

type SuccessStepProps = {
    imageSrc: string;
};

export default function SuccessStep({ imageSrc }: SuccessStepProps) {
    const navigate = useNavigate();
    const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

    const handleStart = () => {
        completeOnboarding(); // Mark onboarding as done in Zustand
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
                className="w-full max-w-xs bg-[var(--color-primary-500)] text-white font-medium py-3 px-8 rounded-md hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300"
            >
                Let's Start
            </button>
        </div>
    );
}
