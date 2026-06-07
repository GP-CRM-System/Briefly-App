import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import toast from 'react-hot-toast';

type InviteTeamProps = {
    onNext: () => void;
};

export default function InviteTeam({ onNext }: InviteTeamProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // In a real app, you'd get this link from your backend
    const inviteLink = "Generated link will appear her"; 

    const initialValues = {
        email: '',
    };

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email').required('Email is required'),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        setIsSubmitting(true);
        try {
            await apiClient.post(ENDPOINTS.ORGANIZATION.INVITE_MEMBER, {
                email: values.email,
                role: "member"
            });
            toast.success("Invitation sent!");
            onNext();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to send invitation");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText("https://your-crm.com/invite/12345"); // Replace with real link logic
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="text-left w-full">
            <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                Invite Your Team
            </h1>
            <p className="text-[16px] font-[400] mt-1 mb-8 text-[#9ca3af]">
                Add team members and assign their roles
            </p>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[var(--color-text-title)] font-medium text-sm">E-mail Address</label>
                            <Field
                                type="email"
                                name="email"
                                placeholder="Enter team member email"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Press Enter to add multiple emails</p>
                            <ErrorMessage name="email" component="div" className="text-xs text-[var(--color-error)]" />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Invite'}
                        </button>
                    </Form>
                )}
            </Formik>

            <div className="text-center my-8">
                <div className="flex items-center w-full">
                    <hr className="flex-grow border-t border-gray-100" />
                    <span className="mx-4 text-xs text-gray-400 font-medium uppercase">OR</span>
                    <hr className="flex-grow border-t border-gray-100" />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[var(--color-text-title)] font-medium text-sm">Invite via link</label>
                <div className="flex items-center gap-2">
                    <div className="flex-grow py-3 px-4 bg-[#F8FAFC] border border-gray-200 rounded-lg text-sm text-gray-500 truncate select-none">
                        {inviteLink}
                    </div>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Copy
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button 
                    onClick={onNext}
                    className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
}
