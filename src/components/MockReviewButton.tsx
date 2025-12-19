'use client';

import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function MockReviewButton() {
    return (
        <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => alert("This is a demo of the review feature.")}>
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
            </Button>
        </div>
    )
}
