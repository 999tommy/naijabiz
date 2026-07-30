'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Send, ChevronDown, ShoppingBag, Calendar, MessageSquare, Sparkles } from 'lucide-react'
import { User as BusinessType } from '@/lib/types'

interface AiChatWidgetProps {
    business: BusinessType
    externalOpen?: boolean
    onExternalOpenChange?: (isOpen: boolean) => void
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface OrderSummary {
    items: Array<{ name: string; price: number; quantity: number }>
    customer_name?: string
    delivery_address?: string
    total: number
    type?: 'product' | 'service'
}

export function AiChatWidget({ business, externalOpen, onExternalOpenChange }: AiChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const isControlled = externalOpen !== undefined
    const actualOpen = isControlled ? externalOpen : isOpen
    const setActualOpen = isControlled ? onExternalOpenChange : setIsOpen
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [replyCount, setReplyCount] = useState(0)
    const [processingOrder, setProcessingOrder] = useState<number | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Listen for custom event to open chat
    useEffect(() => {
        const handleOpenChat = () => {
            if (setActualOpen) setActualOpen(true)
        }
        window.addEventListener('open-ai-chat', handleOpenChat)
        return () => window.removeEventListener('open-ai-chat', handleOpenChat)
    }, [setActualOpen])

    // Initialization
    useEffect(() => {
        if (actualOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', content: business.ai_welcome_msg || "Hello! How can I help you today?" }])
        }
    }, [actualOpen, messages.length, business.ai_welcome_msg])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Free Tier Teaser
    if (business.plan !== 'pro') {
        return (
            <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start opacity-95">
                <Button
                    onClick={() => window.location.href = '/pricing'}
                    className="h-14 px-5 rounded-2xl bg-[#fbf7f0] border border-[#ded4c8] text-[#3d332b] shadow-[0_18px_45px_rgba(61,51,43,.16)] flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 group"
                >
                    <div className="relative">
                        <Sparkles className="w-5 h-5 text-[#8a5a44] transition-colors" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#c7b7a6]"></span>
                        </span>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-sm leading-tight text-[#2f2721]">Virtual Assistant</span>
                        <span className="text-[10px] uppercase tracking-[.14em] text-[#8a5a44] font-bold">Pro feature</span>
                    </div>
                </Button>
            </div>
        )
    }

    if (!business.ai_enabled) return null

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        if (replyCount >= 12) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've reached my message limit for this chat. Please click the WhatsApp button to message the business directly! 📲"
            }])
            return
        }

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setLoading(true)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    messages: [...messages, { role: 'user', content: userMsg }],
                }),
            })

            if (!response.ok) {
                try {
                    const errData = await response.json()
                    if (errData.error === 'LIMIT_REACHED') {
                        throw new Error("Monthly AI chat limit reached for this business. Please contact the owner directly via WhatsApp.");
                    }
                } catch {
                    // ignore JSON parse error
                }
                throw new Error('Something went wrong. Please try again or WhatsApp us.');
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            setReplyCount(prev => prev + 1)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting. Please WhatsApp the owner."
            setMessages(prev => [...prev, { role: 'assistant', content: message }])
        } finally {
            setLoading(false)
        }
    }

    const parseOrderSummary = (text: string): { cleanText: string; summary: OrderSummary | null } => {
        const match = text.match(/\[ORDER_SUMMARY:\s*({[\s\S]*?})\]/)
        if (!match) return { cleanText: text, summary: null }

        try {
            const parsed = JSON.parse(match[1])
            
            // Validate the parsed object matches OrderSummary structure
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                Array.isArray(parsed.items) &&
                typeof parsed.total === 'number' &&
                parsed.items.every((item: unknown) => 
                    typeof item === 'object' &&
                    item !== null &&
                    'name' in item &&
                    'price' in item &&
                    'quantity' in item
                )
            ) {
                const summary: OrderSummary = {
                    items: parsed.items,
                    total: parsed.total,
                    customer_name: typeof parsed.customer_name === 'string' ? parsed.customer_name : undefined,
                    delivery_address: typeof parsed.delivery_address === 'string' ? parsed.delivery_address : undefined,
                    type: parsed.type === 'product' || parsed.type === 'service' ? parsed.type : undefined,
                }
                const cleanText = text.replace(/\[ORDER_SUMMARY:\s*({[\s\S]*?})\]/, '').trim()
                return { cleanText, summary }
            }
            
            return { cleanText: text, summary: null }
        } catch {
            return { cleanText: text, summary: null }
        }
    }

    const handleHandoffToWhatsApp = async (summary: OrderSummary, msgIndex: number) => {
        setProcessingOrder(msgIndex)

        // 1. Send Order to DB
        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_id: business.id,
                    customer_name: summary.customer_name || 'AI Chat Buyer',
                    customer_contact: summary.delivery_address || 'Provided via AI Chat',
                    items: summary.items,
                    total_amount: summary.total,
                    order_method: 'whatsapp'
                })
            })
        } catch (err) {
            console.error('Failed to log order to DB:', err)
        }

        // 2. Format WhatsApp Message
        let waText = `Hi ${business.business_name}! I placed a ${summary.type === 'service' ? 'booking' : 'order'} via your website AI assistant:\n\n`
        
        summary.items.forEach(item => {
            waText += `• ${item.name} (${item.quantity || 1}x) - ₦${(item.price * (item.quantity || 1)).toLocaleString()}\n`
        })

        waText += `\n💰 Total: ₦${Number(summary.total).toLocaleString()}\n`
        if (summary.customer_name) waText += `👤 Name: ${summary.customer_name}\n`
        if (summary.delivery_address) waText += `📍 Details/Address: ${summary.delivery_address}\n`
        waText += `\nPlease confirm and send payment details!`

        const rawPhone = (business.whatsapp_number || '').replace(/[^0-9]/g, '')
        const formattedPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone

        const waUrl = formattedPhone 
            ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`
            : `https://wa.me/?text=${encodeURIComponent(waText)}`

        window.open(waUrl, '_blank')
        setProcessingOrder(null)
    }

    return (
        <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 flex flex-col items-start">
            {/* Chat Window */}
            {actualOpen && (
                <Card className="w-[calc(100vw-1.5rem)] sm:w-[410px] h-[min(620px,calc(100vh-6.5rem))] mb-3 rounded-[1.35rem] shadow-[0_26px_70px_rgba(61,51,43,.24)] border-[#d8cfc4] bg-[#fbf7f0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-[#f3eee7] text-[#2f2721] flex justify-between items-center border-b border-[#ded4c8]">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#e7ddd2] p-2 rounded-xl border border-[#d8cfc4]">
                                <Sparkles className="w-4 h-4 text-[#8a5a44]" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-sm truncate">{business.business_name} assistant</h3>
                                <p className="text-xs text-[#78695f] flex items-center gap-1">
                                    <span className="w-2 h-2 bg-[#4f9d69] rounded-full animate-pulse" /> Online now
                                </p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-[#6f6258] hover:bg-[#e7ddd2] h-8 w-8 rounded-xl" onClick={() => setActualOpen && setActualOpen(false)}>
                            <ChevronDown className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[radial-gradient(circle_at_top_left,rgba(231,221,210,.55),transparent_34%),#fbf7f0]" ref={scrollRef}>
                        {messages.map((m, i) => {
                            if (m.role === 'user') {
                                return (
                                    <div key={i} className="flex justify-end">
                                        <div className="max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#2f2721] text-[#fffaf4] rounded-br-md shadow-[0_8px_24px_rgba(47,39,33,.12)]">
                                            {m.content}
                                        </div>
                                    </div>
                                )
                            }

                            const { cleanText, summary } = parseOrderSummary(m.content)

                            return (
                                <div key={i} className="flex flex-col gap-2 justify-start">
                                    {cleanText && (
                                        <div className="max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#fffdf8] text-[#3d332b] border border-[#e5dcd1] rounded-bl-md shadow-[0_8px_24px_rgba(61,51,43,.06)]">
                                            {cleanText}
                                        </div>
                                    )}

                                    {/* Order / Booking Card Summary */}
                                    {summary && (
                                        <div className="max-w-[92%] rounded-2xl p-4 bg-[#fffdf8] border border-[#d8cfc4] shadow-[0_12px_30px_rgba(61,51,43,.08)] space-y-3">
                                            <div className="flex items-center justify-between border-b border-[#ece2d8] pb-2">
                                                <span className="text-xs font-bold uppercase tracking-[.14em] text-[#6d594b] flex items-center gap-1.5">
                                                    {summary.type === 'service' ? (
                                                        <><Calendar className="w-4 h-4 text-[#8a5a44]" /> Service Booking</>
                                                    ) : (
                                                        <><ShoppingBag className="w-4 h-4 text-[#8a5a44]" /> Ready Order Summary</>
                                                    )}
                                                </span>
                                                <span className="text-xs bg-[#efe8df] text-[#6d594b] font-bold px-2 py-0.5 rounded-full">
                                                    Draft
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-[#4b4038]">
                                                {summary.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between font-medium">
                                                        <span>{item.name} x{item.quantity || 1}</span>
                                                        <span className="font-bold">₦{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                                    </div>
                                                ))}

                                                {summary.delivery_address && (
                                                    <p className="text-[11px] text-[#76675d] pt-1 border-t border-[#ece2d8]">
                                                        <span className="font-semibold">Details:</span> {summary.delivery_address}
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-center text-sm font-extrabold text-[#2f2721] pt-2 border-t border-[#ded4c8]">
                                                    <span>Total:</span>
                                                    <span className="text-[#8a5a44] text-base">₦{Number(summary.total).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleHandoffToWhatsApp(summary, i)}
                                                disabled={processingOrder === i}
                                                className="w-full bg-[#2f2721] hover:bg-[#463a31] text-[#fffaf4] font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                                            >
                                                <MessageSquare className="w-4 h-4 fill-current" />
                                                {processingOrder === i ? 'Preparing order...' : 'Send order via WhatsApp'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#fffdf8] rounded-2xl px-4 py-3 border border-[#e5dcd1] shadow-sm flex gap-1 items-center">
                                    <Sparkles className="w-4 h-4 text-[#8a5a44] mr-1" />
                                    <span className="w-1.5 h-1.5 bg-[#9a8b7d] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-[#9a8b7d] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-[#9a8b7d] rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div className="text-[11px] text-center text-[#9a8b7d] mt-4 font-medium">
                            Powered by NaijaBiz
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="p-3 bg-[#f3eee7] border-t border-[#ded4c8]">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                className="flex-1 min-w-0 bg-[#fffdf8] border border-[#ded4c8] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8a5a44]/20 focus:bg-white transition-all text-[#2f2721] placeholder-[#9a8b7d]"
                                placeholder="Ask price, stock, or place an order..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-2xl bg-[#2f2721] hover:bg-[#463a31] w-11 h-11 shadow-md shrink-0">
                                <Send className="w-4 h-4 text-[#fffaf4]" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* Floating Toggle Button */}
            {!actualOpen && (
                <Button
                    onClick={() => setActualOpen && setActualOpen(true)}
                    className="h-14 px-5 rounded-2xl bg-[#2f2721] hover:bg-[#463a31] text-[#fffaf4] shadow-[0_18px_45px_rgba(47,39,33,.24)] flex items-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-[#5b4c41]"
                >
                    <div className="relative">
                        <Sparkles className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8bc99d] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#4f9d69]"></span>
                        </span>
                    </div>
                    <span className="font-semibold text-sm sm:text-base">Ask assistant</span>
                </Button>
            )}
        </div>
    )
}
