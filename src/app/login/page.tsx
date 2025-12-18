'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react'

type AuthMethod = 'email' | 'phone'
type AuthStep = 'input' | 'otp'

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
    const [step, setStep] = useState<AuthStep>('input')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

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
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage('Check your email for the magic link!')
                setStep('otp')
            } else {
                // Format phone number to international format
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
                setMessage('OTP sent to your phone!')
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
            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid OTP'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-cream-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/logo.png"
                            alt="NaijaBiz"
                            width={60}
                            height={60}
                            className="mx-auto mb-4"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-600 mt-1">Sign in to manage your business</p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl">Sign In</CardTitle>
                        <CardDescription>
                            Choose your preferred sign-in method
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 'input' ? (
                            <>
                                <div className="flex gap-2 mb-6">
                                    <Button
                                        variant={authMethod === 'email' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => setAuthMethod('email')}
                                    >
                                        <Mail className="w-4 h-4 mr-2" />
                                        Email
                                    </Button>
                                    <Button
                                        variant={authMethod === 'phone' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => setAuthMethod('phone')}
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Phone
                                    </Button>
                                </div>

                                <form onSubmit={handleSendOTP} className="space-y-4">
                                    {authMethod === 'email' ? (
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
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
                                                placeholder="08012345678"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-500">
                                                Enter your Nigerian phone number
                                            </p>
                                        </div>
                                    )}

                                    {error && (
                                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                            {error}
                                        </p>
                                    )}

                                    {message && (
                                        <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                            {message}
                                        </p>
                                    )}

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            authMethod === 'email' ? 'Send Magic Link' : 'Send OTP'
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep('input')}
                                    className="mb-2 -ml-2"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>

                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-sm font-medium text-gray-700">
                                        Enter OTP
                                    </label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="text-center text-2xl tracking-widest"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 text-center">
                                        Enter the 6-digit code sent to your phone
                                    </p>
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                        {error}
                                    </p>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Sign In'
                                    )}
                                </Button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="text-orange-600 font-medium hover:underline">
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
