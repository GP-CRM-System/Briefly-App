import { useState } from 'react';
import { 
    register as registerIllustration, 
    google, 
    facebook, 
    twitter,
    eye,
    eyeOff
} from '@assets';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { useAuth } from '@/core/hooks';
import { Icon, Image } from '@/core/components';

const Signup = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const { register, loginWithGoogle, isPending } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialValues = { name: '', email: '', password: '', confirmPassword: '', terms: false };

    const validationSchema = Yup.object({
        name: Yup.string().required('Full Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required'),
        password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        confirmPassword: Yup.string().oneOf([Yup.ref('password'), undefined], 'Passwords must match').required('Confirm Password is required'),
        terms: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        setIsSubmitting(true);
        await register({ name: values.name, email: values.email, password: values.password });
        setIsSubmitting(false);
    };

    return (
        <div className="flex min-h-screen bg-white font-poppins">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    <div className="text-left mb-8">
                        <h1 className="text-[28px] font-semibold text-[var(--color-text-title)] max-w-[360px]">
                            Welcome to our CRM Sign Up to get started
                        </h1>
                        <p className="text-xl font-[400] mt-3 text-[var(--color-text-body)]">
                            Enter your Details to sign up
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

                                <div className="flex flex-col gap-1">
                                    <label className="text-[var(--color-text-title)] font-medium text-sm">Confirm Password</label>
                                    <div className="relative">
                                        <Field
                                            type={confirmPasswordVisible ? 'text' : 'password'}
                                            name="confirmPassword"
                                            placeholder="Confirm your Password"
                                            className="w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {confirmPasswordVisible ? <Icon icon={eyeOff} className="w-5 h-5" /> : <Icon icon={eye} className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <ErrorMessage name="confirmPassword" component="div" className="text-xs text-[var(--color-error)]" />
                                </div>

                                <div className="flex items-start mt-2">
                                    <label className="flex items-start text-sm cursor-pointer">
                                        <Field
                                            type="checkbox"
                                            name="terms"
                                            className="h-4 w-4 mt-0.5 border-gray-300 rounded text-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]"
                                        />
                                        <span className="ml-2 text-gray-600 leading-snug">
                                            I agree with <Link to="/terms" className="text-[var(--color-primary-500)] hover:underline">terms & Conditions</Link>
                                        </span>
                                    </label>
                                </div>
                                <ErrorMessage name="terms" component="div" className="text-xs text-[var(--color-error)]" />

                                <button
                                    type="submit"
                                    disabled={isSubmitting || isPending}
                                    className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? 'Signing up...' : 'Sign Up'}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="text-center my-8">
                        <div className="flex items-center w-full">
                            <hr className="flex-grow border-t border-gray-200" />
                            <span className="mx-4 text-sm text-[var(--color-text-title)] font-medium">Or Sign up With</span>
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
                            <button type="button" className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-600 transition-all duration-300">
                                <Icon icon={facebook} className="h-8 w-8" />
                            </button>
                            <button type="button" className="h-12 w-12 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 hover:border-blue-400 transition-all duration-300">
                                <Icon icon={twitter} className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="font-semibold text-[var(--color-primary-500)] underline ml-1">Sign in</Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex w-1/2 items-center justify-center p-12 bg-[var(--color-primary-500)]">
                <Image
                    src={registerIllustration}
                    alt="CRM Registration Illustration"
                    width={355}
                    height={284}
                    className="object-contain"
                />
            </div>
        </div>
    );
};

export default Signup;