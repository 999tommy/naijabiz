import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    MessageCircle,
    Star,
    ArrowLeft,
    Instagram,
    LayoutDashboard,
} from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import { UpvoteButton } from '@/components/UpvoteButton'
import { BusinessShareButton } from '@/components/BusinessShareButton'
import { AiChatWidget } from '@/components/AiChatWidget'
import { checkAndDowngradeUser } from '@/lib/subscription'
import { StorefrontClient } from '@/components/StorefrontClient'
import { getWebsiteTheme } from '@/lib/website-theme'

export const dynamic = 'force-dynamic'

interface StorePageProps {
    params: Promise<{ slug: string }>
}

async function getBusiness(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('users')
        .select('*, category:categories(*)')
        .eq('business_slug', slug)
        .single()

    if (data) {
        const checkedData = await checkAndDowngradeUser(data)
        const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', data.id)
        const { count: viewCount } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('business_id', data.id)
        return { ...checkedData, reviewCount: reviewCount || 0, viewCount: viewCount || 0 }
    }
    return null
}

async function getProducts(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    return data || []
}

async function getReviews(businessId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(10)
    return data || []
}

async function recordPageView(businessId: string) {
    const supabase = await createServiceClient()
    const headersList = await headers()
    const viewerIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown'
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
        .from('page_views').select('id').eq('business_id', businessId).eq('viewer_ip', viewerIp).gt('created_at', twentyFourHoursAgo).limit(1)
    if (!existing || existing.length === 0) {
        await supabase.from('page_views').insert({
            business_id: businessId,
            viewer_ip: viewerIp,
            viewer_user_agent: headersList.get('user-agent') || null,
            referrer: headersList.get('referer') || null,
        })
    }
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
    const { slug } = await params
    const business = await getBusiness(slug)
    if (!business?.business_name) return { title: 'Store Not Found' }

    const title = `${business.business_name} – Store | NaijaBiz`
    const description = `Order from ${business.business_name} on NaijaBiz. View products, prices, and checkout via WhatsApp.`
    const imageUrl = business.logo_url || '/logo.png'

    return {
        title,
        description,
        openGraph: { title, description, type: 'website', images: [{ url: imageUrl, width: 800, height: 800, alt: business.business_name }] },
        twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    }
}

export default async function StorePage({ params }: StorePageProps) {
    const { slug } = await params
    const business = await getBusiness(slug)

    if (!business || !business.business_name) {
        notFound()
    }

    // Store is Pro-only — redirect free users back to their storefront
    if (business.plan !== 'pro') {
        redirect(`/${slug}`)
    }

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isOwner = currentUser?.id === business.id

    const [products, reviews] = await Promise.all([
        getProducts(business.id),
        getReviews(business.id),
    ])

    recordPageView(business.id)

    const isVerified = business.is_verified && business.plan === 'pro'
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null

    // Use the same theme as the website for visual continuity
    const theme = getWebsiteTheme(
        business.category?.slug,
        business.category?.name,
        slug
    )

    return (
        <div className="min-h-screen" style={{ background: theme.pageBg }}>
            {/* Header */}
            <header
                className="sticky top-0 z-50 border-b"
                style={{
                    background: theme.navBg,
                    backdropFilter: 'blur(20px)',
                    borderColor: theme.divider,
                }}
            >
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        href={`/${slug}`}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
                        style={{ color: theme.accent }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to {business.business_name}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <Link href="/dashboard">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 text-sm"
                                    style={{ borderColor: theme.accent, color: theme.accent }}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Button>
                            </Link>
                        )}
                        <BusinessShareButton businessName={business.business_name} />
                    </div>
                </div>
            </header>

            {/* Business info strip */}
            <div className="border-b" style={{ background: theme.cardBg, borderColor: theme.divider }}>
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {business.logo_url ? (
                                <Image
                                    src={business.logo_url}
                                    alt={business.business_name}
                                    width={80}
                                    height={80}
                                    className="rounded-2xl object-cover"
                                    priority
                                    unoptimized={business.logo_url.includes('supabase.co/storage/v1/object/public/')}
                                />
                            ) : (
                                <div
                                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black"
                                    style={{ background: theme.accent }}
                                >
                                    {business.business_name[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-xl font-black" style={{ color: theme.headingText }}>
                                    {business.business_name}
                                </h1>
                                <VerifiedBadge size="sm" isVerified={isVerified} />
                                <UpvoteButton userId={business.id} initialUpvotes={business.upvotes || 0} size="sm" />
                            </div>

                            {business.description && (
                                <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.mutedText }}>
                                    {business.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                {business.category && (
                                    <Badge variant="outline" className="gap-1.5 pl-1.5 text-xs">
                                        {getCategoryIcon(business.category.name)} {business.category.name}
                                    </Badge>
                                )}
                                {business.location && (
                                    <span className="flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                                        <MapPin className="w-3.5 h-3.5" />{business.location}
                                    </span>
                                )}
                                {averageRating && (
                                    <span className="flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        {averageRating} ({reviews.length})
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                                {business.whatsapp_number && (
                                    <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm">
                                            <MessageCircle className="w-4 h-4 mr-1.5" />WhatsApp
                                        </Button>
                                    </a>
                                )}
                                {business.instagram_handle && (
                                    <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cb] hover:opacity-90 text-white border-0 font-semibold shadow-sm">
                                            <Instagram className="w-4 h-4 mr-1.5" />Instagram
                                        </Button>
                                    </a>
                                )}
                                {business.tiktok_handle && (
                                    <a href={`https://tiktok.com/@${business.tiktok_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" className="bg-black hover:bg-gray-800 text-white border-0 font-semibold shadow-sm">
                                            <svg className="w-4 h-4 mr-1.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                            </svg>
                                            TikTok
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products + Reviews via StorefrontClient */}
            <StorefrontClient
                products={products}
                business={business}
                isPro={true}
                reviews={reviews}
                slug={slug}
                averageRating={averageRating}
                whatsappNumber={business.whatsapp_number || ''}
                instagramHandle={business.instagram_handle}
            />

            {/* Footer */}
            <footer className="border-t py-6" style={{ borderColor: theme.divider, background: theme.cardBg }}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm" style={{ color: theme.mutedText }}>
                        Powered by{' '}
                        <Link href="/" className="font-medium hover:underline" style={{ color: theme.accent }}>
                            NaijaBiz
                        </Link>
                        {' '}– The link that proves you are legit
                    </p>
                </div>
            </footer>

            {/* AI Chat Widget */}
            <AiChatWidget business={business} />
        </div>
    )
}
