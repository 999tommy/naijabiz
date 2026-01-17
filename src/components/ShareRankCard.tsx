'use client'

import React, { useRef, useState, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Loader2, Share2 } from 'lucide-react'
import { RankCard } from './RankCard'
import { User } from '@/lib/types'

interface ShareRankCardProps {
    user: User
    rank: number
}

export function ShareRankCard({ user, rank }: ShareRankCardProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)

    const downloadImage = useCallback(async () => {
        if (ref.current === null) {
            return
        }

        setLoading(true)

        try {
            // First render pass might be needed to load fonts/images, but usually works ok.
            // We use a simplified dom-to-image usually, html-to-image is similar.
            const dataUrl = await toPng(ref.current, { cacheBust: true, pixelRatio: 1 })

            const link = document.createElement('a')
            link.download = `${user.business_slug}-rank-${rank}.png`
            link.href = dataUrl
            link.click()
        } catch (err) {
            console.error('Failed to generate image', err)
            alert('Failed to generate image. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [ref, user.business_slug, rank])

    // Only show for top 3
    if (rank > 3) return null

    return (
        <Card className="bg-gradient-to-r from-orange-600 to-orange-500 border-none text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>

            <CardContent className="md:flex items-center justify-between p-6 relative z-10">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                            🏆 Achievement Unlocked
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">You are #{rank} today!</h3>
                    <p className="text-orange-100 max-w-md text-sm leading-relaxed">
                        Congratulations! Your business is trending on NaijaBiz. Download your victory badge and share it on Instagram/WhatsApp to get even more customers.
                    </p>
                </div>

                <div className="flex flex-col gap-3 shrink-0">
                    <Button
                        onClick={downloadImage}
                        disabled={loading}
                        className="bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-lg border-0 transition-transform active:scale-95"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        Download Graphic
                    </Button>
                    <p className="text-[10px] text-center text-orange-100 opacity-80">
                        Optimized for Instagram
                    </p>
                </div>
            </CardContent>

            {/* Hidden Render Container - Positioned off-screen but rendered DOM */}
            <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
                <RankCard
                    ref={ref}
                    businessName={user.business_name || 'My Business'}
                    logoUrl={user.logo_url}
                    slug={user.business_slug || ''}
                    rank={rank}
                    isVerified={user.plan === 'pro'} // Use Pro status for green badge in graphic
                />
            </div>
        </Card>
    )
}
