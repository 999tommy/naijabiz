import React from 'react';

export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-orange max-w-none text-gray-600">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            We collect information you provide directly to us, including:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Account information (Business name, email, phone number, location).</li>
                            <li>Verification documents (NIN, CAC) for Pro users.</li>
                            <li>Product details and images.</li>
                            <li>Usage data and page view analytics.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use collected information to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Provide and maintain the Platform.</li>
                            <li>Verify the legitimacy of your business.</li>
                            <li>Process payments handling via DodoPayment.</li>
                            <li>Display your business profile to potential customers.</li>
                            <li>Send transaction notifications and updates.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
                        <p className="mb-4">
                            We do not sell your personal data. Your public business profile is visible to all visitors. We may share specific data with third-party service providers (e.g., payment processors) strictly for operational purposes.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
                        <p className="mb-4">
                            We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
                        <p className="mb-4">
                            You have the right to access, update, or delete your account information at any time via your dashboard settings.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
                        <p className="mb-4">
                            We use cookies to maintain your login session and analyze platform usage to improve our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@naijabiz.org.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
