import { useState } from 'react';
import { login as loginIllustration, eye, eyeOff } from '@assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Icon, Image } from '@/core/components';
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const initialValues = { password: '', confirmPassword: '' };

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
            .matches(/[0-9]/, 'Must contain at least one number')
            .required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Please confirm your password'),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        if (!token) {
            toast.error('Invalid or missing reset token.');
            return;
        }
        setIsSubmitting(true);
        try {
            await apiClient.post('/auth/reset-password', {
                token,
                newPassword: values.password,
            });
            setResetSuccess(true);
            toast.success('Password reset successfully!');
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to reset password. The link may have expired.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // No token present — show error state
    if (!token && !resetSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white font-poppins p-6">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
                    <p className="text-gray-500 text-sm">This password reset link is invalid or has expired. Please request a new one.</p>
                    <Link
                        to="/forgot-password"
                        className="inline-block w-full py-3 px-4 bg-[var(--color-primary-500)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-600)] transition-all duration-300 mt-4"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                            {resetSuccess ? 'Password Reset!' : 'Create New Password'}
                        </h1>
                        <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                            {resetSuccess
                                ? 'Your password has been successfully updated.'
                                : 'Your new password must be different from previous passwords.'}
                        </p>
                    </div>

                    {resetSuccess ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-green-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] transition-all duration-300"
                            >
                                Continue to Login
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
                                        <label className="text-[var(--color-text-title)] font-medium text-sm">New Password</label>
                                        <div className="relative">
                                            <Field
                                                type={passwordVisible ? 'text' : 'password'}
                                                name="password"
                                                placeholder="Enter new password"
                                                className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setPasswordVisible(!passwordVisible)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {passwordVisible ? <Icon icon={eyeOff} className="w-5 h-5" /> : <Icon icon={eye} className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <ErrorMessage name="password" component="div" className="text-xs text-[var(--color-error)]" />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[var(--color-text-title)] font-medium text-sm">Confirm Password</label>
                                        <div className="relative">
                                            <Field
                                                type={confirmVisible ? 'text' : 'password'}
                                                name="confirmPassword"
                                                placeholder="Confirm new password"
                                                className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setConfirmVisible(!confirmVisible)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {confirmVisible ? <Icon icon={eyeOff} className="w-5 h-5" /> : <Icon icon={eye} className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <ErrorMessage name="confirmPassword" component="div" className="text-xs text-[var(--color-error)]" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                    >
                                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    )}
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

export default ResetPassword;
