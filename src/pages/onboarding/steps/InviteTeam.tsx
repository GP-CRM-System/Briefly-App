import { useState } from 'react';
import * as Yup from 'yup';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import toast from 'react-hot-toast';

type InviteTeamProps = {
    onNext: () => void;
};

export default function InviteTeam({ onNext }: InviteTeamProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emails, setEmails] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState('');

    const addEmail = (email: string) => {
        const trimmed = email.trim();
        if (trimmed && Yup.string().email().isValidSync(trimmed) && !emails.includes(trimmed)) {
            setEmails((prev) => [...prev, trimmed]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addEmail(emailInput);
            setEmailInput('');
        }
    };

    const removeEmail = (email: string) => {
        setEmails((prev) => prev.filter((e) => e !== email));
    };

    const handleSubmit = async () => {
        const allEmails = emailInput.trim() ? [...emails, emailInput.trim()] : emails;
        if (allEmails.length === 0) {
            toast.error('Please enter at least one email address');
            return;
        }

        setIsSubmitting(true);
        try {
            await Promise.all(
                allEmails.map((email) =>
                    apiClient.post(ENDPOINTS.ORGANIZATION.INVITE_MEMBER, {
                        email,
                        role: 'member',
                    })
                )
            );
            toast.success(`${allEmails.length} invitation(s) sent!`);
            onNext();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to send invitation');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="text-left w-full">
            <h1 className="text-[28px] font-semibold text-[var(--color-text-title)]">
                Invite Your Team
            </h1>
            <p className="text-[16px] font-[400] mt-1 mb-8 text-[#9ca3af]">
                Add team members and assign their roles
            </p>

            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[var(--color-text-title)] font-medium text-sm">E-mail Address</label>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter team member email"
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent outline-none transition duration-300 bg-white"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Press Enter to add multiple emails</p>
                </div>

                {emails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {emails.map((email) => (
                            <span
                                key={email}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                            >
                                {email}
                                <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="text-blue-400 hover:text-blue-600"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full bg-[var(--color-primary-500)] text-white font-bold py-3 px-4 rounded-lg hover:bg-[var(--color-primary-600)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary-500)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {isSubmitting ? 'Sending...' : `${emails.length > 0 || emailInput.trim() ? `Send Invite${emails.length > 0 ? `s (${emails.length + (emailInput.trim() ? 1 : 0)})` : ''}` : 'Send Invite'}`}
                </button>
            </div>

            <div className="text-center my-8">
                <div className="flex items-center w-full">
                    <hr className="flex-grow border-t border-gray-100" />
                    <span className="mx-4 text-xs text-gray-400 font-medium uppercase">OR</span>
                    <hr className="flex-grow border-t border-gray-100" />
                </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">
                    Team members will receive an email invitation with a link to join your organization.
                </p>
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
