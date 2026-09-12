'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
    SendHorizontal, 
    X, 
    ShoppingBag, 
    Calendar, 
    MessageSquare, 
    MessageCircle, 
    CheckCheck,
    Store 
} from 'lucide-react'
import { User as BusinessType } from '@/lib/types'
import { extractOrderSummary, type OrderSummary } from '@/lib/ai/orderSummary'

interface AiChatWidgetProps {
    business: BusinessType
    externalOpen?: boolean
    onExternalOpenChange?: (isOpen: boolean) => void
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
    sentAt?: string
}

function getFormattedTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AiChatWidget({ business, externalOpen, onExternalOpenChange }: AiChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const isControlled = externalOpen !== undefined && onExternalOpenChange !== undefined
    const actualOpen = isControlled ? externalOpen : isOpen
    const setActualOpen = (nextOpen: boolean) => {
        if (isControlled) {
            onExternalOpenChange(nextOpen)
        } else {
            setIsOpen(nextOpen)
        }
    }
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [replyCount, setReplyCount] = useState(0)
    const [processingOrder, setProcessingOrder] = useState<number | null>(null)

    const scrollRef = useRef<HTMLDivElement>(null)

    // Load persisted chat from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`qriblo_store_chat_${business.id}_messages`)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed)
                }
            }
        } catch (e) {
            console.error('Error loading store chat history:', e)
        }
    }, [business.id])

    // Persist chat messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem(`qriblo_store_chat_${business.id}_messages`, JSON.stringify(messages))
            } catch (e) {
                console.error('Error saving store chat history:', e)
            }
        }
    }, [messages, business.id])

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
            setMessages([{ 
                role: 'assistant', 
                content: business.ai_welcome_msg || `Hello! Welcome to ${business.business_name}. How can I help you today?`,
                timestamp: getFormattedTime(),
                sentAt: new Date().toISOString()
            }])
        }
    }, [actualOpen, messages.length, business.ai_welcome_msg, business.business_name])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, loading])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        if (business.plan === 'pro' && replyCount >= 12) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I've reached my message limit for this chat session. Please click the WhatsApp button below to chat with us directly! 📲",
                timestamp: getFormattedTime()
            }])
            return
        }

        const userMsg = input.trim()
        setInput('')
        const userTime = getFormattedTime()
        const userMessage = { role: 'user' as const, content: userMsg, timestamp: userTime, sentAt: new Date().toISOString() }
        setMessages(prev => [...prev, userMessage])
        setLoading(true)

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business.id,
                    messages: [...messages, userMessage],
                }),
            })

            if (!response.ok) {
                try {
                    const errData = await response.json()
                    if (errData.error === 'LIMIT_REACHED') {
                        throw new Error(business.plan === 'pro'
                            ? "Today's chat limit has been reached for this business. Please contact the owner directly via WhatsApp."
                            : "This business has used its 100 free Virtual Assistant messages for the month. Please contact the owner directly via WhatsApp."
                        );
                    }
                } catch {
                    // ignore JSON parse error
                }
                throw new Error('Something went wrong. Please try again or WhatsApp us.');
            }

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: getFormattedTime(), sentAt: new Date().toISOString() }])
            setReplyCount(prev => prev + 1)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting. Please WhatsApp the owner."
            setMessages(prev => [...prev, { role: 'assistant', content: message, timestamp: getFormattedTime(), sentAt: new Date().toISOString() }])
        } finally {
            setLoading(false)
        }
    }

    const parseOrderSummary = (text: string): { cleanText: string; summary: OrderSummary | null } => {
        const tag = extractOrderSummary(text)
        if (!tag) return { cleanText: text, summary: null }

        try {
            const parsed = tag.value as Record<string, unknown>
            
            if (
                Array.isArray(parsed.items) &&
                typeof parsed.total === 'number' &&
                parsed.items.every((item: unknown) => 
                    typeof item === 'object' &&
                    item !== null &&
                    'name' in item &&
                    'price' in item &&
                    'quantity' in item &&
                    typeof item.name === 'string' &&
                    typeof item.price === 'number' &&
                    typeof item.quantity === 'number'
                )
            ) {
                const summary: OrderSummary = {
                    items: parsed.items as OrderSummary['items'],
                    total: parsed.total,
                    customer_name: typeof parsed.customer_name === 'string' ? parsed.customer_name : undefined,
                    delivery_address: typeof parsed.delivery_address === 'string' ? parsed.delivery_address : undefined,
                    type: parsed.type === 'product' || parsed.type === 'service' ? parsed.type : 'product',
                }
                const cleanText = `${text.slice(0, tag.start)}${text.slice(tag.end)}`.trim()
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
                    customer_name: summary.customer_name || 'Customer',
                    customer_contact: summary.delivery_address || 'Provided via Chat',
                    items: summary.items,
                    total_amount: summary.total,
                    order_method: 'whatsapp'
                })
            })
        } catch (err) {
            console.error('Failed to log order to DB:', err)
        }

        // 2. Format WhatsApp Message
        let waText = `Hi ${business.business_name}! I placed a ${summary.type === 'service' ? 'booking' : 'order'} via your website assistant:\n\n`
        
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
        <div className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-50 flex flex-col items-start">
            {/* Chat Window */}
            {actualOpen && (
                <Card className="w-[calc(100vw-1.5rem)] sm:w-[395px] h-[min(620px,calc(100vh-5.5rem))] mb-3 rounded-[28px] shadow-[0_26px_70px_rgba(102,53,31,0.28)] border border-[#f4c7a1]/40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-200">
                    {/* WhatsApp App-Bar Header */}
                    <div className="p-3.5 bg-gradient-to-r from-[#66351f] via-[#753c23] to-[#c65a24] text-white flex justify-between items-center shrink-0 shadow-sm relative z-10">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-md border border-[#f4c7a1]/40">
                                    <Store className="w-5 h-5 text-[#c65a24]" />
                                </div>
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-[#66351f] rounded-full" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-[14.5px] leading-tight truncate text-white">
                                    {business.business_name}
                                </h3>
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
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 h-8 w-8 rounded-full transition-colors cursor-pointer"
                            onClick={() => setActualOpen(false)}
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5" />
                        </Button>
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
                        {/* WhatsApp Encryption Notice */}
                        <div className="flex justify-center my-1">
                            <div className="bg-[#f4c7a1]/40 backdrop-blur-xs text-[#66351f] text-[11px] font-medium px-3 py-1 rounded-lg shadow-[0_1px_1px_rgba(0,0,0,0.05)] flex items-center gap-1.5 max-w-[92%] text-center">
                                <MessageCircle className="h-3 w-3 shrink-0" />
                                <span>Chat with {business.business_name}'s Virtual Assistant.</span>
                            </div>
                        </div>
                        <div className="flex justify-center mb-1">
                            <span className="bg-white/90 text-[#66351f]/80 text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-[0_1px_1px_rgba(0,0,0,0.04)] uppercase tracking-wider">
                                Today
                            </span>
                        </div>

                        {/* Messages */}
                        {messages.map((m, i) => {
                            if (m.role === 'user') {
                                return (
                                    <div key={i} className="flex justify-end relative group animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="relative max-w-[85%] sm:max-w-[80%] bg-[#f4c7a1] text-[#222222] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
                                            {/* Bubble Tail */}
                                            <svg className="absolute -right-1.5 top-0 w-2 h-3 text-[#f4c7a1] fill-current" viewBox="0 0 8 13">
                                                <path d="M5.188 0H0v12.18l6.467-8.612C7.526 2.156 6.958 0 5.188 0z" />
                                            </svg>

                                            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text font-normal">
                                                {m.content}
                                            </p>

                                            <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5 select-none">
                                                <span className="text-[10px] text-[#66351f]/75 font-medium">
                                                    {m.timestamp || 'Just now'}
                                                </span>
                                                <CheckCheck className="w-3.5 h-3.5 text-[#c65a24]" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            const { cleanText, summary } = parseOrderSummary(m.content)

                            return (
                                <div key={i} className="flex flex-col gap-2.5 justify-start relative group animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    {cleanText && (
                                        <div className="relative max-w-[88%] sm:max-w-[82%] bg-white text-[#222222] rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)] border border-[#f4c7a1]/30">
                                            {/* Bubble Tail */}
                                            <svg className="absolute -left-1.5 top-0 w-2 h-3 text-white fill-current" viewBox="0 0 8 13">
                                                <path d="M1.533 3.568L8 12.18V0H2.812C1.042 0 .474 2.156 1.533 3.568z" />
                                            </svg>

                                            <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text">
                                                {cleanText}
                                            </p>

                                            <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5">
                                                <span className="text-[10px] text-[#66351f]/60 font-medium select-none">
                                                    {m.timestamp || 'Just now'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* WhatsApp Business Style Order / Booking Summary Card */}
                                    {summary && (
                                        <div className="max-w-[92%] sm:max-w-[88%] rounded-2xl bg-white border border-[#f4c7a1]/70 shadow-[0_4px_16px_rgba(102,53,31,0.08)] overflow-hidden space-y-0">
                                            {/* WhatsApp Card Header */}
                                            <div className="bg-[#fff4e6] px-3.5 py-2.5 border-b border-[#f4c7a1]/40 flex items-center justify-between">
                                                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#66351f] flex items-center gap-1.5">
                                                    {summary.type === 'service' ? (
                                                        <><Calendar className="w-4 h-4 text-[#c65a24]" /> Service Booking</>
                                                    ) : (
                                                        <><ShoppingBag className="w-4 h-4 text-[#c65a24]" /> Order Summary</>
                                                    )}
                                                </span>
                                                <span className="text-[10px] bg-[#f4c7a1] text-[#66351f] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Ready
                                                </span>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-3.5 space-y-2.5 text-xs text-[#222222]">
                                                <div className="space-y-1.5">
                                                    {summary.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center py-0.5 border-b border-[#fff4e6] last:border-0">
                                                            <span className="font-medium text-[#222222]">
                                                                {item.name} <span className="text-[#66351f] font-bold">x{item.quantity || 1}</span>
                                                            </span>
                                                            <span className="font-bold text-[#222222]">
                                                                ₦{(item.price * (item.quantity || 1)).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {summary.delivery_address && (
                                                    <p className="text-[11.5px] text-[#66351f] pt-1.5 border-t border-[#f4c7a1]/30">
                                                        <span className="font-bold text-[#222222]">Note / Address:</span> {summary.delivery_address}
                                                    </p>
                                                )}

                                                <div className="flex justify-between items-center pt-2 border-t border-[#f4c7a1]/40">
                                                    <span className="font-bold text-sm text-[#222222]">Total</span>
                                                    <span className="text-base font-extrabold text-[#c65a24]">
                                                        ₦{Number(summary.total).toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* WhatsApp Handoff CTA Button */}
                                                <button
                                                    onClick={() => handleHandoffToWhatsApp(summary, i)}
                                                    disabled={processingOrder === i}
                                                    className="w-full mt-1 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-xs py-3 rounded-xl shadow-[0_4px_14px_rgba(37,211,102,0.30)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                                                >
                                                    <MessageSquare className="w-4 h-4 fill-current" />
                                                    {processingOrder === i ? 'Opening WhatsApp...' : 'Send Order via WhatsApp'}
                                                </button>
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

                        <div className="text-[10.5px] text-center text-[#66351f]/60 mt-3 font-medium select-none">
                            Powered by Qriblo
                        </div>
                    </div>

                    {/* WhatsApp Input Shelf */}
                    <div className="p-2.5 bg-[#fff4e6] border-t border-[#f4c7a1]/40 shrink-0">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center shadow-[0_1px_3px_rgba(34,34,34,0.06)] border border-[#f4c7a1]/50 focus-within:border-[#c65a24] focus-within:ring-1 focus-within:ring-[#c65a24]/20 transition-all">
                                <input
                                    type="text"
                                    placeholder={business.plan === 'pro' ? 'Ask price, stock, or place an order...' : 'Ask the Virtual Assistant...'}
                                    className="flex-1 bg-transparent text-base text-[#222222] placeholder:text-[#222222]/45 outline-none min-w-0"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            {input.trim().length > 0 && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 bg-[#c65a24] hover:bg-[#b04d1c] active:scale-95 shadow-[0_3px_10px_rgba(198,90,36,0.3)] transition-all duration-150 animate-in fade-in zoom-in-75 cursor-pointer"
                                    aria-label="Send message"
                                >
                                    <SendHorizontal className="w-4 h-4 ml-0.5 transition-transform" />
                                </button>
                            )}
                        </form>
                    </div>
                </Card>
            )}

            {/* Floating FAB Trigger Button */}
            {!actualOpen && (
                <button
                    onClick={() => setActualOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-[#66351f] to-[#c65a24] hover:from-[#7a3f25] hover:to-[#b04d1c] text-white shadow-[0_12px_32px_rgba(102,53,31,0.35)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-[#f4c7a1]/30 cursor-pointer"
                    aria-label="Chat with Assistant"
                >
                    <div className="relative">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e] border-2 border-[#66351f]"></span>
                        </span>
                    </div>
                </button>
            )}
        </div>
    )
}
