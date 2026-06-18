import { useState, useEffect, useRef } from 'react';
import { verificationCode } from '@assets';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Image } from '@/core/components';
import { authClient } from '@/lib/auth-client';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isResending, setIsResending] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const verifiedToastShown = useRef(false);
    const { user, token } = useAuthStore();

    const emailFromParam = searchParams.get('email');
    const verifiedParam = searchParams.get('verified');

    // Determine the email to display — prefer URL param, then store user
    const displayEmail = emailFromParam || user?.email || '';

    // If the user is already authenticated and verified, redirect accordingly
    useEffect(() => {
        if (token && user?.emailVerified) {
            const onboardingComplete = useAuthStore.getState().onboardingComplete;
            navigate(onboardingComplete ? '/dashboard' : '/onboarding', { replace: true });
        }
    }, [token, user, navigate]);

    // Handle verified=true query param (redirect from verification email)
    useEffect(() => {
        if (verifiedParam === 'true' && !verifiedToastShown.current) {
            verifiedToastShown.current = true;
            toast.success('Email verified successfully! You can now sign in.');
        }
    }, [verifiedParam]);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResendVerification = async () => {
        if (!displayEmail || isResending || resendDisabled) return;

        setIsResending(true);
        try {
            const { error } = await authClient.sendVerificationEmail({
                email: displayEmail,
                callbackURL: `${window.location.origin}/verify-email?verified=true`,
            });

            if (error) {
                toast.error(error.message || 'Failed to resend verification email.');
            } else {
                toast.success('Verification email sent! Check your inbox.');
                setResendDisabled(true);
                setCountdown(60);
                setTimeout(() => {
                    setResendDisabled(false);
                    setCountdown(0);
                }, 60000);
            }
        } catch (err: any) {
            toast.error(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    // If user is verified and has session, redirect (handled in useEffect above)
    if (token && user?.emailVerified) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-[var(--color-primary-50)] mb-6">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--color-primary-500)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M22 7l-10 7L2 7" />
                            </svg>
                        </div>

                        {verifiedParam === 'true' ? (
                            <>
                                <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                                    Email Verified! 🎉
                                </h1>
                                <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                                    Your email address has been successfully verified.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                                    Check Your Email
                                </h1>
                                <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                                    We've sent a verification link to
                                </p>
                                <p className="text-lg font-semibold mt-2 text-[var(--color-text-title)] break-all">
                                    {displayEmail || 'your email address'}
                                </p>
                            </>
                        )}
                    </div>

                    {verifiedParam === 'true' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-50">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--color-success, #22c55e)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <p className="text-center text-sm text-gray-500">
                                You can now sign in to your account and get started.
                            </p>
                            <Link
                                to="/login"
                                className="block w-full text-center bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                                <p className="font-medium mb-1">📧 Didn't receive the email?</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Check your spam or junk folder</li>
                                    <li>Make sure you entered the correct email address</li>
                                    <li>The link expires after 24 hours</li>
                                </ul>
                            </div>

                            {/* Resend button */}
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending || resendDisabled || !displayEmail}
                                className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isResending
                                    ? 'Sending...'
                                    : resendDisabled
                                    ? `Resend available in ${countdown}s`
                                    : 'Resend Verification Email'}
                            </button>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <hr className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-sm text-gray-400">or</span>
                                </div>
                            </div>

                            {/* Already verified? */}
                            <Link
                                to="/login"
                                className="block w-full text-center py-3 px-4 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                            >
                                I've Verified — Sign In
                            </Link>
                        </div>
                    )}

                    <p className="text-center text-sm text-gray-600 mt-8">
                        {verifiedParam === 'true' ? (
                            <>
                                Need to go back?{' '}
                                <Link to="/login" className="font-semibold text-[var(--color-primary-500)] underline ml-1">
                                    Sign In
                                </Link>
                            </>
                        ) : (
                            <>
                                Wrong email?{' '}
                                <Link to="/signup" className="font-semibold text-[var(--color-primary-500)] underline ml-1">
                                    Sign up again
                                </Link>
                                {' or '}
                                <Link to="/login" className="font-semibold text-[var(--color-primary-500)] underline ml-1">
                                    try a different account
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-[var(--color-primary-500)]">
                <div className="text-center text-white max-w-sm">
                    <Image
                        src={verificationCode}
                        alt="Email Verification Illustration"
                        className="w-[280px] h-[280px] object-contain mx-auto mb-8"
                    />
                    <h2 className="text-2xl font-semibold mb-3">Verify Your Email</h2>
                    <p className="text-white/80 text-sm leading-relaxed">
                        Confirm your email address to unlock all features and start managing your customer relationships seamlessly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
