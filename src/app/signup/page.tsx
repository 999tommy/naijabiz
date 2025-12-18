'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, ArrowLeft, Loader2, Store, CheckCircle, ShieldCheck } from 'lucide-react'
import type { Category } from '@/lib/types'

type AuthMethod = 'email' | 'phone'
type SignupStep = 'auth' | 'otp' | 'business'

export default function SignupPage() {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
    const [step, setStep] = useState<SignupStep>('auth')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [location, setLocation] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [supabase])

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            if (authMethod === 'email') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?signup=true`,
                    },
                })
                if (error) throw error
                setMessage('Check your email for the magic link! It might be in spam.')
                setStep('otp')
            } else {
                let formattedPhone = phone.replace(/\D/g, '')
                if (formattedPhone.startsWith('0')) {
                    formattedPhone = '234' + formattedPhone.slice(1)
                }
                if (!formattedPhone.startsWith('+')) {
                    formattedPhone = '+' + formattedPhone
                }

                const { error } = await supabase.auth.signInWithOtp({
                    phone: formattedPhone,
                })
                if (error) throw error
                setMessage('OTP sent! It may take up to a minute.')
                setStep('otp')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let formattedPhone = phone.replace(/\D/g, '')
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '234' + formattedPhone.slice(1)
            }
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+' + formattedPhone
            }

            const { error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'sms',
            })

            if (error) throw error
            setStep('business')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid OTP'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateBusiness = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Generate slug from business name
            const slug = businessName
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')

            // Check if slug exists
            const { data: existing } = await supabase
                .from('users')
                .select('business_slug')
                .eq('business_slug', slug)
                .single()

            const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug

            // Format WhatsApp number
            let formattedWhatsApp = whatsappNumber.replace(/\D/g, '')
            if (formattedWhatsApp.startsWith('0')) {
                formattedWhatsApp = '234' + formattedWhatsApp.slice(1)
            }

            const { error: insertError } = await supabase.from('users').insert({
                id: user.id,
                email: user.email || null,
                phone: user.phone || null,
                business_name: businessName,
                business_slug: finalSlug,
                whatsapp_number: formattedWhatsApp,
                location,
                category_id: categoryId || null,
                plan: 'free',
                is_verified: false,
                verification_status: 'none',
            })

            if (insertError) throw insertError

            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create business'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cream-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.png"
                            alt="NaijaBiz"
                            width={48}
                            height={48}
                            className="mx-auto mb-4"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create Your Verified Page</h1>
                    <p className="text-gray-600 mt-2 text-lg">Join 500+ Nigerian businesses selling with trust.</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8 gap-2">
                    <div className={`flex items-center gap-2 ${step === 'auth' || step === 'otp' ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'auth' || step === 'otp' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>1</div>
                        <span className="text-sm">Account</span>
                    </div>
                    <div className={`w-12 h-0.5 ${step === 'business' ? 'bg-orange-600' : 'bg-gray-200'}`}></div>
                    <div className={`flex items-center gap-2 ${step === 'business' ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'business' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>2</div>
                        <span className="text-sm">Business Info</span>
                    </div>
                </div>

                <Card className="shadow-2xl border-0 ring-1 ring-gray-100 overflow-hidden">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-6">
                        <CardTitle className="text-xl flex items-center gap-2">
                            {step === 'business' ? (
                                <>
                                    <Store className="w-5 h-5 text-orange-500" />
                                    Tell us about your business
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-5 h-5 text-green-500" />
                                    {step === 'auth' ? 'Secure Sign Up' : 'Verify Identity'}
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-500">
                            {step === 'auth' && 'Choose a method to secure your account.'}
                            {step === 'otp' && 'We sent a code to check it\'s really you.'}
                            {step === 'business' && 'This information will appear on your public page.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {step === 'auth' && (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <Button
                                        variant={authMethod === 'email' ? 'default' : 'outline'}
                                        className={`h-12 ${authMethod === 'email' ? 'bg-gray-900 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                                        onClick={() => setAuthMethod('email')}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </Button>
                                    <Button
                                        variant={authMethod === 'phone' ? 'default' : 'outline'}
                                        className={`h-12 ${authMethod === 'phone' ? 'bg-gray-900 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                                        onClick={() => setAuthMethod('phone')}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Phone
                                    </Button>
                                </div>

                                <form onSubmit={handleSendOTP} className="space-y-5">
                                    {authMethod === 'email' ? (
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@business.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-11"
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                                Phone Number
                                            </label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="080 1234 5678"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="h-11"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Image src="https://flagcdn.com/w20/ng.png" alt="NG" width={16} height={12} className="rounded-sm opacity-80" />
                                                Please use your Nigerian phone number
                                            </p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                            {error}
                                        </div>
                                    )}

                                    {message && (
                                        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            {message}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending secure code...
                                            </>
                                        ) : (
                                            authMethod === 'email' ? 'Send Magic Link' : 'Send One-Time Password'
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}

                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep('auth')}
                                    className="mb-2 -ml-2 text-gray-500 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Change {authMethod}
                                </Button>

                                <div className="space-y-3">
                                    <label htmlFor="otp" className="text-sm font-medium text-gray-700 block text-center">
                                        Enter the 6-digit code
                                    </label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="text-center text-3xl tracking-[1em] h-16 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 text-center">
                                        Sent to {authMethod === 'email' ? email : phone}
                                    </p>
                                </div>

                                {error && (
                                    <p className="text-sm text-center text-red-600 bg-red-50 p-2 rounded-lg">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700 shadow-md" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Continue'
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 'business' && (
                            <form onSubmit={handleCreateBusiness} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                                        Business Name
                                    </label>
                                    <Input
                                        id="businessName"
                                        type="text"
                                        placeholder="e.g. Tola's Ankara & Fabrics"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                                        WhatsApp Number
                                    </label>
                                    <Input
                                        id="whatsapp"
                                        type="tel"
                                        placeholder="080 1234 5678"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="h-11"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Customers will send orders here.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="location" className="text-sm font-medium text-gray-700">
                                            City / State
                                        </label>
                                        <Input
                                            id="location"
                                            type="text"
                                            placeholder="e.g. Ikeja, Lagos"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="h-11"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="category" className="text-sm font-medium text-gray-700">
                                            Category
                                        </label>
                                        <select
                                            id="category"
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value="">Select...</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full h-12 text-base font-bold bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-100 mt-2" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Launching your page...
                                        </>
                                    ) : (
                                        'Create My Business Page →'
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{' '}
                                <Link href="/login" className="text-orange-600 font-semibold hover:underline">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-gray-400 mt-6 max-w-sm mx-auto leading-relaxed">
                    By clicking continue, you agree to our <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    Your data is secure and encrypted.
                </p>
            </div>
        </div>
    )
}
