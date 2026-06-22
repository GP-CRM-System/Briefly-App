import { useState } from 'react';
import { 
    login as loginIllustration, 
    google, 
    facebook,
    microsoft,
    eye,
    eyeOff
} from '@assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { authClient } from '@/lib/auth-client';
import { Icon, Image } from '@/core/components';
import toast from 'react-hot-toast';

const Login = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [searchParams] = useSearchParams();
    const invitationId = searchParams.get('invitationId');
    const { login, loginWithGoogle, loginWithFacebook, loginWithMicrosoft, isPending } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = { email: '', password: '', remember: false };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        setIsSubmitting(true);
        const result = await login({ email: values.email, password: values.password });
        if (!result?.error && invitationId) {
            const { error } = await authClient.organization.acceptInvitation({
                invitationId,
            });
            if (error) {
                toast.error(error.message || 'Failed to accept invitation');
            } else {
                toast.success('You\'ve joined the organization!');
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                            Welcome to our CRM
                        </h1>
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                            Sign In to Latest Updates
                        </h1>
                        <p className="text-xl font-[400] mt-5 text-[var(--color-text-body)]">
                            Enter your Details to sign in
                        </p>
                    </div>

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

                                <div className="flex items-center justify-between mt-2">
                                    <label className="flex items-center text-sm cursor-pointer">
                                        <Field
                                            type="checkbox"
                                            name="remember"
                                            className="h-4 w-4 border-gray-300 rounded text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                        />
                                        <span className="ml-2 text-gray-600">Remember me</span>
                                    </label>
                                    <Link to="/forgot-password" title="forgot-password" className="text-sm font-medium text-[var(--color-primary-500)] hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isPending}
                                    className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? 'Logging in...' : 'Login'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="text-center my-8">
                        <div className="flex items-center w-full">
                            <hr className="flex-grow border-t border-gray-200" />
                            <span className="mx-4 text-sm text-[var(--color-text-title)] font-medium">Or Login With</span>
                            <hr className="flex-grow border-t border-gray-200" />
                        </div>
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                type="button"
                                onClick={loginWithGoogle}
                                className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 hover:border-[var(--color-primary-500)] transition-all duration-300"
                            >
                                <Icon icon={google} className="h-6 w-6" />
                            </button>
                            <button
                                type="button"
                                onClick={loginWithFacebook}
                                className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-600 transition-all duration-300"
                            >
                                <Icon icon={facebook} className="h-8 w-8" />
                            </button>
                            <button
                                type="button"
                                onClick={loginWithMicrosoft}
                                className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-600 transition-all duration-300"
                            >
                                <Icon icon={microsoft} className="h-8 w-8" />
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account? <Link to="/signup" className="font-semibold text-[var(--color-primary-500)] underline ml-1">Sign up</Link>
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

export default Login;