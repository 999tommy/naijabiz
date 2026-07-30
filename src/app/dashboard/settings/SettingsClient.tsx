'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import type { User, Category } from '@/lib/types'
import {
    Loader2,
    ImagePlus,
    X,
    CheckCircle2,
    Clock,
    AlertCircle,
    Crown,
    Shield,
    Upload
} from 'lucide-react'
import { CategorySelect } from '@/components/CategorySelect'
import { compressImage } from '@/lib/image-compression'

type BillingCycle = 'monthly' | 'quarterly' | 'biannual' | 'yearly'

const billingOptions: Array<{
    cycle: BillingCycle
    label: string
    price: string
    period: string
    badge?: string
}> = [
    { cycle: 'monthly', label: 'Monthly', price: '₦2,500', period: '/mo' },
    { cycle: 'quarterly', label: 'Quarterly', price: '₦6,975', period: '/3 mos', badge: 'SAVE 7%' },
    { cycle: 'biannual', label: 'Biannual', price: '₦13,500', period: '/6 mos', badge: 'SAVE 10%' },
    { cycle: 'yearly', label: 'Yearly', price: '₦20,000', period: '/yr', badge: 'SAVE 33%' },
]

interface SettingsClientProps {
    user: User
    initialCategories: Category[]
}

export default function SettingsClient({ user: initialUser, initialCategories }: SettingsClientProps) {
    const [user, setUser] = useState(initialUser)
    const [categories] = useState(initialCategories)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(user.logo_url)
    const [verificationFile, setVerificationFile] = useState<File | null>(null)
    const [verificationUploading, setVerificationUploading] = useState(false)
    const [logoCompressing, setLogoCompressing] = useState(false)
    const [upgradeBillingCycle, setUpgradeBillingCycle] = useState<BillingCycle>('monthly')

    // Form fields
    const [businessName, setBusinessName] = useState(user.business_name || '')
    const [description, setDescription] = useState(user.description || '')
    const [whatsappNumber, setWhatsappNumber] = useState(user.whatsapp_number || '')
    const [instagramHandle, setInstagramHandle] = useState(user.instagram_handle || '')
    const [tiktokHandle, setTiktokHandle] = useState(user.tiktok_handle || '')
    const [businessType, setBusinessType] = useState<'products' | 'services' | 'both'>(user.business_type || 'products')
    const [location, setLocation] = useState(user.location || '')
    const [categoryId, setCategoryId] = useState(user.category_id || '')

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const isPro = user.plan === 'pro'

    const fetchUser = useCallback(async () => {
        const { data } = await supabase
            .from('users')
            .select('*, category:categories(*)')
            .eq('id', user.id)
            .single()

        if (data) setUser(data)
    }, [supabase, user.id])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    useEffect(() => {
        if (searchParams.get('upgraded') !== 'true') return

        let cancelled = false
        const startedAt = Date.now()

        setMessage({ type: 'success', text: 'Payment received. Activating Pro...' })

        const interval = window.setInterval(async () => {
            if (cancelled) return

            const { data, error } = await supabase
                .from('users')
                .select('plan')
                .eq('id', user.id)
                .single()

            if (!error && data?.plan === 'pro') {
                window.clearInterval(interval)
                if (!cancelled) {
                    await fetchUser()
                    setMessage({ type: 'success', text: 'Upgrade successful! You are now on Pro.' })
                    router.replace('/dashboard/settings#upgrade')
                    router.refresh()
                }
                return
            }

            if (Date.now() - startedAt > 20000) {
                window.clearInterval(interval)
                if (!cancelled) {
                    setMessage({ type: 'error', text: 'Payment received but upgrade is still pending. Please refresh in a minute.' })
                }
            }
        }, 2000)

        return () => {
            cancelled = true
            window.clearInterval(interval)
        }
    }, [fetchUser, router, searchParams, supabase, user.id])

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setMessage({ type: '', text: '' })
        setLogoCompressing(true)

        try {
            const compressedFile = await compressImage(file)
            setLogoFile(compressedFile)
            setLogoPreview(URL.createObjectURL(compressedFile))
        } catch (err) {
            console.error('Logo compression error:', err)
            setMessage({ type: 'error', text: 'Failed to process logo. Please try another one.' })
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

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return null
        }

        const { data: { publicUrl } } = supabase.storage
            .from('business-images')
            .getPublicUrl(fileName)

        return publicUrl
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage({ type: '', text: '' })

        try {
            let logoUrl = user.logo_url

            if (logoFile) {
                const uploadedUrl = await uploadImage(logoFile, `${user.id}/logo`)
                if (uploadedUrl) {
                    logoUrl = uploadedUrl
                }
            }

            // Format WhatsApp number
            let formattedWhatsApp = whatsappNumber.replace(/\D/g, '')
            if (formattedWhatsApp.startsWith('0')) {
                formattedWhatsApp = '234' + formattedWhatsApp.slice(1)
            }

            // Generate slug if business name changed
            let slug = user.business_slug
            if (businessName !== user.business_name) {
                slug = businessName
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
                    .neq('id', user.id)
                    .single()

                if (existing) {
                    slug = `${slug}-${Date.now().toString(36)}`
                }
            }

            const { error } = await supabase
                .from('users')
                .update({
                    business_name: businessName,
                    business_slug: slug,
                    business_type: businessType,
                    description,
                    whatsapp_number: formattedWhatsApp,
                    instagram_handle: instagramHandle.replace('@', ''),
                    tiktok_handle: tiktokHandle.replace('@', ''),
                    location,
                    category_id: categoryId || null,
                    logo_url: logoUrl,
                })
                .eq('id', user.id)

            if (error) throw error

            await fetchUser()
            setLogoFile(null)
            setLogoPreview(logoUrl)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            router.refresh()
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    const handleVerificationUpload = async () => {
        if (!verificationFile) return

        setVerificationUploading(true)

        try {
            const uploadedUrl = await uploadImage(verificationFile, `${user.id}/verification`)

            if (!uploadedUrl) throw new Error('Failed to upload document')

            // Auto-approve verification upon document upload
            const { error } = await supabase
                .from('users')
                .update({
                    verification_document_url: uploadedUrl,
                    verification_status: 'approved',
                    is_verified: true,
                })
                .eq('id', user.id)

            if (error) throw error

            await fetchUser()
            setVerificationFile(null)
            setMessage({ type: 'success', text: 'You are now verified! Your green tick is active.' })
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to upload document'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setVerificationUploading(false)
        }
    }

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    billing: upgradeBillingCycle
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start upgrade'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    const handleOneTimePayment = async (cycle: BillingCycle) => {
        setLoading(true)
        try {
            const response = await fetch('/api/paystack/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    billing: cycle,
                    type: 'onetime'
                }),
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error(data.error || 'Failed to create checkout')
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start payment'
            setMessage({ type: 'error', text: errorMessage })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your business profile and subscription</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                    {message.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    )}
                    <p>{message.text}</p>
                </div>
            )}

            {/* Business Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>Update your business information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        {/* Logo */}
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                {logoCompressing ? (
                                    <div className="w-20 h-20 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                    </div>
                                ) : logoPreview ? (
                                    <div className="relative">
                                        <Image
                                            src={logoPreview}
                                            alt="Logo"
                                            width={80}
                                            height={80}
                                            className="rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLogoFile(null)
                                                setLogoPreview(null)
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors">
                                        <ImagePlus className="w-6 h-6 text-gray-400" />
                                        <span className="text-xs text-gray-400 mt-1">Logo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            <div className="text-sm text-gray-500">
                                <p className="font-medium text-gray-700">Business Logo</p>

                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Name</label>
                                <Input
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Your business name"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Category</label>
                                <CategorySelect
                                    value={categoryId}
                                    onChange={setCategoryId}
                                    categories={categories}
                                    placeholder="Select category"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Business Type</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg max-w-xl">
                                <button
                                    type="button"
                                    onClick={() => setBusinessType('products')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${businessType === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Products
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBusinessType('services')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${businessType === 'services' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Services
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBusinessType('both')}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${businessType === 'both' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Both
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell customers about your business..."
                                rows={3}
                                className="flex w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                                <Input
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    placeholder="08012345678"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Instagram Handle</label>
                                <Input
                                    value={instagramHandle}
                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                    placeholder="@yourbusiness"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">TikTok Handle</label>
                            <Input
                                value={tiktokHandle}
                                onChange={(e) => setTiktokHandle(e.target.value)}
                                placeholder="@yourbusiness"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Location</label>
                            <Input
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g. Lekki, Lagos"
                            />
                        </div>

                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Subscription */}
            <Card id="upgrade" className={isPro ? 'border-green-200' : 'border-orange-200'}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {isPro ? (
                                    <>
                                        <Crown className="w-5 h-5 text-orange-500" />
                                        Pro Plan
                                    </>
                                ) : (
                                    'Free Plan'
                                )}
                            </CardTitle>
                            <CardDescription>
                                {isPro ? 'You have access to all features' : 'Upgrade to unlock more features'}
                            </CardDescription>
                        </div>
                        {isPro ? (
                            <Badge variant="pro">Active</Badge>
                        ) : (
                            <Badge variant="outline">Free</Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isPro ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Your subscription is active</span>
                            </div>
                            {user.subscription_ends_at && (
                                <p className="text-sm text-gray-500">
                                    Next billing date: {new Date(user.subscription_ends_at).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Free Plan includes:</h4>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Basic business page</li>
                                        <li>• Up to 5 products or services</li>
                                        <li>• WhatsApp order and booking links</li>
                                        <li>• Listed in directory</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-orange-600">Pro Plan includes:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Green verified badge
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Unlimited products and services
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Customer reviews
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Increased Customer Reach
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            High Leaderboard Ranking
                                        </li>
                                        <li className="flex items-center gap-1 font-bold text-orange-700">
                                            <CheckCircle2 className="w-4 h-4 text-orange-600" />
                                            AI Assistant for orders and bookings (100 replies/mo)
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
                                <div>
                                    <h4 className="font-bold text-gray-900">Select your billing cycle</h4>
                                    <p className="text-sm text-gray-500">Choose how you want to pay</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                    {billingOptions.map(option => (
                                        <button
                                            key={option.cycle}
                                            type="button"
                                            onClick={() => setUpgradeBillingCycle(option.cycle)}
                                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${upgradeBillingCycle === option.cycle
                                                ? 'border-orange-500 bg-white shadow-md'
                                                : 'border-gray-100 bg-white/50 hover:border-orange-200'
                                                }`}
                                        >
                                            {option.badge && (
                                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                                    {option.badge}
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-gray-500">{option.label}</div>
                                            <div className="text-xl font-bold text-gray-900 mt-1">{option.price}<span className="text-xs font-normal">{option.period}</span></div>
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleUpgrade}
                                    disabled={loading}
                                    size="lg"
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 shadow-lg shadow-orange-100"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Redirecting to payment...
                                        </>
                                    ) : (
                                        <>
                                            <Crown className="w-4 h-4 mr-2" />
                                            Upgrade {billingOptions.find(option => option.cycle === upgradeBillingCycle)?.label} - {billingOptions.find(option => option.cycle === upgradeBillingCycle)?.price}
                                        </>
                                    )}
                                </Button>

                                {/* One-Time Payment Option */}
                                <div className="text-center pt-4 border-t border-orange-100">
                                    <p className="text-sm text-gray-500 mb-3">Don't have a card? Use Bank Transfer or USSD</p>
                                    <div className="flex gap-3 justify-center flex-wrap">
                                        {billingOptions.map(option => (
                                            <Button
                                                key={option.cycle}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOneTimePayment(option.cycle)}
                                                disabled={loading}
                                                className="text-gray-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                                            >
                                                Pay {option.price} ({option.label})
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>


        </div >
    )
}
