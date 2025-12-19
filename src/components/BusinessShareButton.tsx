'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

interface BusinessShareButtonProps {
    businessName: string
    url?: string
}

export function BusinessShareButton({ businessName }: BusinessShareButtonProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                        title: businessName,
                        url: window.location.href
                    })
                } else if (typeof navigator !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href)
                }
            }}
        >
            <Share2 className="w-4 h-4 mr-2" />
            Share
        </Button>
    )
}
