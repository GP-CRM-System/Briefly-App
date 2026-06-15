import { useState } from 'react';
import { login as loginIllustration } from '@assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { Image } from '@/core/components';
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const initialValues = { email: '' };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/forget-password', {
                email: values.email,
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setEmailSent(true);
            toast.success('Reset link sent! Check your inbox.');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to send reset email. Please try again.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <Link to="/login" className="inline-flex items-center text-sm text-[var(--color-primary-500)] hover:underline mb-6 gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            Back to Login
                        </Link>
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                            Forgot Password?
                        </h1>
                        <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                            {emailSent
                                ? 'We\'ve sent a password reset link to your email.'
                                : 'Enter your email and we\'ll send you a reset link.'}
                        </p>
                    </div>

                    {emailSent ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><polyline points="22,6 12,13 2,6"/><path d="m16 19 2 2 4-4"/></svg>
                            </div>
                            <p className="text-center text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or
                            </p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                            >
                                Try another email
                            </button>
                        </div>
                    ) : (
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {() => (
                                <Form className="space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[var(--color-text-title)] font-medium text-sm">E-mail</label>
                                        <Field
                                            type="email"
                                            name="email"
                                            placeholder="Enter your registered email"
                                            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                        />
                                        <ErrorMessage name="email" component="div" className="text-xs text-[var(--color-error)]" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    )}

                    <p className="text-center text-sm text-gray-600 mt-8">
                        Remember your password? <Link to="/login" className="font-semibold text-[var(--color-primary-500)] underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-[var(--color-primary-500)]">
                <Image
                    src={loginIllustration}
                    alt="CRM Illustration"
                    className="w-[355px] h-[284px] object-contain"
                />
            </div>
        </div>
    );
};

export default ForgotPassword;
