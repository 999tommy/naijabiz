'use client';

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'

export function MockHeaderActions() {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => {
                alert("This is a demo page. In a real page, this would share the link!")
            }}
        >
            <Share2 className="w-4 h-4 mr-2" />
            Share
        </Button>
    )
}
