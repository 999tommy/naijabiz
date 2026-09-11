'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SendHorizontal, X, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function MasterChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const scrollRef = useRef<HTMLDivElement>(null)
    const touchStartY = useRef<number | null>(null)

    const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        touchStartY.current = event.touches[0]?.clientY ?? null
    }

    const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        if (touchStartY.current === null) return

        const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY.current
        const swipeDistance = touchEndY - touchStartY.current
        touchStartY.current = null

        if (swipeDistance > 70) setIsOpen(false)
    }

    // Initialization
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', content: "Hi! I'm Qriblo's Virtual Assistant. I can help you discover vendors, order products, book appointments, or take you directly to a shop if you know their name. How can I help you?" }])
        }
    }, [isOpen, messages.length])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: 'qriblo-master',
                    messages: [...messages, { role: 'user', content: userMsg }],
                }),
            })

            if (!response.ok) {
                throw new Error('Something went wrong. Please try again.')
            }

            const data = await response.json()

            if (data.routeToVendor) {
                // LLM wants to route to a vendor
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
                setTimeout(() => {
                    router.push(`/${data.routeToVendor}`)
                }, 1500)
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting."
            setMessages(prev => [...prev, { role: 'assistant', content: message }])
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end opacity-95">
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 px-6 rounded-full bg-[#211a16] hover:bg-[#120e0c] text-white shadow-[0_18px_45px_rgba(33,26,22,.30)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-sans border border-[#3c2e27]"
                >
                    <span className="font-bold text-[15px] tracking-wide">Ask Qriblo</span>
                </Button>
            </div>
        )
    }

    return (
        <Card
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-4 right-4 w-[360px] h-[550px] shadow-[0_30px_60px_-15px_rgba(184,77,52,0.15)] flex flex-col overflow-hidden z-50 border border-gray-100 rounded-[32px] animate-in slide-in-from-bottom-5 fade-in duration-300 touch-pan-y"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1E1410] to-[#2c1d18] text-white p-4 pb-5 flex items-center justify-between shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg p-0.5">
                        <Image src="/smal-logo.png" alt="Qriblo" width={24} height={24} className="rounded-full" />
                    </div>
                    <div>
                        <h3 className="font-black text-[15px] tracking-wide leading-tight text-white/95">Qriblo Support</h3>
                        <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B84D34] animate-pulse shadow-[0_0_8px_rgba(184,77,52,0.8)]" />
                            Online
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Qriblo support chat"
                    className="relative z-10 text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 bg-[#FDF8F3] overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.map((msg, i) => {
                    const isUser = msg.role === 'user'
                    return (
                        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm
                                ${isUser
                                    ? 'bg-[#B84D34] text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }
                            `}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                            <LoaderCircle className="w-4 h-4 text-gray-400 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form
                    onSubmit={handleSend}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full p-1 pl-4 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
                >
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-gray-400 min-w-0"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || loading}
                        className="rounded-full w-9 h-9 shrink-0 bg-[#B84D34] hover:bg-[#9A3F2A] disabled:bg-gray-300 text-white shadow-md shadow-[#B84D34]/20"
                    >
                        <SendHorizontal className="w-4 h-4 ml-0.5" />
                    </Button>
                </form>
            </div>
        </Card>
    )
}
