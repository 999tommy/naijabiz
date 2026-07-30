'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PricingSection() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

    return (
        <section className="py-24 bg-[#faf8f3]" id="pricing">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 font-display">Simple, Fair Pricing</h2>
                <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
                    Power up your brand with an automated AI Sales Assistant that talks to customers and captures WhatsApp orders 24/7.
                </p>

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
                        Annual <span className="text-orange-600 text-xs font-bold ml-1">Save 30%</span>
                    </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {/* Free Plan */}
                    <div className="p-8 rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Free Starter</h3>
                        <p className="text-gray-500 mb-6 font-medium">Forever free for small brands.</p>
                        <div className="text-4xl font-bold text-gray-900 mb-8 font-display">₦0</div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                Your own business link in bio
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <strong>Up to 5 products or services</strong>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                WhatsApp contact button
                            </li>
                            <li className="flex items-center gap-3 text-gray-600">
                                <CheckCircle2 className="w-5 h-5 text-gray-300" />
                                Appear in search directory
                            </li>
                        </ul>
                        <Link href="/signup">
                            <Button className="w-full bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl h-12 font-bold">
                                Create Free Page
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-3xl border-2 border-orange-500 bg-white relative shadow-2xl overflow-hidden group">
                        <div className="absolute top-5 right-5 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" /> Most Popular
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Pro AI Sales Engine</h3>
                        <p className="text-gray-500 mb-6 font-medium">Turn visitors into ready-to-pay orders 24/7.</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-extrabold text-orange-600 font-display">
                                {billingCycle === 'monthly' ? '₦2,500' : '₦20,000'}
                            </span>
                            <span className="text-gray-500 font-display">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 font-semibold text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Everything in Free
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                <strong>Unlimited Products & Services</strong>
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-gray-900 bg-orange-50 p-3 rounded-xl border border-orange-100">
                                <Bot className="w-5 h-5 text-orange-600 shrink-0" />
                                <div>
                                    <strong className="text-orange-950 block">Virtual Assistant (24/7 Sales Closer)</strong>
                                    <span className="text-xs text-gray-600 block">Catalog aware, Pidgin persona, Stock checks & 1-click WhatsApp order capture</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Verified Green Trust Badge (CAC / ID)
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Instant WhatsApp Lead & Order Notifications
                            </li>
                            <li className="flex items-center gap-3 font-semibold text-gray-900">
                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                Priority Directory Ranking
                            </li>
                        </ul>
                        <Link href={`/signup?plan=pro&billing=${billingCycle}`}>
                            <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-orange-500/20">
                                Launch Pro Engine (₦2,500/mo)
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
