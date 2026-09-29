'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle2, Circle, MessageCircle, Package, UserCircle, WandSparkles } from 'lucide-react'
import { User } from '@/lib/types'

interface OnboardingAssistantProps {
    user: User
    productCount: number
}

export function OnboardingAssistant({ user, productCount }: OnboardingAssistantProps) {
    const [successfulTests, setSuccessfulTests] = useState(0)

    useEffect(() => {
        try {
            const count = Number(window.localStorage.getItem(`qriblo-va-tests-${user.id}`) || 0)
            if (Number.isFinite(count) && count > 0) setSuccessfulTests(count)
        } catch {
            // The checklist remains usable when browser storage is unavailable.
        }
    }, [user.id])

    const hasPage = Boolean(user.business_name && user.business_slug)
    const hasOffer = productCount > 0
    const hasTrainedVa = Boolean(user.ai_instructions?.trim())
    const isLive = user.plan === 'pro' && user.ai_enabled
    const steps = [
        { title: 'Create your brand page', description: 'Add your brand name and page link.', cta: 'Build your page', href: '/dashboard/settings', done: hasPage, icon: UserCircle },
        { title: user.business_type === 'services' ? 'Add a service' : 'Add a product or service', description: 'Add what you offer so your VA can give useful answers.', cta: 'Add what you offer', href: '/dashboard/products', done: hasOffer, icon: Package },
        { title: 'Try real customer questions', description: 'Test a few questions customers may ask.', cta: 'Test your VA', href: '/dashboard/ai#va-tests', done: successfulTests >= 5, icon: MessageCircle },
        { title: 'Train your VA', description: 'Tell your VA how to answer in your brand’s voice.', cta: 'Train your VA', href: '/dashboard/ai#va-training', done: hasTrainedVa, icon: WandSparkles },
    ]
    const activeStep = steps.findIndex(step => !step.done)
    const allReady = steps.every(step => step.done)
    const currentStep = activeStep === -1 ? steps[steps.length - 1] : steps[activeStep]
    const CurrentIcon = currentStep.icon

    return (
        <section className="qr-onboarding-card mb-8 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 to-white p-6">
                <div className="mb-2 flex items-center gap-2">
                    <WandSparkles className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-gray-900">Set up your brand VA</h2>
                </div>
                <p className="text-sm text-gray-600">Follow these simple steps. Your VA will be ready to help your customers.</p>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1fr_280px]">
                <div>
                    <div className="mb-4 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                        {isLive ? 'YOUR VA IS LIVE' : activeStep === -1 ? 'READY TO GO LIVE' : `STEP ${activeStep + 1} OF ${steps.length}`}
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                        <CurrentIcon className="h-5 w-5 text-orange-600" />
                        <h3 className="text-xl font-bold text-gray-900">{isLive ? 'Your VA is helping customers' : allReady ? 'Your VA is ready' : currentStep.title}</h3>
                    </div>
                    <p className="mb-5 leading-relaxed text-gray-600">
                        {isLive ? 'Customers can now get answers from your VA.' : allReady ? 'Your VA is ready. It is currently offline to customers.' : currentStep.description}
                    </p>
                    {!isLive && <Link href={allReady ? '/dashboard/ai#va-launch' : currentStep.href}>
                        <Button size="lg" className="bg-orange-600 font-semibold text-white shadow-lg shadow-orange-100 hover:bg-orange-700">
                            {allReady ? 'Go live for ₦2,500/month' : currentStep.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>}
                </div>

                <ol className="space-y-3 border-t border-gray-100 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-1">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex items-center gap-3 text-sm">
                            {step.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" /> : <Circle className={`h-5 w-5 shrink-0 ${index === activeStep ? 'text-orange-600' : 'text-gray-300'}`} />}
                            <span className={step.done ? 'text-gray-500' : index === activeStep ? 'font-semibold text-gray-900' : 'text-gray-400'}>{step.title}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
