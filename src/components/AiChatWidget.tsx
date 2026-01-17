'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bot, X, Send, User, ChevronDown } from 'lucide-react'
import { User as BusinessType } from '@/lib/types'

interface AiChatWidgetProps {
    business: BusinessType
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function AiChatWidget({ business }: AiChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [replyCount, setReplyCount] = useState(0)

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

    // If not enabled or not Pro, don't render anything
    if (business.plan !== 'pro' || !business.ai_enabled) return null

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || loading) return

        if (replyCount >= 10) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I've reached my limit for this chat. Please click the WhatsApp button to message the owner directly! 📲" }])
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
                    messages: [...messages, { role: 'user', content: userMsg }], // Send history
                }),
            })

            if (!response.ok) {
                try {
                    // Try to parse detailed error
                    const errData = await response.json();
                    if (errData.error === 'LIMIT_REACHED') {
                        throw new Error("I'm currently sleeping (Monthly Limit Reached). Please contact the owner directly.");
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

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <Card className="w-[350px] h-[500px] mb-4 shadow-2xl border-orange-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 bg-orange-600 text-white flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{business.business_name} Assistant</h3>
                                <p className="text-xs text-orange-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-orange-700 h-8 w-8" onClick={() => setIsOpen(false)}>
                            <ChevronDown className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                        ? 'bg-orange-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div className="text-xs text-center text-gray-300 mt-4">
                            Powered by NaijaBiz AI
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all"
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={!input.trim() || loading} className="rounded-full bg-orange-600 hover:bg-orange-700 w-10 h-10 shadow-sm shrink-0">
                                <Send className="w-4 h-4 text-white" />
                            </Button>
                        </form>
                    </div>
                </Card>
            )}

            {/* FAB Toggle */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 px-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-200 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                >
                    <div className="relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <span className="font-bold text-base">Chat with us</span>
                </Button>
            )}
        </div>
    )
}
