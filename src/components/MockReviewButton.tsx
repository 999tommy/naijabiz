'use client';

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function MockReviewButton() {
    return (
        <div className="mt-6 text-center">
            <Link href="/tolas-kitchen/review"><Button variant="outline"><Star className="w-4 h-4 mr-2" />Leave a Review</Button></Link>
        </div>
    )
}
