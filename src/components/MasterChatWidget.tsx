'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { 
    SendHorizontal, 
    X, 
    CheckCheck, 
    MessageCircle,
    Store,
    ExternalLink,
    ArrowLeft,
    ShoppingBag,
    Calendar,
    MessageSquare
} from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
    sentAt?: string
    isTakeoverAnnouncement?: boolean
    vendorSlug?: string
    vendorName?: string
}

interface ActiveVendor {
    id: string
    name: string
    slug: string
    welcomeMsg?: string
    whatsappNumber?: string
}

interface OrderSummary {
    items: Array<{ name: string; price: number; quantity: number }>
    customer_name?: string
    delivery_address?: string
    total: number
    type?: 'product' | 'service'
}

function getFormattedTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const MASTER_CHAT_STORAGE_KEY = 'qriblo_master_chat_messages'
const MASTER_CHAT_VENDOR_KEY = 'qriblo_master_chat_vendor'

const QUICK_SUGGESTIONS = [
    { label: '🛍️ Discover Vendors', prompt: 'Show me popular vendors on Qriblo' },
    { label: '👗 Fashion Stores', prompt: 'Find fashion and clothing brands' },
    { label: '🍔 Food & Dining', prompt: 'Are there food and snacks vendors?' },
    { label: '✨ How Qriblo Works', prompt: 'How can I buy products or book services on Qriblo?' },
]

