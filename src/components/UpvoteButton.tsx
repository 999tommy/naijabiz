'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UpvoteButtonProps {
    userId: string
    initialUpvotes: number
    size?: 'sm' | 'default' | 'lg'
    className?: string
}

export function UpvoteButton({ userId, initialUpvotes, size = 'default', className }: UpvoteButtonProps) {
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [hasUpvoted, setHasUpvoted] = useState(false)
    const [loading, setLoading] = useState(false)

    // Check if user has already upvoted this business on this device
    useEffect(() => {
        if (typeof window === 'undefined') return
        const voted = localStorage.getItem(`upvoted_${userId}`)
        if (voted) setHasUpvoted(true)
    }, [userId])

    const handleUpvote = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (hasUpvoted || loading) return

        setLoading(true)
        // Optimistic update
        setUpvotes(prev => prev + 1)
        setHasUpvoted(true)

        // Save to device storage immediately for responsiveness
        if (typeof window !== 'undefined') {
            localStorage.setItem(`upvoted_${userId}`, 'true')
        }

        try {
            const response = await fetch('/api/upvote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            })

            if (!response.ok) {
                throw new Error('Failed to record upvote')
            }
        } catch (err) {
            console.error('Upvote error:', err)
            setUpvotes(prev => prev - 1)
            setHasUpvoted(false)
            if (typeof window !== 'undefined') {
                localStorage.removeItem(`upvoted_${userId}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            size={size === 'default' ? 'default' : 'sm'}
            variant="outline"
            className={cn(
                "gap-2 transition-all duration-300 font-bold border-2",
                hasUpvoted
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 cursor-default"
                    : "text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600",
                className
            )}
            onClick={handleUpvote}
            disabled={hasUpvoted}
        >
            {hasUpvoted ? <ThumbsUp className="w-4 h-4 fill-current" /> : <Rocket className="w-4 h-4" />}
            <span>{upvotes}</span>
            <span className="sr-only">Upvotes</span>
        </Button>
    )
}
