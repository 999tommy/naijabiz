'use client';

import { Button } from '@/components/ui/button'
import { MessageCircle, Instagram } from 'lucide-react'

export function MockSocialActions({ instagramHandle = 'tolas_kitchen', tiktokHandle = 'tolas_kitchen', whatsappNumber = '2347047207012' }: { instagramHandle?: string; tiktokHandle?: string; whatsappNumber?: string }) {
    return (
        <div className="flex flex-wrap gap-3 mt-4">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm" onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer')}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
            </Button>
            <Button size="sm" className="bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cb] hover:opacity-90 text-white border-0 font-semibold shadow-sm" onClick={() => window.open(`https://instagram.com/${instagramHandle.replace('@', '')}`, '_blank', 'noopener,noreferrer')}>
                <Instagram className="w-4 h-4 mr-2" />
                Instagram
            </Button>
            <Button size="sm" className="bg-black hover:bg-gray-800 text-white border-0 font-semibold shadow-sm" onClick={() => window.open(`https://www.tiktok.com/@${tiktokHandle.replace('@', '')}`, '_blank', 'noopener,noreferrer')}>
                <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                TikTok
            </Button>
        </div>
    )
}
