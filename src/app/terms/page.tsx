import React from 'react';

export const dynamic = 'force-dynamic';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
                <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="prose prose-orange max-w-none text-gray-600">
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing or using NaijaBiz ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                        <p className="mb-4">
                            NaijaBiz provides a platform for Nigerian businesses to create verified profiles, list products, and receive orders via WhatsApp. We act as an intermediary for information display and do not guarantee the quality of goods sold by vendors.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts & Verification</h2>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>You must provide accurate and complete information during registration.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>"Verified" status is granted pending review of submitted documents (e.g., NIN, CAC). We reserve the right to revoke verification at any time if fraudulent activity is suspected.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
                        <p className="mb-4">
                            You agree not to use the Platform for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mb-4">
                            <li>Listing illegal or prohibited items.</li>
                            <li>Fraudulent activities or scams.</li>
                            <li>Harassing or harmful behavior.</li>
                        </ul>
                        <p>
                            We reserve the right to suspend or ban accounts that violate these rules without prior notice.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Payments & Subscriptions</h2>
                        <p className="mb-4">
                            Pro plan subscriptions are billed monthly/annualy. Payments are processed securely via PayStack. You may cancel your subscription at any time, but no refunds will be provided for partial months.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
                        <p className="mb-4">
                            NaijaBiz is provided "as is". We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Platform or any interactions with other users.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
                        <p>
                            For any questions regarding these terms, please contact us at support@naijabiz.org.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
