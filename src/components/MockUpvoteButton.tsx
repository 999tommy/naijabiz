'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, ThumbsUp } from 'lucide-react'

interface MockUpvoteButtonProps {
    initialUpvotes: number
    size?: 'sm' | 'default' | 'lg'
}

export function MockUpvoteButton({
    initialUpvotes,
    size = 'default'
}: MockUpvoteButtonProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [hasUpvoted, setHasUpvoted] = useState(false)

    const handleUpvote = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (hasUpvoted) return
        setUpvotes(prev => prev + 1)
        setHasUpvoted(true)
    }

    return (
        <Button
            size={size === 'default' ? 'default' : 'sm'}
            variant="outline"
            className={`gap-2 transition-all duration-300 font-bold border-2 ${hasUpvoted
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 cursor-default"
                    : "text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
            onClick={handleUpvote}
            disabled={hasUpvoted}
        >
            {hasUpvoted ? <ThumbsUp className="w-4 h-4 fill-current" /> : <Rocket className="w-4 h-4" />}
            <span>{upvotes}</span>
            <span className="sr-only">Upvotes</span>
        </Button>
    )
}
