'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bot, X, Send, User, ChevronDown, ShoppingBag, Calendar, CheckCircle2, MessageSquare } from 'lucide-react'
import { User as BusinessType } from '@/lib/types'

interface AiChatWidgetProps {
    business: BusinessType
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

export function AiChatWidget({ business }: AiChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [replyCount, setReplyCount] = useState(0)
    const [processingOrder, setProcessingOrder] = useState<number | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Initialization
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'assistant', content: business.ai_welcome_msg || "Hello! How can I help you today?" }])
        }
    }, [isOpen, messages.length, business.ai_welcome_msg])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Free Tier Teaser
    if (business.plan !== 'pro') {
        return (
            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end opacity-90">
                <Button
                    onClick={() => window.location.href = '/pricing'}
                    className="h-14 px-6 rounded-full bg-white border border-gray-200 text-gray-700 shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
                >
                    <div className="relative">
                        <Bot className="w-6 h-6 text-gray-400 group-hover:text-orange-500 transition-colors" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
                        </span>
                    </div>
                    <div className="flex flex-col items-start text-left">
                        <span className="font-bold text-sm leading-tight text-gray-900 group-hover:text-orange-600 transition-colors">Virtual Assistant</span>
                        <span className="text-[10px] uppercase tracking-wider text-orange-500 font-bold">Pro Feature</span>
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
                } catch (e) {
                    // ignore JSON parse error
                }
                throw new Error('Something went wrong. Please try again or WhatsApp us.');
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
            setReplyCount(prev => prev + 1)
        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: error.message || "Sorry, I'm having trouble connecting. Please WhatsApp the owner." }])
        } finally {
            setLoading(false)
        }
    }

    const parseOrderSummary = (text: string): { cleanText: string; summary: OrderSummary | null } => {
        const match = text.match(/\[ORDER_SUMMARY:\s*({[\s\S]*?})\]/)
        if (!match) return { cleanText: text, summary: null }

        try {
            const summary = JSON.parse(match[1])
            const cleanText = text.replace(/\[ORDER_SUMMARY:\s*({[\s\S]*?})\]/, '').trim()
            return { cleanText, summary }
        } catch (e) {
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
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[360px] sm:w-[400px] h-[530px] mb-4 shadow-2xl border-orange-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{business.business_name} Virtual Assistant</h3>
                                <p className="text-xs text-orange-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> 24/7 Active Assistant
                                </p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20 h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                            <ChevronDown className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                        {messages.map((m, i) => {
                            if (m.role === 'user') {
                                return (
                                    <div key={i} className="flex justify-end">
                                        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-orange-600 text-white rounded-br-none">
                                            {m.content}
                                        </div>
                                    </div>
                                )
                            }

                            const { cleanText, summary } = parseOrderSummary(m.content)

                            return (
                                <div key={i} className="flex flex-col gap-2 justify-start">
                                    {cleanText && (
                                        <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-white text-gray-800 border border-gray-100 rounded-bl-none">
                                            {cleanText}
                                        </div>
                                    )}

                                    {/* Order / Booking Card Summary */}
                                    {summary && (
                                        <div className="max-w-[90%] rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-md space-y-3">
                                            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                                    {summary.type === 'service' ? (
                                                        <><Calendar className="w-4 h-4 text-emerald-600" /> Service Booking</>
                                                    ) : (
                                                        <><ShoppingBag className="w-4 h-4 text-emerald-600" /> Ready Order Summary</>
                                                    )}
                                                </span>
                                                <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                                                    Draft
                                                </span>
                                            </div>

                                            <div className="space-y-1.5 text-xs text-gray-700">
                                                {summary.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between font-medium">
                                                        <span>{item.name} x{item.quantity || 1}</span>
                                                        <span className="font-bold">₦{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                                                    </div>
                                                ))}

                                                {summary.delivery_address && (
                                                    <p className="text-[11px] text-gray-500 pt-1 border-t border-emerald-100">
                                                        📍 <span className="font-semibold">Details:</span> {summary.delivery_address}
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-center text-sm font-extrabold text-emerald-950 pt-2 border-t border-emerald-200">
                                                    <span>Total:</span>
                                                    <span className="text-emerald-700 text-base">₦{Number(summary.total).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleHandoffToWhatsApp(summary, i)}
                                                disabled={processingOrder === i}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                                            >
                                                <MessageSquare className="w-4 h-4 fill-current" />
                                                {processingOrder === i ? 'Preparing Order...' : 'Send Order & Pay via WhatsApp 📲'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex gap-1 items-center">
                                    <Bot className="w-4 h-4 text-orange-500 mr-1 animate-spin" />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div className="text-[11px] text-center text-gray-400 mt-4 font-medium">
                            ⚡ Powered by NaijaBiz Virtual Assistant
                        </div>
                    </div>

                    {/* Input Form */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                                placeholder="Ask price, stock, or place an order..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-full bg-orange-600 hover:bg-orange-700 w-10 h-10 shadow-md shrink-0">
                                <Send className="w-4 h-4 text-white" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 px-6 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-xl shadow-orange-500/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                >
                    <div className="relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>
                    <span className="font-bold text-base">Virtual Assistant</span>
                </Button>
            )}
        </div>
    )
}
