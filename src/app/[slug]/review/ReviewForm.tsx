'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Star, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

interface ReviewFormProps {
    businessId: string
    businessName: string
    businessSlug: string
}

export function ReviewForm({ businessId, businessName, businessSlug }: ReviewFormProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [customerName, setCustomerName] = useState('')
    const [customerContact, setCustomerContact] = useState('')
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            setError('Please select a rating')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase.from('reviews').insert({
                business_id: businessId,
                customer_name: customerName,
                customer_contact: customerContact,
                rating,
                comment: comment || null,
                is_verified: false, // Will be verified by admin or order matching
            })

            if (insertError) throw insertError

            setSuccess(true)
            setTimeout(() => {
                router.push(`/${businessSlug}`)
            }, 2000)
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit review'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h2>
                        <p className="text-gray-500">
                            Your review has been submitted and will appear once verified.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cream-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                <Link
                    href={`/${businessSlug}`}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to {businessName}
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Leave a Review</CardTitle>
                        <CardDescription>
                            Share your experience with {businessName}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Star rating */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Rating *</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Your Name *
                                </label>
                                <Input
                                    id="name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact" className="text-sm font-medium text-gray-700">
                                    Phone / Email *
                                </label>
                                <Input
                                    id="contact"
                                    value={customerContact}
                                    onChange={(e) => setCustomerContact(e.target.value)}
                                    placeholder="For verification"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Used to verify your purchase. Not shared publicly.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="comment" className="text-sm font-medium text-gray-700">
                                    Your Review
                                </label>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell others about your experience..."
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    {error}
                                </p>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Review'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
