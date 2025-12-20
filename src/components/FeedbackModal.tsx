'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeedbackModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [type, setType] = useState('suggestion')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setLoading(true)
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, message }),
            })

            if (response.ok) {
                setSuccess(true)
                setMessage('')
                setTimeout(() => {
                    setSuccess(false)
                    setOpen(false)
                }, 2000)
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <MessageSquare className="w-5 h-5 text-gray-400" />
                Feedback
            </button>

            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900">Send Feedback</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Help us improve NaijaBiz. Report a bug or suggest a new feature.
                            </p>

                            {success ? (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <p className="font-bold text-lg text-gray-900">Feedback Sent!</p>
                                    <p className="text-sm text-gray-500">Thank you for helping us make NaijaBiz better.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">What kind of feedback?</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['suggestion', 'bug', 'other'].map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setType(t)}
                                                    className={cn(
                                                        "px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all capitalize",
                                                        type === t
                                                            ? "border-orange-500 bg-orange-50 text-orange-700"
                                                            : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Your Message</label>
                                        <textarea
                                            placeholder="Tell us what you think..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={4}
                                            required
                                            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={loading || !message.trim()}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            'Submit Feedback'
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
