'use client';

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

export function MockHeaderActions() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                const url = window.location.href
                if (navigator.share) navigator.share({ title: document.title, url }).catch(() => undefined)
                else navigator.clipboard.writeText(url)
            }}
        >
            <Share2 className="w-4 h-4 mr-2" />
            Share
        </Button>
    )
}
