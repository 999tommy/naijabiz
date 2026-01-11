'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Copy, Check, Share2, Users } from 'lucide-react' // Assuming shadcn progress exists, if not I'll fallback to div
import { User } from '@/lib/types'

interface ReferralCardProps {
    user: User
}

export function ReferralCard({ user }: ReferralCardProps) {
    const [copied, setCopied] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const referralLink = mounted ? `${window.location.origin}/signup?ref=${user.business_slug}` : `...`
    const count = user.referral_count || 0
    const target = 5
    const percentage = Math.min((count / target) * 100, 100)

    const handleCopy = () => {
        if (!mounted) return
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on NaijaBiz',
                    text: 'Create a free business page on NaijaBiz!',
                    url: referralLink,
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            handleCopy()
        }
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gift className="w-24 h-24 text-indigo-600" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                    <Gift className="w-5 h-5 text-indigo-600" />
                    Get 1 Month Pro Free
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-indigo-700">
                        Invite <span className="font-bold">{target} business owners</span>. When they create a page, you get 1 month of Pro (worth ₦7,500).
                    </p>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-indigo-900">
                            <span>Your Progress</span>
                            <span>{count} / {target} Joined</span>
                        </div>
                        <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* Link */}
                    <div className="flex gap-2">
                        <div className="flex-1 min-w-0 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate font-mono">
                            {user.business_slug ? referralLink : '...'}
                        </div>
                        <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
