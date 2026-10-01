'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { updateAiSettings } from './actions'
import { Bot, Save, Loader2, Briefcase, MessageSquareText, Send, MessageCircle, Copy, CheckCircle2, Circle, Rocket } from 'lucide-react'
import { User } from '@/lib/types'
import Link from 'next/link'
import { BrandThinkingOrb } from '@/components/ui/BrandThinkingOrb'
import RotatingText from '@/components/ui/RotatingText'
import { PRO_MONTHLY_AI_USAGE_LIMIT } from '@/lib/ai/usage'

interface AiSettingsFormProps {
    user: User
    productCount: number
}

interface SandboxMessage {
    role: 'user' | 'assistant'
    content: string
    sentAt?: string
}

interface TestOutcome {
    question: string
    answer: string
}

export function AiSettingsForm({ user, productCount }: AiSettingsFormProps) {
    const [loading, setLoading] = useState(false)
    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const [checkoutError, setCheckoutError] = useState<string | null>(null)
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [waEnabled, setWaEnabled] = useState(Boolean(user.wa_whatsapp_enabled))
    const [successfulTests, setSuccessfulTests] = useState(0)
    const [testOutcomes, setTestOutcomes] = useState<TestOutcome[]>([])
    const [hasSavedKnowledge, setHasSavedKnowledge] = useState(productCount > 0 || Boolean(user.ai_instructions?.trim()))
    const isPro = user.plan === 'pro'
    const limit = isPro ? PRO_MONTHLY_AI_USAGE_LIMIT : 0
    const currentUsagePeriod = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 7)
    const hasFreshUsage = user.ai_last_reset_at
        ? new Date(new Date(user.ai_last_reset_at).getTime() + 60 * 60 * 1000).toISOString().slice(0, 7) === currentUsagePeriod
        : false
    const dailyUsageCount = hasFreshUsage ? user.ai_usage_count || 0 : 0
    const usagePercent = limit === 0 ? 0 : Math.min((dailyUsageCount / limit) * 100, 100)
    const hasPage = Boolean(user.business_name && user.business_slug)
    const hasKnowledge = hasSavedKnowledge
    const hasEnoughTests = successfulTests >= 5
    const readyToGoLive = hasPage && hasKnowledge && hasEnoughTests
    const isLive = isPro && user.ai_enabled

    // Interactive Sandbox state
    const [sandboxMessages, setSandboxMessages] = useState<SandboxMessage[]>([
        { role: 'assistant', content: user.ai_welcome_msg || "Hello! Check out our catalog below. What can I help you order or book today?", sentAt: new Date().toISOString() }
    ])
    const [sandboxInput, setSandboxInput] = useState('')
    const [sandboxLoading, setSandboxLoading] = useState(false)
    const sandboxScrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        try {
            const savedTests = Number(window.localStorage.getItem(`qriblo-va-tests-${user.id}`) || 0)
            if (Number.isFinite(savedTests) && savedTests > 0) setSuccessfulTests(savedTests)
            const savedOutcomes = window.localStorage.getItem(`qriblo-va-outcomes-${user.id}`)
            if (savedOutcomes) setTestOutcomes(JSON.parse(savedOutcomes))
        } catch {
            // Testing progress still works for this visit when browser storage is unavailable.
        }
    }, [user.id])

    const toast = (msg: string) => setSaveStatus({ type: 'success', message: msg })

    useEffect(() => {
        if (sandboxScrollRef.current) {
            sandboxScrollRef.current.scrollTop = sandboxScrollRef.current.scrollHeight
        }
    }, [sandboxMessages])

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setSaveStatus(null)
        const formData = new FormData(event.currentTarget)

        const result = await updateAiSettings(formData)
        setLoading(false)
        if (result?.error) {
            setSaveStatus({ type: 'error', message: result.error })
            return
        }
        setHasSavedKnowledge(productCount > 0 || Boolean(String(formData.get('ai_instructions') || '').trim()))
        toast('Virtual Assistant settings updated successfully!')
    }

    async function handleGoLive() {
        setCheckoutLoading(true)
        setCheckoutError(null)
        try {
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, billing: 'monthly' }),
            })
            const data = await response.json()
            if (!response.ok || !data.url) throw new Error(data.error || 'Could not start checkout')
            window.location.assign(data.url)
        } catch (error) {
            setCheckoutError(error instanceof Error ? error.message : 'Could not start checkout')
            setCheckoutLoading(false)
        }
    }

    function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
        const target = event.target as HTMLElement
        if (event.key === 'Enter' && target instanceof HTMLInputElement && ['text', 'search', 'tel', 'url', 'email', 'number'].includes(target.type)) {
            event.preventDefault()
        }
    }

    // Send a test chat to the assistant endpoint using sandbox
    const handleSandboxSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!sandboxInput.trim() || sandboxLoading) return

        const userMsg = sandboxInput.trim()
        setSandboxInput('')
        const userMessage = { role: 'user' as const, content: userMsg, sentAt: new Date().toISOString() }
        setSandboxMessages(prev => [...prev, userMessage])
        setSandboxLoading(true)

        try {
            // Call the assistant chat route using user ID
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: user.id,
                    messages: [...sandboxMessages, userMessage],
                    isSandbox: true
                })
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                if (data.error === 'LIMIT_REACHED') {
                    setSandboxMessages(prev => [...prev, { role: 'assistant', content: "The virtual assistant has reached its monthly message limit. Please try again next month.", sentAt: new Date().toISOString() }])
                    return
                }
                throw new Error(data.error || 'Could not reach the virtual assistant')
            }

            const data = await res.json()
            const answer = data.reply || 'No response.'
            setSandboxMessages(prev => [...prev, { role: 'assistant', content: answer, sentAt: new Date().toISOString() }])
            const nextSuccessfulTest = successfulTests + 1
            try {
                window.localStorage.setItem(`qriblo-va-tests-${user.id}`, String(nextSuccessfulTest))
            } catch {
                // Keep the current page's progress even when browser storage is unavailable.
            }
            const outcome = { question: userMsg, answer }
            const nextOutcomes = [...testOutcomes, outcome].slice(-10)
            try {
                window.localStorage.setItem(`qriblo-va-outcomes-${user.id}`, JSON.stringify(nextOutcomes))
            } catch {
                // Keep the current page's answer examples even when browser storage is unavailable.
            }
            setTestOutcomes(nextOutcomes)
            setSuccessfulTests(nextSuccessfulTest)
        } catch (err: any) {
            setSandboxMessages(prev => [...prev, { role: 'assistant', content: `I hear you. Add your catalog, booking rules, delivery details, and payment notes above so I can answer customers more clearly.`, sentAt: new Date().toISOString() }])
        } finally {
            setSandboxLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card id="va-launch" className={`border shadow-sm ${isLive ? 'border-green-200 bg-green-50/60' : readyToGoLive ? 'border-orange-300 bg-orange-50/60' : 'border-orange-100 bg-white'}`}>
                <CardContent className="p-5 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-orange-700">Your VA launch path</p>
                            <h2 className="mt-1 text-lg font-bold text-gray-900">{isLive ? 'Your VA is live for customers.' : readyToGoLive ? 'Your VA is ready. It’s currently offline to customers.' : 'Build it. Train it. Test it.'}</h2>
                            <p className="mt-1 text-sm text-gray-600">Add the details it needs, then rehearse 5–10 questions customers really ask.</p>
                        </div>
                        {!isLive && <span className="w-fit shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">Offline to customers</span>}
                        {isLive && <span className="w-fit shrink-0 rounded-full border border-green-200 bg-white px-3 py-1 text-xs font-semibold text-green-700">Live</span>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            { title: 'Build your brand page', detail: hasPage ? 'Your brand page is in place.' : 'Add your brand name and page details.', done: hasPage },
                            { title: 'Train your VA', detail: hasKnowledge ? productCount > 0 ? `Your catalog and saved notes inform its answers.` : 'Your saved notes inform its answers.' : 'Add products or services, prices, and useful notes.', done: hasKnowledge },
                            { title: 'Test real questions', detail: `${Math.min(successfulTests, 5)} of 5 questions tested. Try 5–10.`, done: hasEnoughTests },
                        ].map(step => (
                            <div key={step.title} className="flex gap-2.5 rounded-xl border border-gray-200 bg-white p-3">
                                {step.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />}
                                <div><p className="text-sm font-semibold text-gray-900">{step.title}</p><p className="mt-1 text-xs leading-relaxed text-gray-500">{step.detail}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
                        <Link href="/dashboard/settings" className="text-orange-700 hover:text-orange-800 hover:underline">Edit brand page</Link>
                        <Link href="/dashboard/products" className="text-orange-700 hover:text-orange-800 hover:underline">Add products or services</Link>
                        <a href="#va-training" className="text-orange-700 hover:text-orange-800 hover:underline">Train your VA</a>
                    </div>
                    {!isLive && !isPro && readyToGoLive && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-orange-200 pt-4">
                            <p className="text-sm text-gray-700">Put your VA in front of customers on your brand page. WhatsApp routing can be switched on after activation.</p>
                            <Button onClick={handleGoLive} disabled={checkoutLoading} className="h-11 bg-orange-600 px-5 font-bold text-white hover:bg-orange-700">
                                {checkoutLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting checkout…</> : <><Rocket className="mr-2 h-4 w-4" />Go live for ₦2,500/month</>}
                            </Button>
                        </div>
                    )}
                    {!isLive && isPro && readyToGoLive && <p className="border-t border-orange-200 pt-4 text-sm font-medium text-gray-700">Your VA is ready. Save its settings below to put it in front of customers.</p>}
                    {!isLive && !readyToGoLive && <p className="border-t border-gray-100 pt-3 text-sm font-medium text-gray-700">Finish the steps above to get your VA ready for customers.</p>}
                    {checkoutError && <p className="text-sm font-medium text-red-600" role="alert">{checkoutError}</p>}
                </CardContent>
            </Card>

            {/* Virtual Assistant Configuration Form */}
            <form id="va-training" onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} onChange={() => setSaveStatus(null)}>
                <Card className="shadow-md border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-xl text-orange-950 font-display">
                                    <Bot className="w-6 h-6 text-orange-600" />
                                    Virtual Assistant Settings
                                </CardTitle>
                                <CardDescription>
                                    Set what your assistant should know, how it should speak, and how customers can pay or book.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-orange-200 shadow-sm shrink-0">
                                <span className="text-xs font-medium text-gray-600">{isPro ? 'Customer replies this month:' : 'Private test chats'}</span>
                                <span className={`text-xs font-bold ${usagePercent >= 100 ? 'text-red-600' : 'text-orange-700'}`}>
                                    {isPro ? `${dailyUsageCount}/${limit}` : 'No monthly limit'}
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-6">
                        {/* Hidden input to ensure ai_enabled is always treated as true when submitting form */}
                        <input type="hidden" name="ai_enabled" value="on" />

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
                                        <p className="font-semibold text-sm text-gray-900">Sell goods</p>
                                        <p className="text-xs text-gray-500">Food, fashion, beauty items, gadgets</p>
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
                                        <p className="font-semibold text-sm text-gray-900">Offer services</p>
                                        <p className="text-xs text-gray-500">Hair, makeup, repairs, consulting</p>
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
                                        <p className="font-semibold text-sm text-gray-900">Both</p>
                                        <p className="text-xs text-gray-500">Sell items and take bookings</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Assistant Style Selection */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold text-gray-800">
                                <MessageSquareText className="w-4 h-4 text-orange-600" />
                                Speaking style
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
                                        <p className="font-semibold text-sm text-gray-900">Warm & Friendly</p>
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
                                        <p className="font-semibold text-sm text-gray-900">Pidgin Street-Sharp</p>
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
                                        <p className="font-semibold text-sm text-gray-900">Formal Executive</p>
                                        <p className="text-xs text-gray-500">Strict corporate English, structured and direct.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="yoruba"
                                        defaultChecked={user.ai_persona === 'yoruba'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Yoruba 🟠</p>
                                        <p className="text-xs text-gray-500">Fluent Yoruba with local expressions.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="igbo"
                                        defaultChecked={user.ai_persona === 'igbo'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Igbo 🔴</p>
                                        <p className="text-xs text-gray-500">Fluent Igbo suitable for business.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:border-orange-500 transition-colors bg-white">
                                    <input
                                        type="radio"
                                        name="ai_persona"
                                        value="hausa"
                                        defaultChecked={user.ai_persona === 'hausa'}
                                        className="mt-1 text-orange-600 focus:ring-orange-500"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">Hausa 🟢</p>
                                        <p className="text-xs text-gray-500">Fluent Hausa for commerce.</p>
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
                            <Label htmlFor="ai_instructions" className="font-semibold">Brand notes and instructions</Label>
                            <Textarea
                                id="ai_instructions"
                                name="ai_instructions"
                                defaultValue={user.ai_instructions || ""}
                                placeholder="e.g. We operate Mon-Sat 9am-6pm in Ikeja, Lagos. Delivery costs ₦2,500 in Lagos and ₦4,500 interstate. Payment is required before dispatch."
                                className="min-h-[140px]"
                            />
                            <p className="text-xs text-gray-500">
                                Add delivery costs, address, booking policies, appointment hours, discounts, and any rules customers should know.
                            </p>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <Label className="flex items-center gap-2 font-bold text-gray-800 mb-2">
                                    <Briefcase className="w-4 h-4 text-orange-600" />
                                    Payment Details
                                </Label>
                                <p className="text-xs text-gray-500 mb-3">Provide your bank account details. The virtual assistant can share these payment details after a customer confirms an order request.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank Name</Label>
                                    <Input
                                        id="bank_name"
                                        name="bank_name"
                                        defaultValue={user.bank_name || ""}
                                        placeholder="e.g. GTBank"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">Account Number</Label>
                                    <Input
                                        id="account_number"
                                        name="account_number"
                                        defaultValue={user.account_number || ""}
                                        placeholder="e.g. 0123456789"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Assistant Routing (Central Model) */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-green-100 p-4 rounded-xl bg-green-50/40 gap-4">
                                <Label htmlFor="wa_whatsapp_enabled" className="flex flex-col space-y-1 cursor-pointer">
                                    <span className="font-semibold text-base text-gray-900 flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-green-600" />
                                        Enable Virtual Assistant on WhatsApp
                                        {isPro && waEnabled && (
                                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                                        )}
                                    </span>
                                    <span className="font-normal text-sm text-gray-500 max-w-xl">
                                        Customers can message Qriblo on WhatsApp and ask to connect with your brand. Share your Qriblo WhatsApp link on Instagram or in your bio.
                                    </span>
                                </Label>
                                {isPro ? (
                                    <Switch
                                        id="wa_whatsapp_enabled"
                                        name="wa_whatsapp_enabled"
                                        checked={waEnabled}
                                        onChange={(event) => setWaEnabled(event.target.checked)}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-md shrink-0">Available when your VA goes live</span>
                                        <Switch id="wa_whatsapp_enabled" disabled defaultChecked={false} />
                                    </div>
                                )}
                            </div>

                            {waEnabled && isPro && (
                                <div className="bg-white border border-green-200 p-4 rounded-xl space-y-3 shadow-sm">
                                    <h4 className="font-bold text-green-900 text-sm">Your Custom WhatsApp Link</h4>
                                    <p className="text-xs text-gray-600">
                                        Share this link with your customers. When they click it, it opens WhatsApp with a message that helps route them to your business's virtual assistant.
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        <div className="flex-1 bg-gray-50 p-3 text-sm font-mono border border-gray-200 rounded-lg text-gray-800 truncate">
                                            https://wa.me/2347047207012?text=hi%20{user.business_slug}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="shrink-0 text-green-700 border-green-200 hover:bg-green-50"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://wa.me/2347047207012?text=hi%20${user.business_slug}`)
                                                toast('Link copied!')
                                            }}
                                        >
                                            <Copy className="w-4 h-4 mr-2" /> Copy Link
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 font-bold px-8 h-11 shadow-md">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Settings...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Save Virtual Assistant Settings
                                </>
                            )}
                        </Button>
                        {saveStatus && (
                            <p className={`text-sm font-medium ${saveStatus.type === 'success' ? 'text-green-700' : 'text-red-600'}`} aria-live="polite">
                                {saveStatus.message}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </form>

            {/* Interactive Assistant Playground */}
            <Card id="va-tests" className="border-orange-200 bg-white shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-orange-500 text-white">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-bold font-display text-white">
                                    Interactive Virtual Assistant
                                </CardTitle>
                                <CardDescription className="text-gray-300 text-xs">
                                    Try 5–10 real customer questions. These private tests show what your VA knows before you put it in front of customers.
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 flex-wrap">
                            <RotatingText
                                texts={['answering customers…', 'booking appointments…', 'collecting orders…', 'listening…']}
                                splitBy="words"
                                rotationInterval={2400}
                                mainClassName="text-xs font-bold text-emerald-300"
                            />
                            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                                <BrandThinkingOrb state="searching" size={20} /> {successfulTests} questions tested
                            </span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="h-[360px] overflow-y-auto p-4 space-y-3 bg-gray-50" ref={sandboxScrollRef}>
                        {sandboxMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.role === 'user'
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
                                    <BrandThinkingOrb state="working" size={20} />
                                    Writing a reply...
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSandboxSend} className="p-3 bg-white border-t border-gray-200 flex flex-col sm:flex-row gap-2">
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
