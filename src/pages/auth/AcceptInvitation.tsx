import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { inviteImage, eye, eyeOff } from '@assets';
import { authClient } from '@/lib/auth-client';
import { fetchAuthSession } from '@/lib/auth-session';
import { useAuthStore } from '@/store/auth.store';
import { Icon, Image } from '@/core/components';

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const invitationId = searchParams.get('id');

    const [state, setState] = useState<'loading' | 'accepting' | 'signup' | 'error'>('loading');
    const [errorMsg, setErrorMsg] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = useAuthStore((s) => s.user);
    const token = useAuthStore((s) => s.token);
    const isAuthenticated = Boolean(user || token);

    useEffect(() => {
        if (!invitationId) {
            setErrorMsg('Invalid invitation link.');
            setState('error');
            return;
        }

        if (isAuthenticated) {
            acceptInvite(invitationId);
        } else {
            setState('signup');
        }
    }, [invitationId, isAuthenticated]);

    const acceptInvite = async (id: string) => {
        setState('accepting');
        try {
            const { error } = await authClient.organization.acceptInvitation({
                invitationId: id,
            });
            if (error) throw error;

            const session = await fetchAuthSession(3, 200);
            if (session) {
                useAuthStore.getState().setSession(
                    session.token, session.user, session.role,
                    session.permissions, true
                );
            }

            toast.success('You\'ve joined the organization!');
            navigate('/dashboard', { replace: true });
        } catch (err: any) {
            const msg = err?.message || err?.status || 'Failed to accept invitation.';
            setErrorMsg(msg);
            setState('error');
            toast.error(msg);
        }
    };

    const handleSignupAndAccept = async (values: { name: string; email: string; password: string }) => {
        setIsSubmitting(true);
        try {
            const { error: signupError } = await authClient.signUp.email({
                name: values.name,
                email: values.email,
                password: values.password,
            });

            if (signupError) throw signupError;

            await acceptInvite(invitationId!);
        } catch (err: any) {
            const msg = err?.message || 'Registration failed.';
            toast.error(msg);
            setIsSubmitting(false);
        }
    };

    if (state === 'loading' || state === 'accepting') {
        return (
            <div className="flex min-h-screen bg-white font-poppins items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-500 text-sm">
                        {state === 'accepting' ? 'Accepting invitation...' : 'Verifying invitation...'}
                    </p>
                </div>
            </div>
        );
    }

    if (state === 'error') {
        return (
            <div className="flex min-h-screen bg-white font-poppins">
                <div className="w-full flex items-center justify-center p-6 sm:p-12">
                    <div className="w-full max-w-md text-center space-y-6">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-semibold text-[var(--color-text-title)]">Invitation Error</h1>
                        <p className="text-gray-500">{errorMsg || 'This invitation link is invalid or has expired.'}</p>
                        <Link to="/login" className="inline-block font-semibold text-[var(--color-primary-500)] underline">
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const initialValues = { name: '', email: '', password: '' };
    const validationSchema = Yup.object({
        name: Yup.string().required('Full Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[var(--color-primary-500)] text-sm font-medium rounded-full mb-4">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            You've been invited!
                        </div>
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                            Create your account to join the organization
                        </h1>
                        <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                            Enter your details to get started
                        </p>
                    </div>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSignupAndAccept}
                    >
                        {() => (
                            <Form className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[var(--color-text-title)] font-medium text-sm">Full Name</label>
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder="Enter your Full Name"
                                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-xs text-[var(--color-error)]" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[var(--color-text-title)] font-medium text-sm">E-mail</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        placeholder="Enter your E-mail"
                                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-xs text-[var(--color-error)]" />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[var(--color-text-title)] font-medium text-sm">Password</label>
                                    <div className="relative">
                                        <Field
                                            type={passwordVisible ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Enter your Password"
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

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? 'Creating account...' : 'Create Account & Join'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{' '}
                        <Link to={`/login?invitationId=${invitationId}`} className="font-semibold text-[var(--color-primary-500)] underline ml-1">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-[var(--color-primary-500)]">
                <Image
                    src={inviteImage}
                    alt="Invitation Illustration"
                    width={355}
                    height={284}
                    className="object-contain"
                />
            </div>
        </div>
    );
};

export default AcceptInvitation;
