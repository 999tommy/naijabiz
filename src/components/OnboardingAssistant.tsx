'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Circle,
    ArrowRight,
    Sparkles,
    ShoppingBag,
    UserCircle,
    Share2
} from 'lucide-react'

import { User } from '@/lib/types'

interface OnboardingAssistantProps {
    user: User
    productCount: number
}

export function OnboardingAssistant({ user, productCount }: OnboardingAssistantProps) {
    // Determine completed steps
    const hasAddedProduct = productCount > 0
    const hasCompletedProfile = !!(user.business_name && user.whatsapp_number && user.location && user.description && user.logo_url)

    // We can't easily track "shared link" without more state, so we'll assume it's the last step
    // and show it if the others are done.

    // Determine current active step
    let activeStep = 0 // 0: Add Product, 1: Complete Profile, 2: Share Link

    if (!hasAddedProduct) {
        activeStep = 0
    } else if (!hasCompletedProfile) {
        activeStep = 1
    } else {
        activeStep = 2
    }

    const steps = [
        {
            id: 'product',
            title: 'Add your first product',
            description: 'Customers need to see what you sell. Add a photo and price.',
            cta: 'Add a Product',
            href: '/dashboard/products',
            icon: <ShoppingBag className="w-5 h-5" />,
            isComplete: hasAddedProduct
        },
        {
            id: 'profile',
            title: 'Complete your profile',
            description: 'Add your logo, location, and description to build trust.',
            cta: 'Update Profile',
            href: '/dashboard/settings',
            icon: <UserCircle className="w-5 h-5" />,
            isComplete: hasCompletedProfile
        },
        {
            id: 'share',
            title: 'Share your link',
            description: 'Send your link to customers on WhatsApp to get your first order.',
            cta: 'Copy Link',
            href: `/${user.business_slug}`,
            icon: <Share2 className="w-5 h-5" />,
            isComplete: false // Always show as final step action
        }
    ]

    const currentStep = steps[activeStep]

    // If all major steps are "visually" done (product + profile), we just show the share step as the active one.
    // If the user has been here for a long time (e.g. > 7 days) maybe we don't show this? 
    // For now, let's always show it to be helpful.

    return (
        <div className="mb-8 bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-white p-6 border-b border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <h2 className="font-bold text-gray-900 text-lg">Let&apos;s get you your first customer</h2>
                </div>
                <p className="text-gray-600 text-sm">
                    Complete these steps to set up your shop for success.
                </p>
            </div>

            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Active Step Focus */}
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-4">
                            STEP {activeStep + 1} OF 3
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {currentStep.title}
                        </h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            {currentStep.description}
                        </p>

                        <Link href={currentStep.href}>
                            <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-100 font-semibold group">
                                {currentStep.cta}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    {/* Progress List */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
                        <div className="space-y-4">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-3 ${index === activeStep
                                        ? 'opacity-100'
                                        : index < activeStep
                                            ? 'opacity-50'
                                            : 'opacity-40'
                                        }`}
                                >
                                    <div className={`
                                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                                        ${step.isComplete
                                            ? 'bg-green-100 border-green-100 text-green-600'
                                            : index === activeStep
                                                ? 'bg-orange-50 border-orange-500 text-orange-600'
                                                : 'bg-transparent border-gray-200 text-gray-300'
                                        }
                                    `}>
                                        {step.isComplete ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <span className="font-bold text-sm">{index + 1}</span>
                                        )}
                                    </div>
                                    <span className={`font-medium ${index === activeStep ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
