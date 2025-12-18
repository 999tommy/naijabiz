'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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

    // Form fields
    const [businessName, setBusinessName] = useState(user.business_name || '')
    const [description, setDescription] = useState(user.description || '')
    const [whatsappNumber, setWhatsappNumber] = useState(user.whatsapp_number || '')
    const [instagramHandle, setInstagramHandle] = useState(user.instagram_handle || '')
    const [location, setLocation] = useState(user.location || '')
    const [categoryId, setCategoryId] = useState(user.category_id || '')

    const router = useRouter()
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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 200 * 1024) {
            setMessage({ type: 'error', text: 'Logo must be under 200KB. Use TinyPNG to compress.' })
            return
        }

        setLogoFile(file)
        setLogoPreview(URL.createObjectURL(file))
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
                    description,
                    whatsapp_number: formattedWhatsApp,
                    instagram_handle: instagramHandle.replace('@', ''),
                    location,
                    category_id: categoryId || null,
                    logo_url: logoUrl,
                })
                .eq('id', user.id)

            if (error) throw error

            await fetchUser()
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

            const { error } = await supabase
                .from('users')
                .update({
                    verification_document_url: uploadedUrl,
                    verification_status: 'pending',
                })
                .eq('id', user.id)

            if (error) throw error

            await fetchUser()
            setVerificationFile(null)
            setMessage({ type: 'success', text: 'Verification document submitted! We will review it shortly.' })
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
            const response = await fetch('/api/payment/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
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
                                {logoPreview ? (
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
                                <p>Max 200KB. Square image recommended.</p>
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
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="flex h-11 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
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
                        <div className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Free Plan includes:</h4>
                                    <ul className="text-sm text-gray-500 space-y-1">
                                        <li>• Basic business page</li>
                                        <li>• Up to 3 products</li>
                                        <li>• WhatsApp order links</li>
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
                                            Unlimited products
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Customer reviews
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Featured in search
                                        </li>
                                        <li className="flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            Page view analytics
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <Button onClick={handleUpgrade} disabled={loading} className="w-full sm:w-auto">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Crown className="w-4 h-4 mr-2" />
                                        Upgrade to Pro - ₦1,400/mo
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Verification */}
            {isPro && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            Identity Verification
                        </CardTitle>
                        <CardDescription>
                            Get the green verified badge by verifying your identity
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.is_verified ? (
                            <div className="flex items-center gap-3">
                                <VerifiedBadge />
                                <span className="text-green-700">Your business is verified!</span>
                            </div>
                        ) : user.verification_status === 'pending' ? (
                            <div className="flex items-center gap-3 text-yellow-700">
                                <Clock className="w-5 h-5" />
                                <span>Your verification is under review. We&apos;ll notify you once approved.</span>
                            </div>
                        ) : user.verification_status === 'rejected' ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>Your verification was rejected. Please upload a clearer document.</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">Upload NIN, CAC, or ID</span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {verificationFile && (
                                        <Button onClick={handleVerificationUpload} disabled={verificationUploading}>
                                            {verificationUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                'Submit'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Upload a valid ID document (NIN slip, CAC certificate, or government ID) to get verified.
                                </p>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                        <span className="text-sm text-gray-600">Upload NIN, CAC, or ID</span>
                                        <input
                                            type="file"
                                            accept="image/*,.pdf"
                                            onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                    </label>
                                    {verificationFile && (
                                        <>
                                            <span className="text-sm text-gray-500">{verificationFile.name}</span>
                                            <Button onClick={handleVerificationUpload} disabled={verificationUploading}>
                                                {verificationUploading ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    'Submit for Review'
                                                )}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
