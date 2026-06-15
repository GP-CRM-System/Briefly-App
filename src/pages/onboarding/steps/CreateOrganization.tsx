import { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';

type CreateOrganizationProps = {
    onNext: () => void;
};

export default function CreateOrganization({ onNext }: CreateOrganizationProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialValues = {
        name: '',
        slug: '',
    };

    const validationSchema = Yup.object({
        name: Yup.string().required('Organization Name is required'),
        slug: Yup.string()
            .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
            .required('Organization Slug is required'),
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setLogoFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (values: typeof initialValues) => {
        setIsSubmitting(true);
        try {
            const { data: org } = await apiClient.post(ENDPOINTS.ORGANIZATION.CREATE, {
                name: values.name,
                slug: values.slug,
            });

            const orgId = org?.organization?.id || org?.id;
            if (orgId) {
                await apiClient.post(ENDPOINTS.ORGANIZATION.SET_ACTIVE, {
                    organizationId: orgId,
                });

                // Fetch updated user & session information via /me so we have role and permissions loaded
                const { data: meResponse } = await apiClient.get("/me");
                const meData = meResponse.data;
                const token = useAuthStore.getState().token;
                if (meData && token) {
                    const { role, permissions, activeOrganizationId, ...user } = meData;
                    useAuthStore.getState().setSession(
                        token,
                        user as any,
                        role ?? null,
                        permissions ?? {},
                        false
                    );
                }
            }

            toast.success("Organization created!");
            onNext();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to create organization");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-left w-full">
            <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                Create Organization
            </h1>
            <p className="text-[16px] font-[400] mt-1 mb-8 text-[#9ca3af]">
                Set up your company to get started
            </p>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[var(--color-text-title)] font-medium text-sm">Organization Name</label>
                            <Field
                                type="text"
                                name="name"
                                placeholder="Enter your Organization Name"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                            />
                            <ErrorMessage name="name" component="div" className="text-xs text-[var(--color-error)]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[var(--color-text-title)] font-medium text-sm">Organization Slug</label>
                            <Field
                                type="text"
                                name="slug"
                                placeholder="Enter your Company Name"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                            />
                            <ErrorMessage name="slug" component="div" className="text-xs text-[var(--color-error)]" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[var(--color-text-title)] font-medium text-sm">Organization Logo ( Optional )</label>
                            <div 
                                className="mt-2 w-full border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept="image/*"
                                />
                                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                    </svg>
                                </div>
                                {logoFile ? (
                                    <span className="text-sm font-medium text-gray-700">{logoFile.name}</span>
                                ) : (
                                    <>
                                        <span className="text-sm font-medium text-[var(--color-primary-500)]">Upload Logo</span>
                                        <span className="text-xs text-gray-400 mt-1">or drop and drop</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Organization'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
}
