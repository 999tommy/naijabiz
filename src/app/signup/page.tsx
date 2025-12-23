'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Key, Loader2, Store, CheckCircle, ShieldCheck, Sparkles, ImagePlus, X } from 'lucide-react'
import { CategorySelect } from '@/components/CategorySelect'
import type { Category } from '@/lib/types'
import { compressImage } from '@/lib/image-compression'

type SignupStep = 'auth' | 'business'

export default function SignupPage() {
    const [step, setStep] = useState<SignupStep>('auth')
    const [emailOrPhone, setEmailOrPhone] = useState('')
    const [password, setPassword] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [location, setLocation] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [categories, setCategories] = useState<Category[]>([])
    const [description, setDescription] = useState('')
    const [instagramHandle, setInstagramHandle] = useState('')
    const [tiktokHandle, setTiktokHandle] = useState('')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoCompressing, setLogoCompressing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [agreed, setAgreed] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [supabase])

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

    const handlePasswordSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            if (isPhone(emailOrPhone)) {
                // Phone + Password signup
                const formattedPhone = formatPhoneNumber(emailOrPhone)
                const { error } = await supabase.auth.signUp({
                    phone: formattedPhone,
                    password,
                })
                if (error) throw error
            } else {
                // Email + Password signup
                const { error } = await supabase.auth.signUp({
                    email: emailOrPhone,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?signup=true`,
                    },
                })
                if (error) throw error
            }
            setStep('business')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }



    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setLogoCompressing(true)
        try {
            const compressedFile = await compressImage(file)
            setLogoFile(compressedFile)
            setLogoPreview(URL.createObjectURL(compressedFile))
        } catch (err) {
            console.error('Logo compression error:', err)
        } finally {
            setLogoCompressing(false)
        }
    }

    const uploadImage = async (file: File, path: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${path}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('business-images')
            .upload(fileName, file)

        if (uploadError) return null

        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(fileName)

        return publicUrl
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

            let logoUrl = null
            if (logoFile) {
                logoUrl = await uploadImage(logoFile, `${user.id}/logo`)
            }

            const { error: insertError } = await supabase.from('users').insert({
                id: user.id,
                email: user.email || null,
                phone: user.phone || null,
                business_name: businessName,
                business_slug: finalSlug,
                whatsapp_number: formattedWhatsApp,
                description,
                instagram_handle: instagramHandle.replace('@', ''),
                tiktok_handle: tiktokHandle.replace('@', ''),
                logo_url: logoUrl,
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
                    <div className={`flex items-center gap-2 ${step === 'auth' ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'auth' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>1</div>
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
                                    Secure Sign Up
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-500">
                            {step === 'auth' && 'Create your account with email and password.'}
                            {step === 'business' && 'This information will appear on your public page.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {step === 'auth' && (
                            <form onSubmit={handlePasswordSignup} className="space-y-5">
                                <div className="space-y-2">
                                    <label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <Input
                                        id="emailOrPhone"
                                        type="text"
                                        placeholder="you@business.com"
                                        value={emailOrPhone}
                                        onChange={(e) => setEmailOrPhone(e.target.value)}
                                        className="h-11"
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
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11"
                                        minLength={6}
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                                        <span className="block w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                        {error}
                                    </div>
                                )}

                                <div className="flex items-start gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="agree-password"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer"
                                        required
                                    />
                                    <label htmlFor="agree-password" className="text-sm text-gray-600 cursor-pointer text-left">
                                        I agree to the <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>
                                    </label>
                                </div>

                                <Button type="submit" className="w-full h-12 text-base bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100" disabled={loading || !agreed}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 'business' && (
                            <form onSubmit={handleCreateBusiness} className="space-y-5">
                                {/* Logo Upload */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        {logoCompressing ? (
                                            <div className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                                                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                            </div>
                                        ) : logoPreview ? (
                                            <div className="relative group">
                                                <Image
                                                    src={logoPreview}
                                                    alt="Logo"
                                                    width={96}
                                                    height={96}
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-orange-100 shadow-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLogoFile(null)
                                                        setLogoPreview(null)
                                                    }}
                                                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all text-gray-400 hover:text-orange-500">
                                                <ImagePlus className="w-6 h-6 mb-1" />
                                                <span className="text-[10px] uppercase font-bold tracking-wider">Logo</span>
                                                <span className="text-[9px] text-gray-400 mt-0.5 font-normal">(Optional)</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                </div>

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
                                    <label htmlFor="description" className="text-sm font-medium text-gray-700 flex justify-between">
                                        <span>Short Description</span>
                                        <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        placeholder="Briefly describe what you sell..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
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
                                        <CategorySelect
                                            value={categoryId}
                                            onChange={setCategoryId}
                                            categories={categories}
                                            placeholder="Select..."
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="instagram" className="text-sm font-medium text-gray-700 flex justify-between">
                                            <span>Instagram</span>
                                            <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                        </label>
                                        <Input
                                            id="instagram"
                                            type="text"
                                            placeholder="@yourbusiness"
                                            value={instagramHandle}
                                            onChange={(e) => setInstagramHandle(e.target.value)}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="tiktok" className="text-sm font-medium text-gray-700 flex justify-between">
                                            <span>TikTok</span>
                                            <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                                        </label>
                                        <Input
                                            id="tiktok"
                                            type="text"
                                            placeholder="@yourbusiness"
                                            value={tiktokHandle}
                                            onChange={(e) => setTiktokHandle(e.target.value)}
                                            className="h-11"
                                        />
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
