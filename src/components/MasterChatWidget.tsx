'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
    SendHorizontal, 
    X, 
    Smile, 
    Paperclip, 
    Mic, 
    CheckCheck, 
    Sparkles, 
    Compass, 
    ShoppingBag, 
    Shirt, 
    UtensilsCrossed 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
}

function getFormattedTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const QUICK_SUGGESTIONS = [
    { label: '🛍️ Discover Vendors', prompt: 'Show me popular vendors on Qriblo' },
    { label: '👗 Fashion Stores', prompt: 'Find fashion and clothing brands' },
    { label: '🍔 Food & Dining', prompt: 'Are there food and snacks vendors?' },
    { label: '✨ How Qriblo Works', prompt: 'How can I buy products or book services on Qriblo?' },
]

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
            setMessages([{ 
                role: 'assistant', 
                content: "Hi! I'm Qriblo's Virtual Assistant. I can help you discover vendors, order products, book appointments, or take you directly to a shop if you know their name. How can I help you today?",
                timestamp: getFormattedTime()
            }])
        }
    }, [isOpen, messages.length])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, loading])

    const sendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || loading) return

        const userMsg = textToSend.trim()
        setInput('')
        const userTime = getFormattedTime()
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: userTime }])
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
            const replyTime = getFormattedTime()

            if (data.routeToVendor) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: replyTime }])
                setTimeout(() => {
                    router.push(`/${data.routeToVendor}`)
                }, 1500)
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: replyTime }])
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting."
            setMessages(prev => [...prev, { role: 'assistant', content: message, timestamp: getFormattedTime() }])
        } finally {
            setLoading(false)
        }
    }

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault()
        sendMessage(input)
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end group">
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 px-5 rounded-full bg-gradient-to-r from-[#66351f] via-[#7a3f25] to-[#c65a24] text-white shadow-[0_12px_32px_rgba(102,53,31,0.35)] flex items-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 border border-[#f4c7a1]/30 hover:shadow-[0_16px_40px_rgba(198,90,36,0.45)] cursor-pointer"
                >
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-[#f4c7a1]/40">
                            <Image src="/smal-logo.png" alt="Qriblo" width={22} height={22} className="rounded-full object-cover" />
                        </div>
                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e] border-2 border-[#66351f]"></span>
                        </span>
                    </div>
                    <div className="flex flex-col items-start text-left pr-1">
                        <span className="font-bold text-[14px] leading-tight tracking-wide text-white">Ask Qriblo</span>
                        <span className="text-[10px] font-semibold text-[#f4c7a1] uppercase tracking-wider">Virtual Assistant</span>
                    </div>
                </button>
            </div>
        )
    }

    return (
        <Card
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 w-[calc(100vw-1.5rem)] sm:w-[390px] h-[min(620px,calc(100vh-5.5rem))] shadow-[0_24px_60px_rgba(102,53,31,0.30)] flex flex-col overflow-hidden z-50 border border-[#f4c7a1]/40 rounded-[28px] animate-in slide-in-from-bottom-6 fade-in duration-200 touch-pan-y"
        >
            {/* WhatsApp App-Bar Header */}
            <div className="bg-gradient-to-r from-[#66351f] via-[#753c23] to-[#c65a24] text-white px-3.5 py-3 flex items-center justify-between shrink-0 shadow-sm relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-md border border-[#f4c7a1]/40">
                            <Image src="/smal-logo.png" alt="Qriblo" width={24} height={24} className="rounded-full object-cover" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-[#66351f] rounded-full" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-[14.5px] leading-tight truncate text-white">Qriblo Virtual assistant</h3>
                        <p className="text-[11.5px] leading-tight mt-0.5 flex items-center gap-1 text-[#fff4e6]/90 font-medium">
                            {loading ? (
                                <span className="text-[#f4c7a1] font-semibold flex items-center gap-1 animate-pulse">
                                    typing...
                                </span>
                            ) : (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block animate-pulse" />
                                    online
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* WhatsApp Doodle Wallpaper Chat Canvas */}
            <div
                ref={scrollRef}
                style={{
                    backgroundColor: '#fff4e6',
                    backgroundImage: `radial-gradient(circle at 50% 50%, rgba(244, 199, 161, 0.22) 0%, rgba(255, 244, 230, 0.95) 100%), url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm24 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm24 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM20 32a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm24 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-36 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm24 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm24 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM32 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-16 28a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm32 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM32 54a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' fill='%2366351f' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                }}
                className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 scroll-smooth"
            >
                {/* WhatsApp Encryption & Today Notice */}
                <div className="flex justify-center my-1">
                    <div className="bg-[#f4c7a1]/40 backdrop-blur-xs text-[#66351f] text-[11px] font-medium px-3 py-1 rounded-lg shadow-[0_1px_1px_rgba(0,0,0,0.05)] flex items-center gap-1.5 max-w-[92%] text-center">
                        <span>🔒</span>
                        <span>Messages are end-to-end encrypted with Qriblo.</span>
                    </div>
                </div>
                <div className="flex justify-center mb-1">
                    <span className="bg-white/90 text-[#66351f]/80 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.04)] uppercase tracking-wider">
                        Today
                    </span>
                </div>

                {/* Chat Messages */}
                {messages.map((msg, i) => {
                    const isUser = msg.role === 'user'
                    return (
                        <div
                            key={i}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'} relative group animate-in fade-in slide-in-from-bottom-2 duration-200`}
                        >
                            {isUser ? (
                                /* WhatsApp Sent Message Bubble */
                                <div className="relative max-w-[85%] sm:max-w-[80%] bg-[#f4c7a1] text-[#222222] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
                                    {/* Bubble Tail */}
                                    <svg className="absolute -right-1.5 top-0 w-2 h-3 text-[#f4c7a1] fill-current" viewBox="0 0 8 13">
                                        <path d="M5.188 0H0v12.18l6.467-8.612C7.526 2.156 6.958 0 5.188 0z" />
                                    </svg>

                                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text font-normal">
                                        {msg.content}
                                    </p>

                                    <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5 select-none">
                                        <span className="text-[10px] text-[#66351f]/75 font-medium">
                                            {msg.timestamp || 'Just now'}
                                        </span>
                                        <CheckCheck className="w-3.5 h-3.5 text-[#c65a24]" />
                                    </div>
                                </div>
                            ) : (
                                /* WhatsApp Received Message Bubble */
                                <div className="relative max-w-[85%] sm:max-w-[80%] bg-white text-[#222222] rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)] border border-[#f4c7a1]/30">
                                    {/* Bubble Tail */}
                                    <svg className="absolute -left-1.5 top-0 w-2 h-3 text-white fill-current" viewBox="0 0 8 13">
                                        <path d="M1.533 3.568L8 12.18V0H2.812C1.042 0 .474 2.156 1.533 3.568z" />
                                    </svg>

                                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text">
                                        {msg.content}
                                    </p>

                                    <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5">
                                        <span className="text-[10px] text-[#66351f]/60 font-medium select-none">
                                            {msg.timestamp || 'Just now'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* WhatsApp Typing Bubble Indicator */}
                {loading && (
                    <div className="flex justify-start relative animate-in fade-in duration-200">
                        <div className="relative bg-white rounded-2xl rounded-tl-xs px-4 py-3 shadow-[0_1px_2px_rgba(34,34,34,0.08)] border border-[#f4c7a1]/30 flex items-center gap-1.5 h-9">
                            <svg className="absolute -left-1.5 top-0 w-2 h-3 text-white fill-current" viewBox="0 0 8 13">
                                <path d="M1.533 3.568L8 12.18V0H2.812C1.042 0 .474 2.156 1.533 3.568z" />
                            </svg>
                            <span className="w-2 h-2 rounded-full bg-[#c65a24] animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-[#c65a24] animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-[#c65a24] animate-bounce" />
                        </div>
                    </div>
                )}
            </div>

            {/* WhatsApp Quick Prompt Chips */}
            {messages.length <= 2 && (
                <div className="bg-[#fff4e6]/95 px-3 py-1.5 border-t border-[#f4c7a1]/30 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    {QUICK_SUGGESTIONS.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => sendMessage(item.prompt)}
                            disabled={loading}
                            className="text-[11.5px] font-semibold text-[#66351f] bg-white hover:bg-[#f4c7a1]/50 active:scale-95 border border-[#f4c7a1]/60 px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs transition-all shrink-0 cursor-pointer"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* WhatsApp Input Shelf */}
            <div className="p-2.5 bg-[#fff4e6] border-t border-[#f4c7a1]/40 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    {/* White Pill Input Container */}
                    <div className="flex-1 bg-white rounded-full px-3 py-2 flex items-center gap-2 shadow-[0_1px_3px_rgba(34,34,34,0.06)] border border-[#f4c7a1]/50 focus-within:border-[#c65a24] focus-within:ring-1 focus-within:ring-[#c65a24]/20 transition-all">
                        <button
                            type="button"
                            className="text-[#66351f]/50 hover:text-[#c65a24] transition-colors p-0.5 shrink-0"
                            aria-label="Emoji"
                        >
                            <Smile className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent text-[13.5px] text-[#222222] placeholder:text-[#222222]/45 outline-none min-w-0"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="text-[#66351f]/50 hover:text-[#c65a24] transition-colors p-0.5 shrink-0"
                            aria-label="Attach"
                        >
                            <Paperclip className="w-4 h-4 rotate-45" />
                        </button>
                    </div>

                    {/* Circular Standalone Send/Mic Button */}
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-[0_3px_10px_rgba(198,90,36,0.3)] transition-all duration-200 cursor-pointer ${
                            input.trim()
                                ? 'bg-[#c65a24] hover:bg-[#b04d1c] active:scale-95 scale-100'
                                : 'bg-[#66351f] hover:bg-[#c65a24] opacity-85 active:scale-95'
                        }`}
                        aria-label="Send message"
                    >
                        {input.trim() ? (
                            <SendHorizontal className="w-4 h-4 ml-0.5 transition-transform" />
                        ) : (
                            <Mic className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </Card>
    )
}

