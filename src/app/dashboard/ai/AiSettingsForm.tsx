'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { updateAiSettings } from './actions'
import { Bot, Save, Loader2, Lock, Sparkles, Briefcase, MessageSquareText, Play, Send, Zap, CheckCircle2, ArrowRight } from 'lucide-react'
import { User } from '@/lib/types'
import Link from 'next/link'

interface AiSettingsFormProps {
    user: User
}

interface SandboxMessage {
    role: 'user' | 'assistant'
    content: string
}

export function AiSettingsForm({ user }: AiSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const isPro = user.plan === 'pro'
    const usagePercent = Math.min(((user.ai_usage_count || 0) / (user.ai_usage_limit || 100)) * 100, 100)

    // Interactive Sandbox state
    const [sandboxMessages, setSandboxMessages] = useState<SandboxMessage[]>([
        { role: 'assistant', content: user.ai_welcome_msg || "Hello! Check out our catalog below. What can I help you order or book today?" }
    ])
    const [sandboxInput, setSandboxInput] = useState('')
    const [sandboxLoading, setSandboxLoading] = useState(false)
    const sandboxScrollRef = useRef<HTMLDivElement>(null)

    const toast = (msg: string) => alert(msg)

    useEffect(() => {
        if (sandboxScrollRef.current) {
            sandboxScrollRef.current.scrollTop = sandboxScrollRef.current.scrollHeight
        }
    }, [sandboxMessages])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        await updateAiSettings(formData)
        setLoading(false)
        toast('AI Sales Assistant settings updated successfully!')
    }

    // Send test chat to AI endpoint using sandbox
    const handleSandboxSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!sandboxInput.trim() || sandboxLoading) return

        const userMsg = sandboxInput.trim()
        setSandboxInput('')
        setSandboxMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setSandboxLoading(true)

        try {
            // Call AI chat route using user ID
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: user.id,
                    messages: [...sandboxMessages, { role: 'user', content: userMsg }],
                    isSandbox: true
                })
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                if (data.error === 'LIMIT_REACHED') {
                    setSandboxMessages(prev => [...prev, { role: 'assistant', content: 'Monthly chat limit reached. Upgrade to Pro for more chats!' }])
                    return
                }
                throw new Error(data.error || 'Failed to reach AI')
            }

            const data = await res.json()
            setSandboxMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response.' }])
        } catch (err: any) {
            setSandboxMessages(prev => [...prev, { role: 'assistant', content: `[Sandbox Mode] I hear you! To test me with live customer traffic on your business page link, unlock the Pro Engine.` }])
        } finally {
            setSandboxLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Free Tier Promotion Banner */}
            {!isPro && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                            <Sparkles className="w-3.5 h-3.5" /> AI Sales Engine Preview
                        </div>
                        <h2 className="text-2xl font-bold font-display">Test Your 24/7 AI Sales Assistant Below</h2>
                        <p className="text-orange-100 text-sm max-w-xl">
                            Configure your AI speaking style and test-chat with it live. Upgrade to Pro to activate it for product questions, service inquiries, orders, and bookings on your public business link.
                        </p>
                    </div>
                    <Link href="/pricing">
                        <Button className="bg-white text-orange-700 hover:bg-orange-50 font-extrabold h-12 px-6 rounded-xl shadow-lg shrink-0 flex items-center gap-2">
                            Upgrade to Pro (₦2,500/mo)
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* AI Configuration Form */}
            <form onSubmit={handleSubmit}>
                <Card className="shadow-md border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-xl text-orange-950 font-display">
                                    <Bot className="w-6 h-6 text-orange-600" />
                                    AI Sales Assistant Settings
                                </CardTitle>
                                <CardDescription>
                                    Configure your automated receptionist, sales closer, booking assistant, and speaking tone.
                                </CardDescription>
                            </div>
                            {isPro ? (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-sm shrink-0">
                                    <span className="text-xs font-medium text-gray-600">Monthly Usage:</span>
                                    <span className={`text-xs font-bold ${usagePercent >= 100 ? 'text-red-600' : 'text-orange-700'}`}>
                                        {user.ai_usage_count || 0}/{user.ai_usage_limit || 100} chats
                                    </span>
                                </div>
                            ) : (
                                <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-200">
                                    Sandbox / Trial Mode
                                </span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {/* Enable Toggle */}
                        <div className="flex items-center justify-between space-x-2 border border-orange-100 p-4 rounded-xl bg-orange-50/40">
                            <Label htmlFor="ai_enabled" className="flex flex-col space-y-1 cursor-pointer">
                                <span className="font-semibold text-base text-gray-900 flex items-center gap-2">
                                    Enable Assistant on Public Link
                                    {isPro && user.ai_enabled && (
                                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                    )}
                                </span>
                                <span className="font-normal text-sm text-gray-500">
                                    Displays the interactive chat widget on your business page (`naijabiz.org/{user.business_slug || 'yourbrand'}`) to answer questions, close orders, and collect booking details 24/7.
                                </span>
                            </Label>
                            {isPro ? (
                                <Switch
                                    id="ai_enabled"
                                    name="ai_enabled"
                                    defaultChecked={user.ai_enabled}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md">Pro Feature</span>
                                    <Switch id="ai_enabled" disabled defaultChecked={false} />
                                </div>
                            )}
                        </div>

                        {/* Business Type */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold text-gray-800">
                                <Briefcase className="w-4 h-4 text-orange-600" />
                                What do you offer?
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="business_type"
                                        value="products"
                                        defaultChecked={!user.business_type || user.business_type === 'products'}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Physical Products</p>
                                        <p className="text-xs text-gray-500">Wigs, clothes, gadgets, food</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="business_type"
                                        value="services"
                                        defaultChecked={user.business_type === 'services'}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Services & Bookings</p>
                                        <p className="text-xs text-gray-500">Makeup, hair, repair, consulting</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="business_type"
                                        value="both"
                                        defaultChecked={user.business_type === 'both'}
                                        className="text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Both Products & Services</p>
                                        <p className="text-xs text-gray-500">Combined catalog</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* AI Persona Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold text-gray-800">
                                <Sparkles className="w-4 h-4 text-orange-600" />
                                AI Assistant Speaking Style (Tone)
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="friendly"
                                        defaultChecked={!user.ai_persona || user.ai_persona === 'friendly'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Warm & Friendly 🇳🇬</p>
                                        <p className="text-xs text-gray-500">Polite Nigerian English with sales energy.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="pidgin"
                                        defaultChecked={user.ai_persona === 'pidgin'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Pidgin Street-Sharp ⚡</p>
                                        <p className="text-xs text-gray-500">Authentic Pidgin ("How far!", "We get am for stock!").</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="formal"
                                        defaultChecked={user.ai_persona === 'formal'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Formal Executive 💼</p>
                                        <p className="text-xs text-gray-500">Strict corporate English, structured and direct.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="space-y-2">
                            <Label htmlFor="ai_welcome_msg" className="flex items-center gap-2 font-semibold">
                                <MessageSquareText className="w-4 h-4 text-orange-600" /> Greeting Message
                            </Label>
                            <Input
                                id="ai_welcome_msg"
                                name="ai_welcome_msg"
                                defaultValue={user.ai_welcome_msg || "Hello! Check out our catalog below. What can I help you order or book today?"}
                                placeholder="e.g. Welcome! How can I help you today?"
                            />
                            <p className="text-xs text-gray-500">The first greeting shown when a buyer opens the chat widget.</p>
                        </div>

                        {/* Business Instructions */}
                        <div className="space-y-2">
                            <Label htmlFor="ai_instructions" className="font-semibold">Business Knowledge Base & Special Instructions</Label>
                            <Textarea
                                id="ai_instructions"
                                name="ai_instructions"
                                defaultValue={user.ai_instructions || ""}
                                placeholder="e.g. We operate Mon-Sat 9am-6pm in Ikeja, Lagos. Delivery costs ₦2,500 in Lagos and ₦4,500 interstate. Payment is required before dispatch."
                                className="min-h-[140px]"
                            />
                            <p className="text-xs text-gray-500">
                                Add your product catalog or service list rules: delivery costs, physical location, booking policies, appointment hours, or discounts. The AI automatically knows your product/service prices.
                            </p>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 font-bold px-8 h-11 shadow-md">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Settings...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Save AI Assistant Settings
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </form>

            {/* Interactive Sandbox Playground */}
            <Card className="border-orange-200 bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500 text-white">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold font-display text-white">
                                    Interactive AI Sales Rep Sandbox
                                </CardTitle>
                                <CardDescription className="text-gray-300 text-xs">
                                    Test how your AI rep handles buyer questions in real-time.
                                </CardDescription>
                            </div>
                        </div>
                        <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Live Testing
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="h-[360px] overflow-y-auto p-4 space-y-3 bg-gray-50" ref={sandboxScrollRef}>
                        {sandboxMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                    m.role === 'user' 
                                        ? 'bg-orange-600 text-white rounded-br-none' 
                                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {sandboxLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                                    AI is typing...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSandboxSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                        <Input
                            placeholder="Type a test buyer question (e.g. 'How far, do you deliver to Lekki?')..."
                            value={sandboxInput}
                            onChange={e => setSandboxInput(e.target.value)}
                            disabled={sandboxLoading}
                            className="flex-1 bg-gray-50"
                        />
                        <Button type="submit" disabled={!sandboxInput.trim() || sandboxLoading} className="bg-gray-900 hover:bg-black text-white shrink-0">
                            <Send className="w-4 h-4 mr-1" /> Test
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
