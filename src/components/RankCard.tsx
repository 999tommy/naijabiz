'use client'

import React, { forwardRef } from 'react'
import { VerifiedBadge } from './VerifiedBadge'
import { Trophy } from 'lucide-react'
import Image from 'next/image'

interface RankCardProps {
    businessName: string
    logoUrl: string | null
    slug: string
    rank: number
    isVerified: boolean
}

export const RankCard = forwardRef<HTMLDivElement, RankCardProps>(({ businessName, logoUrl, slug, rank, isVerified }, ref) => {
    return (
        <div
            ref={ref}
            style={{ width: '1080px', height: '1080px' }} // Square for Instagram
            className="bg-gradient-to-br from-orange-600 via-orange-500 to-yellow-500 p-12 flex flex-col items-center justify-between text-white relative overflow-hidden"
        >
            {/* Background patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full border-[40px] border-white/20"></div>
                <div className="absolute top-[400px] -right-20 w-[400px] h-[400px] rounded-full bg-white/20 blur-3xl"></div>
            </div>

            <div className="z-10 flex flex-col items-center w-full mt-20">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-8 py-3 mb-8 border border-white/30 flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                    <span className="text-3xl font-bold uppercase tracking-widest text-white">NaijaBiz Awards</span>
                </div>

                <h1 className="text-[80px] font-black leading-none text-center drop-shadow-lg mb-4">
                    BUSINESS <br /> OF THE DAY
                </h1>

                <div className="flex items-center justify-center w-32 h-32 bg-white rounded-full text-orange-600 text-7xl font-bold shadow-2xl border-4 border-yellow-400">
                    #{rank}
                </div>
            </div>

            {/* Business Info */}
            <div className="z-10 bg-white text-gray-900 rounded-3xl p-10 w-full max-w-2xl shadow-2xl flex flex-col items-center text-center mx-auto mb-10 transform scale-110">
                {logoUrl ? (
                    <div className="w-40 h-40 rounded-full border-4 border-orange-100 overflow-hidden mb-6 relative">
                        <img src={logoUrl} alt={businessName} className="w-full h-full object-cover" />
                        {/* Using img tag to avoid Next.js Image caching/loading issues during capture */}
                    </div>
                ) : (
                    <div className="w-40 h-40 rounded-full bg-orange-100 flex items-center justify-center text-6xl font-bold text-orange-600 mb-6 border-4 border-orange-50">
                        {businessName.charAt(0)}
                    </div>
                )}

                <div className="flex items-center gap-3 mb-2 justify-center">
                    <h2 className="text-5xl font-bold text-gray-900 truncate max-w-lg">{businessName}</h2>
                    {isVerified && <VerifiedBadge size="lg" />}
                </div>
                <p className="text-2xl text-gray-500 font-medium">Verified Vendor</p>
            </div>

            {/* Footer */}
            <div className="z-10 w-full text-center mb-10">
                <p className="text-3xl font-medium text-white/90 mb-4">Order from us at:</p>
                <div className="inline-block bg-black/30 backdrop-blur-sm rounded-xl px-10 py-4 border border-white/20">
                    <p className="text-4xl font-bold text-white tracking-wide font-mono">
                        naijabiz.org/{slug}
                    </p>
                </div>
            </div>

            {/* Watermark in corner */}
            <div className="absolute bottom-6 right-8 opacity-50 flex items-center gap-2">
                <span className="text-xl font-bold">NaijaBiz</span>
            </div>
        </div>
    )
})

RankCard.displayName = 'RankCard'
