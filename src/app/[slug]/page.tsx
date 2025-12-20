import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { OrderCart } from '@/components/OrderCart'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    MessageCircle,
    Star,
    ArrowLeft,
    Package,
    Instagram
} from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import { UpvoteButton } from '@/components/UpvoteButton'
import { BusinessShareButton } from '@/components/BusinessShareButton'

export const dynamic = 'force-dynamic'

interface BusinessPageProps {
    params: Promise<{ slug: string }>
}

async function getBusiness(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('users')
        .select('*, category:categories(*)')
        .eq('business_slug', slug)
        .single()

    return data
}

async function getProducts(userId: string, limit?: number) {
    const supabase = await createClient()
    let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (limit) {
        query = query.limit(limit)
    }

    const { data } = await query

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
    const supabase = await createClient()
    const headersList = await headers()

    await supabase.from('page_views').insert({
        business_id: businessId,
        viewer_ip: headersList.get('x-forwarded-for') || null,
        viewer_user_agent: headersList.get('user-agent') || null,
        referrer: headersList.get('referer') || null,
    })
}

import type { Metadata } from 'next'

// ... (existing imports)

// (keep interface BusinessPageProps and helper functions)

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
    const { slug } = await params
    const business = await getBusiness(slug)

    if (!business || !business.business_name) {
        return {
            title: 'Business Not Found',
        }
    }

    const title = `${business.business_name} | NaijaBiz`
    const description = business.description || `Order from ${business.business_name} on NaijaBiz. View products, prices, and reviews.`
    const imageUrl = business.logo_url || '/logo.png'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
    const { slug } = await params
    const business = await getBusiness(slug)

    if (!business || !business.business_name) {
        notFound()
    }
    // ... rest of component

    const isPro = business.plan === 'pro'

    const [products, reviews] = await Promise.all([
        getProducts(business.id, isPro ? undefined : 3),
        getReviews(business.id),
    ])

    // Record page view (async, don't await)
    recordPageView(business.id)

    const isVerified = business.is_verified && isPro
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Directory</span>
                    </Link>
                    <BusinessShareButton businessName={business.business_name} />
                </div>
            </header>

            {/* Business info */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            {business.logo_url ? (
                                <Image
                                    src={business.logo_url}
                                    alt={business.business_name}
                                    width={100}
                                    height={100}
                                    className="rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {business.business_name[0].toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {business.business_name}
                                </h1>
                                {isVerified && <VerifiedBadge size="md" />}
                                <UpvoteButton userId={business.id} initialUpvotes={business.upvotes || 0} size="sm" />
                            </div>

                            {business.description && (
                                <p className="text-gray-600 mt-2">{business.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                {business.category && (
                                    <Badge variant="outline" className="gap-1.5 pl-1.5">
                                        {getCategoryIcon(business.category.name)} {business.category.name}
                                    </Badge>
                                )}
                                {business.location && (
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        {business.location}
                                    </span>
                                )}
                                {averageRating && (
                                    <span className="flex items-center gap-1 text-sm text-gray-500">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        {averageRating} ({reviews.length} reviews)
                                    </span>
                                )}
                            </div>

                            {/* Quick contact */}
                            <div className="flex gap-3 mt-4">
                                {business.whatsapp_number && (
                                    <a
                                        href={`https://wa.me/${business.whatsapp_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            WhatsApp
                                        </Button>
                                    </a>
                                )}
                                {business.instagram_handle && (
                                    <a
                                        href={`https://instagram.com/${business.instagram_handle}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" className="bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cb] hover:opacity-90 text-white border-0 font-semibold shadow-sm">
                                            <Instagram className="w-4 h-4 mr-2" />
                                            Instagram
                                        </Button>
                                    </a>
                                )}
                                {business.tiktok_handle && (
                                    <a
                                        href={`https://tiktok.com/@${business.tiktok_handle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm" className="bg-black hover:bg-gray-800 text-white border-0 font-semibold shadow-sm">
                                            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" aria-hidden="true">
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

            {/* Products */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Products ({products.length})
                </h2>

                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No products listed yet</p>
                    </div>
                ) : (
                    <OrderCart
                        products={products}
                        businessName={business.business_name}
                        whatsappNumber={business.whatsapp_number || ''}
                        instagramHandle={business.instagram_handle}
                    />
                )}
            </div>

            {/* Reviews (Pro only) */}
            {
                isPro && reviews.length > 0 && (
                    <div className="max-w-4xl mx-auto px-4 pb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Customer Reviews ({reviews.length})
                        </h2>
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {review.customer_name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 text-sm">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Leave a review CTA */}
                        <div className="mt-6 text-center">
                            <Link href={`/${slug}/review`}>
                                <Button variant="outline">
                                    <Star className="w-4 h-4 mr-2" />
                                    Leave a Review
                                </Button>
                            </Link>
                        </div>
                    </div>
                )
            }

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">
                        Powered by{' '}
                        <Link href="/" className="text-orange-600 hover:underline font-medium">
                            NaijaBiz
                        </Link>
                        {' '}– The link that proves you are legit
                    </p>
                </div>
            </footer>
        </div >
    )
}
