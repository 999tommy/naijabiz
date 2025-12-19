import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { CheckCircle2, ArrowRight, Star } from 'lucide-react'

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
                        <span className="font-bold text-gray-900">NaijaBiz</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="outline" size="sm">Sign In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-500">
                        Start free, upgrade when you need more
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="rounded-2xl border-2 border-gray-200 p-8 bg-white">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                            <div className="text-5xl font-bold text-gray-900">₦0</div>
                            <p className="text-gray-500 mt-2">Forever free</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">Basic business page</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">Up to 3 products</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">WhatsApp order links</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">Listed in directory</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <span className="w-5 h-5 flex-shrink-0 text-center">—</span>
                                <span>No verified badge</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <span className="w-5 h-5 flex-shrink-0 text-center">—</span>
                                <span>No customer reviews</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <span className="w-5 h-5 flex-shrink-0 text-center">—</span>
                                <span>No analytics</span>
                            </li>
                        </ul>

                        <Link href="/signup" className="block">
                            <Button variant="outline" className="w-full" size="lg">
                                Get Started Free
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="rounded-2xl border-2 border-orange-500 p-8 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-bl-lg">
                            MOST POPULAR
                        </div>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                                Pro
                                <VerifiedBadge size="sm" />
                            </h3>
                            <div className="text-5xl font-bold text-gray-900">
                                ₦1,000<span className="text-xl font-normal text-gray-500">/mo</span>
                            </div>
                            <p className="text-gray-500 mt-2">Everything you need</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">Everything in Free</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Green Verified Badge ✓</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Unlimited products</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Customer reviews & ratings</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Featured in search results</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Page view analytics</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                <span className="text-gray-900 font-medium">Priority support</span>
                            </li>
                        </ul>

                        <Link href="/signup" className="block">
                            <Button className="w-full" size="lg">
                                Start 7-Day Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                How do I get the verified badge?
                            </h3>
                            <p className="text-gray-600">
                                Upgrade to Pro and upload your identity document (NIN, CAC, or government ID).
                                We&apos;ll review it and activate your green verified badge within 24-48 hours.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Can I cancel anytime?
                            </h3>
                            <p className="text-gray-600">
                                Yes! You can cancel your Pro subscription at any time. Your account will
                                remain Pro until the end of your billing period.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-600">
                                We accept all Nigerian bank cards, bank transfers, and mobile money
                                through DodoPayment.
                            </p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                What happens when I downgrade to Free?
                            </h3>
                            <p className="text-gray-600">
                                If you have more than 3 products, the oldest ones will be hidden (not deleted).
                                Your verified badge will be removed, and reviews won&apos;t be visible to customers.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} NaijaBiz. Made with ❤️ in Nigeria.
                    </p>
                </div>
            </footer>
        </div>
    )
}
