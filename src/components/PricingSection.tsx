'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    return (
        <section className="py-24 bg-[#faf8f3]" id="pricing">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 font-display">Simple Pricing</h2>
                <p className="text-gray-500 text-center mb-12">Choose the plan that fits your business</p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-12 h-6 rounded-full bg-gray-200 transition-colors focus:outline-none"
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-orange-500 transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`} />
                    </button>
                    <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Annual <span className="text-orange-600 text-xs font-bold ml-1">Save 37%</span>
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Free Plan */}
                    <div className="p-8 rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Free Plan</h3>
                        <p className="text-gray-500 mb-6 font-medium">Forever free.</p>
                        <div className="text-4xl font-bold text-gray-900 mb-8 font-display">₦0</div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                Your own business page
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <strong>Up to 3 products</strong>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                WhatsApp contact button
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                Shareable link
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                Appear in search
                            </li>
                        </ul>
                        <Link href="/signup">
                            <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-lg h-12 font-medium">
                                Create free page
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-3xl border border-orange-200 bg-white relative shadow-xl overflow-hidden group">
                        <div className="absolute top-5 right-5 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Recommended
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Pro Plan</h3>
                        <p className="text-gray-500 mb-6">Everything you need to sell with trust.</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-orange-600 font-display">
                                {billingCycle === 'monthly' ? '₦1,000' : '₦7,500'}
                            </span>
                            <span className="text-gray-500 font-display">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Everything in Free
                            </li>
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                <strong>Unlimited products</strong>
                            </li>
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Green Verified Badge
                            </li>
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Appear higher in search
                            </li>
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Customer reviews
                            </li>
                            <li className="flex items-center gap-3 font-medium text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Page visit statistics
                            </li>
                        </ul>
                        <Link href={`/signup?plan=pro&billing=${billingCycle}`}>
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg h-12 font-bold shadow-lg shadow-orange-100">
                                Get More Customers
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
