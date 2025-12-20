'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Key, Loader2, Sparkles, CheckCircle } from 'lucide-react'

type AuthMethod = 'password' | 'magic-link'

export default function LoginPage() {
    const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
    const [emailOrPhone, setEmailOrPhone] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const isPhone = (value: string) => {
        const cleaned = value.replace(/\D/g, '')
        return cleaned.length >= 10 && /^[0-9+]+$/.test(value.replace(/\s/g, ''))
    }

    const formatPhoneNumber = (phone: string): string => {
        let formattedPhone = phone.replace(/\D/g, '')
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '234' + formattedPhone.slice(1)
        }
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone
        }
        return formattedPhone
    }

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            if (isPhone(emailOrPhone)) {
                // Phone + Password login
                const formattedPhone = formatPhoneNumber(emailOrPhone)
                const { error } = await supabase.auth.signInWithPassword({
                    phone: formattedPhone,
                    password,
                })
                if (error) throw error
            } else {
                // Email + Password login
                const { error } = await supabase.auth.signInWithPassword({
                    email: emailOrPhone,
                    password,
                })
                if (error) throw error
            }
            router.push('/dashboard')
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: emailOrPhone,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
                },
            })
            if (error) throw error
            setMessage('Check your email for the magic link!')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
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
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <Button
                                variant={authMethod === 'password' ? 'default' : 'outline'}
                                className={`h-12 ${authMethod === 'password' ? 'bg-gray-900 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                                onClick={() => setAuthMethod('password')}
                            >
                                <Key className="w-4 h-4 mr-2" />
                                Password
                            </Button>
                            <Button
                                variant={authMethod === 'magic-link' ? 'default' : 'outline'}
                                className={`h-12 ${authMethod === 'magic-link' ? 'bg-gray-900 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900'}`}
                                onClick={() => setAuthMethod('magic-link')}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Magic Link
                            </Button>
                        </div>

                        {authMethod === 'password' ? (
                            <form onSubmit={handlePasswordLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <Input
                                        id="emailOrPhone"
                                        type="text"
                                        placeholder="you@example.com or 08012345678"
                                        value={emailOrPhone}
                                        onChange={(e) => setEmailOrPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
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
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={emailOrPhone}
                                        onChange={(e) => setEmailOrPhone(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                        {error}
                                    </p>
                                )}

                                {message && (
                                    <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        {message}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4 mr-2" />
                                            Send Magic Link
                                        </>
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

                <p className="text-center text-xs text-gray-400 mt-6 max-w-sm mx-auto leading-relaxed">
                    By signing in, you agree to our <Link href="/terms" className="underline hover:text-gray-600">Terms</Link> and <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    Your data is secure and encrypted.
                </p>
            </div>
        </div>
    )
}