export function MasterChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [activeVendor, setActiveVendor] = useState<ActiveVendor | null>(null)
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [processingOrder, setProcessingOrder] = useState<number | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const touchStartY = useRef<number | null>(null)

    // Load persisted chat on mount
    useEffect(() => {
        try {
            const savedMsgs = localStorage.getItem(MASTER_CHAT_STORAGE_KEY)
            const savedVendor = localStorage.getItem(MASTER_CHAT_VENDOR_KEY)
            if (savedMsgs) {
                const parsed = JSON.parse(savedMsgs)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed)
                }
            }
            if (savedVendor) {
                setActiveVendor(JSON.parse(savedVendor))
            }
        } catch (e) {
            console.error('Error restoring chat history:', e)
        }
    }, [])

    // Persist messages whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem(MASTER_CHAT_STORAGE_KEY, JSON.stringify(messages))
            } catch (e) {
                console.error('Error saving chat history:', e)
            }
        }
    }, [messages])

    // Persist active vendor context
    useEffect(() => {
        try {
            if (activeVendor) {
                localStorage.setItem(MASTER_CHAT_VENDOR_KEY, JSON.stringify(activeVendor))
            } else {
                localStorage.removeItem(MASTER_CHAT_VENDOR_KEY)
            }
        } catch (e) {
            console.error('Error saving active vendor:', e)
        }
    }, [activeVendor])

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

    // Initialize greeting if empty
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ 
                role: 'assistant', 
                content: "Hi! I'm Qriblo's Virtual Assistant. I can help you discover vendors, explore products, book appointments, or connect with any store. How can I help you today?",
                timestamp: getFormattedTime(),
                sentAt: new Date().toISOString()
            }])
        }
    }, [isOpen, messages.length])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, loading])

    const parseOrderSummary = (text: string): { cleanText: string; summary: OrderSummary | null } => {
        const match = text.match(/\[ORDER_SUMMARY:\s*({[\s\S]*?})\]/)
        if (!match) return { cleanText: text, summary: null }

        try {
            const parsed = JSON.parse(match[1])
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                Array.isArray(parsed.items) &&
                typeof parsed.total === 'number'
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
        if (!activeVendor) return
        setProcessingOrder(msgIndex)

        try {
            await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    business_id: activeVendor.id,
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

        let waText = `Hi ${activeVendor.name}! I placed a ${summary.type === 'service' ? 'booking' : 'order'} via your website assistant:\n\n`
        summary.items.forEach(item => {
            waText += `• ${item.name} (${item.quantity || 1}x) - ₦${(item.price * (item.quantity || 1)).toLocaleString()}\n`
        })
        waText += `\n💰 Total: ₦${Number(summary.total).toLocaleString()}\n`
        if (summary.customer_name) waText += `👤 Name: ${summary.customer_name}\n`
        if (summary.delivery_address) waText += `📍 Details/Address: ${summary.delivery_address}\n`
        waText += `\nPlease confirm and send payment details!`

        const rawPhone = (activeVendor.whatsappNumber || '').replace(/[^0-9]/g, '')
        const formattedPhone = rawPhone.startsWith('0') ? '234' + rawPhone.slice(1) : rawPhone
        const waUrl = formattedPhone
            ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`
            : `https://wa.me/?text=${encodeURIComponent(waText)}`
        window.open(waUrl, '_blank')
        setProcessingOrder(null)
    }

    const handleSwitchBackToMaster = () => {
        setActiveVendor(null)
        setMessages(prev => [
            ...prev,
            {
                role: 'assistant',
                content: "Switched back to Qriblo Virtual Assistant. How else can I help you discover shops or products?",
                timestamp: getFormattedTime(),
                sentAt: new Date().toISOString()
            }
        ])
    }

    const sendMessage = async (textToSend: string) => {
        if (!textToSend.trim() || loading) return

        const userMsg = textToSend.trim()
        setInput('')
        const userTime = getFormattedTime()
        const userMessage = { role: 'user' as const, content: userMsg, timestamp: userTime, sentAt: new Date().toISOString() }
        setMessages(prev => [...prev, userMessage])
        setLoading(true)

        try {
            // Target specific vendor if brand takeover is active, else master
            const targetBusinessId = activeVendor ? activeVendor.id : 'qriblo-master'

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: targetBusinessId,
                    messages: [...messages, userMessage],
                }),
            })

            if (!response.ok) {
                throw new Error('Something went wrong. Please try again.')
            }

            const data = await response.json()
            const replyTime = getFormattedTime()

            // In-chat vendor takeover without navigating away
            if (data.vendorTakeover) {
                const vendor: ActiveVendor = data.vendorTakeover
                setActiveVendor(vendor)
                setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: data.reply, timestamp: replyTime, sentAt: new Date().toISOString() },
                    { 
                        role: 'assistant', 
                        content: `Now chatting directly with ${vendor.name}'s assistant.`, 
                        timestamp: replyTime,
                        sentAt: new Date().toISOString(),
                        isTakeoverAnnouncement: true,
                        vendorSlug: vendor.slug,
                        vendorName: vendor.name
                    }
                ])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: replyTime, sentAt: new Date().toISOString() }])
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting."
            setMessages(prev => [...prev, { role: 'assistant', content: message, timestamp: getFormattedTime(), sentAt: new Date().toISOString() }])
        } finally {
            setLoading(false)
        }
    }

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault()
        sendMessage(input)
    }

    // Minimalist Floating Open Button (FAB): No Qriblo logo, no text
    if (!isOpen) {
        return (
            <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-[#66351f] to-[#c65a24] hover:from-[#7a3f25] hover:to-[#b04d1c] text-white shadow-[0_12px_32px_rgba(102,53,31,0.35)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 border border-[#f4c7a1]/30 cursor-pointer"
                    aria-label="Open chat"
                >
                    <div className="relative">
                        <MessageCircle className="w-6 h-6 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e] border-2 border-[#66351f]"></span>
                        </span>
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
                    {/* If vendor takeover is active, show back arrow to return to Qriblo */}
                    {activeVendor && (
                        <button
                            type="button"
                            onClick={handleSwitchBackToMaster}
                            className="text-white/80 hover:text-white p-1 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
                            title="Back to Qriblo Assistant"
                            aria-label="Back to Qriblo Assistant"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}

                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-md border border-[#f4c7a1]/40">
                            {activeVendor ? (
                                <Store className="w-5 h-5 text-[#c65a24]" />
                            ) : (
                                <MessageCircle className="w-5 h-5 text-[#c65a24]" />
                            )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-[#66351f] rounded-full" />
                    </div>

                    <div className="min-w-0">
                        <h3 className="font-bold text-[14.5px] leading-tight truncate text-white">
                            {activeVendor ? `${activeVendor.name} Assistant` : 'Qriblo Virtual assistant'}
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

                <div className="flex items-center gap-1">
                    {activeVendor?.slug && (
                        <a
                            href={`/${activeVendor.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                            title={`Visit ${activeVendor.name}`}
                            aria-label={`Visit ${activeVendor.name}`}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close chat"
                        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
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

                    // Special in-chat takeover announcement card
                    if (msg.isTakeoverAnnouncement) {
                        return (
                            <div key={i} className="flex justify-center my-2 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-white rounded-2xl p-3 border border-[#f4c7a1] shadow-sm max-w-[94%] w-full space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Store className="w-4 h-4 text-[#c65a24]" />
                                            <span className="text-xs font-bold text-[#222222] truncate">
                                                {msg.vendorName}
                                            </span>
                                        </div>
                                        <span className="text-[10px] bg-[#f4c7a1]/60 text-[#66351f] font-semibold px-2 py-0.5 rounded-full">
                                            Direct Assistant
                                        </span>
                                    </div>
                                    <p className="text-[11.5px] text-[#66351f]/90 leading-relaxed">
                                        You are now chatting directly with this brand. You can ask about products, check prices, or place an order right here!
                                    </p>
                                    <div className="flex items-center gap-2 pt-1 border-t border-[#f4c7a1]/30">
                                        {msg.vendorSlug && (
                                            <a
                                                href={`/${msg.vendorSlug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-[#c65a24] hover:bg-[#b04d1c] text-white text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                                            >
                                                <span>Visit Storefront</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleSwitchBackToMaster}
                                            className="text-[11px] font-semibold text-[#66351f] hover:text-[#222222] bg-[#fff4e6] hover:bg-[#f4c7a1]/40 py-1.5 px-2.5 rounded-xl border border-[#f4c7a1]/60 transition-colors cursor-pointer"
                                        >
                                            Back to Qriblo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    if (isUser) {
                        return (
                            <div
                                key={i}
                                className="flex justify-end relative group animate-in fade-in slide-in-from-bottom-2 duration-200"
                            >
                                <div className="relative max-w-[85%] sm:max-w-[80%] bg-[#f4c7a1] text-[#222222] rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)]">
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
                            </div>
                        )
                    }

                    const { cleanText, summary } = parseOrderSummary(msg.content)

                    return (
                        <div
                            key={i}
                            className="flex flex-col gap-2.5 justify-start relative group animate-in fade-in slide-in-from-bottom-2 duration-200"
                        >
                            {cleanText && (
                                <div className="relative max-w-[88%] sm:max-w-[82%] bg-white text-[#222222] rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-[0_1px_2px_rgba(34,34,34,0.08)] border border-[#f4c7a1]/30">
                                    <svg className="absolute -left-1.5 top-0 w-2 h-3 text-white fill-current" viewBox="0 0 8 13">
                                        <path d="M1.533 3.568L8 12.18V0H2.812C1.042 0 .474 2.156 1.533 3.568z" />
                                    </svg>
                                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words select-text">
                                        {cleanText}
                                    </p>
                                    <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5">
                                        <span className="text-[10px] text-[#66351f]/60 font-medium select-none">
                                            {msg.timestamp || 'Just now'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* WhatsApp Order Summary Card if vendor closes a sale */}
                            {summary && activeVendor && (
                                <div className="max-w-[92%] sm:max-w-[88%] rounded-2xl bg-white border border-[#f4c7a1]/70 shadow-[0_4px_16px_rgba(102,53,31,0.08)] overflow-hidden space-y-0">
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
            </div>

            {/* Quick Prompt Chips (only shown if not in vendor takeover and messages are few) */}
            {!activeVendor && messages.length <= 2 && (
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

            {/* WhatsApp Input Shelf: Full-width bar, no voice/media/emoji icons, send button only when typing */}
            <div className="p-2.5 bg-[#fff4e6] border-t border-[#f4c7a1]/40 shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    {/* Clean Full-width Input Bar */}
                    <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center shadow-[0_1px_3px_rgba(34,34,34,0.06)] border border-[#f4c7a1]/50 focus-within:border-[#c65a24] focus-within:ring-1 focus-within:ring-[#c65a24]/20 transition-all">
                        <input
                            type="text"
                            placeholder={activeVendor ? `Message ${activeVendor.name}...` : "Type a message..."}
                            className="flex-1 bg-transparent text-base text-[#222222] placeholder:text-[#222222]/45 outline-none min-w-0"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Send Button ONLY appears when typing */}
                    {input.trim().length > 0 && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 bg-[#c65a24] hover:bg-[#b04d1c] active:scale-95 shadow-[0_3px_10px_rgba(198,90,36,0.3)] transition-all duration-150 animate-in fade-in zoom-in-75 cursor-pointer"
                            aria-label="Send message"
                        >
                            <SendHorizontal className="w-4 h-4 ml-0.5" />
                        </button>
                    )}
                </form>
            </div>
        </Card>
    )
}
