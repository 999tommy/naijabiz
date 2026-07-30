import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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
    Instagram,
    LayoutDashboard,
    ArrowRight,
    Phone,
    ShoppingBag,
    Sparkles,
} from 'lucide-react'
import type { Review } from '@/lib/types'
import { getCategoryIcon } from '@/lib/category-icons'
import { UpvoteButton } from '@/components/UpvoteButton'
import { BusinessShareButton } from '@/components/BusinessShareButton'
import { AiChatWidget } from '@/components/AiChatWidget'
import { checkAndDowngradeUser } from '@/lib/subscription'
import { StorefrontClient } from '@/components/StorefrontClient'
import { ServiceProfileClient } from '@/components/ServiceProfileClient'
import { getWebsiteTheme } from '@/lib/website-theme'

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

    if (data) {
        const checkedData = await checkAndDowngradeUser(data)
        const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('business_id', data.id)
        const { count: viewCount } = await supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('business_id', data.id)
        return { ...checkedData, reviewCount: reviewCount || 0, viewCount: viewCount || 0 }
    }
    return null
}

async function getProducts(userId: string, limit?: number) {
    const supabase = await createClient()
    let query = supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
    if (limit) query = query.limit(limit)
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
    const supabase = await createServiceClient()
    const headersList = await headers()
    const viewerIp = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown'
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existingView } = await supabase
        .from('page_views').select('id').eq('business_id', businessId).eq('viewer_ip', viewerIp).gt('created_at', twentyFourHoursAgo).limit(1)
    if (!existingView || existingView.length === 0) {
        await supabase.from('page_views').insert({
            business_id: businessId,
            viewer_ip: viewerIp,
            viewer_user_agent: headersList.get('user-agent') || null,
            referrer: headersList.get('referer') || null,
        })
    }
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
    const { slug } = await params
    const business = await getBusiness(slug)
    if (!business?.business_name) return { title: 'Business Not Found' }
    const isPro = business.plan === 'pro'
    const title = `${business.business_name}${isPro ? ' – Official Store' : ''} | NaijaBiz`
    const description = business.description || `Shop ${business.business_name} on NaijaBiz. View products, prices, and order via WhatsApp.`
    const imageUrl = business.logo_url || '/logo.png'
    return {
        title, description,
        openGraph: { title, description, type: 'website', images: [{ url: imageUrl, width: 800, height: 800, alt: business.business_name }] },
        twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    }
}

export default async function BusinessPage({ params }: BusinessPageProps) {
    const { slug } = await params
    const business = await getBusiness(slug)
    if (!business?.business_name) notFound()

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const isOwner = currentUser?.id === business.id
    const isPro = business.plan === 'pro'
    const [products, reviews] = await Promise.all([
        getProducts(business.id, isPro ? undefined : 5),
        getReviews(business.id),
    ])
    recordPageView(business.id)

    const isVerified = isPro
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : null

    const jsonLd = {
        '@context': 'https://schema.org', '@type': 'Store',
        name: business.business_name, description: business.description,
        image: business.logo_url || 'https://naijabiz.org/logo.png',
        url: `https://naijabiz.org/${business.business_slug}`,
        telephone: business.whatsapp_number ? `+${business.whatsapp_number}` : undefined,
        address: { '@type': 'PostalAddress', addressCountry: 'NG', addressLocality: business.location || 'Nigeria' },
        ...(isPro ? { priceRange: '$$', aggregateRating: reviews.length > 0 ? { '@type': 'AggregateRating', ratingValue: averageRating, reviewCount: reviews.length, bestRating: '5', worstRating: '1' } : undefined } : {})
    }

    // ── SERVICE BUSINESSES ─────────────────────────────────────────────────────
    if (business.business_type === 'services') {
        return (
            <ServiceProfileClient
                products={products}
                business={business}
                isPro={isPro}
                reviews={reviews}
                averageRating={averageRating}
                isOwner={isOwner}
            />
        )
    }

    // ── PRODUCT BUSINESSES – FREE ──────────────────────────────────────────────
    if (!isPro) {
        return (
            <div className="min-h-screen bg-gray-50">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                            <Image src="/logo.png" alt="NaijaBiz" width={24} height={24} className="opacity-80" />
                            <span className="font-bold text-gray-900 hidden sm:inline">NaijaBiz</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            {isOwner && (
                                <Link href="/dashboard">
                                    <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4" /><span className="hidden sm:inline">Go to </span>Dashboard
                                    </Button>
                                </Link>
                            )}
                            <BusinessShareButton businessName={business.business_name} />
                        </div>
                    </div>
                </header>

                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="flex-shrink-0">
                                {business.logo_url ? (
                                    <Image src={business.logo_url} alt={business.business_name} width={100} height={100}
                                        className="rounded-xl object-cover" priority loading="eager"
                                        unoptimized={business.logo_url.includes('supabase.co/storage/v1/object/public/')} />
                                ) : (
                                    <div className="w-[100px] h-[100px] rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {business.business_name[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl font-bold text-gray-900">{business.business_name}</h1>
                                    <VerifiedBadge size="md" isCommunityVerified={(business.reviewCount ?? 0) >= 5 && (business.viewCount ?? 0) >= 50} />
                                    <UpvoteButton userId={business.id} initialUpvotes={business.upvotes || 0} size="sm" />
                                </div>
                                {business.description && <p className="text-gray-600 mt-2">{business.description}</p>}
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    {business.category && <Badge variant="outline" className="gap-1.5 pl-1.5">{getCategoryIcon(business.category.name)} {business.category.name}</Badge>}
                                    {business.location && <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-4 h-4" />{business.location}</span>}
                                </div>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {business.whatsapp_number && (
                                        <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
                                        </a>
                                    )}
                                    {business.instagram_handle && (
                                        <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cb] hover:opacity-90 text-white border-0 font-semibold shadow-sm"><Instagram className="w-4 h-4 mr-2" />Instagram</Button>
                                        </a>
                                    )}
                                </div>
                                {isOwner && (
                                    <div className="mt-5">
                                        <Link href="/pricing">
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-xs font-semibold text-orange-700 hover:bg-orange-200 transition-colors">
                                                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[10px]">★</span>
                                                Unlock a full branded store
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <StorefrontClient
                    products={products}
                    business={business}
                    isPro={false}
                    reviews={reviews}
                    slug={slug}
                    averageRating={averageRating}
                    whatsappNumber={business.whatsapp_number || ''}
                    instagramHandle={business.instagram_handle}
                />

                <footer className="bg-white border-t border-gray-200 py-6 relative z-30">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <p className="text-sm text-gray-500">Powered by{' '}<Link href="/" className="text-orange-600 hover:underline font-medium">NaijaBiz</Link>{' '}– The link that proves you are legit</p>
                    </div>
                </footer>
            </div>
        )
    }

    // ── PRODUCT BUSINESSES – PRO: Unified brand page + inline catalog ──────────
    const theme = getWebsiteTheme(business.category?.slug, business.category?.name, slug)

    return (
        <div style={{ background: theme.pageBg, color: theme.bodyText, minHeight: '100vh' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
                <div className="max-w-5xl mx-auto flex justify-between items-center h-14 px-4 rounded-2xl"
                    style={{ backdropFilter: 'blur(20px) saturate(180%)', background: theme.navBg, border: '1px solid rgba(255,255,255,0.85)', boxShadow: '0 2px 24px rgba(0,0,0,0.07)' }}>
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <Image src="/logo.png" alt="NaijaBiz" width={24} height={24} className="opacity-80" />
                        <span className="font-bold text-gray-900 hidden sm:inline">NaijaBiz</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <Link href="/dashboard">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80" style={{ background: theme.accent, color: theme.accentText }}>
                                    <LayoutDashboard className="w-3.5 h-3.5" />Dashboard
                                </button>
                            </Link>
                        )}
                        <BusinessShareButton businessName={business.business_name} />
                        <a href="#catalog">
                            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ background: theme.accent, color: theme.accentText }}>
                                <ShoppingBag className="w-4 h-4" />Shop
                            </button>
                        </a>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden" style={{ background: theme.heroBg }}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
                <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 micro-reveal">
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden relative shadow-2xl animate-soft-float" style={{ border: `3px solid ${theme.logoRing}`, boxShadow: `0 0 0 6px ${theme.logoRing}22` }}>
                                {business.logo_url ? (
                                    <Image src={business.logo_url} alt={business.business_name} fill className="object-cover" priority sizes="160px" unoptimized={business.logo_url.includes('supabase.co/storage/v1/object/public/')} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white" style={{ background: theme.accent }}>{business.business_name[0].toUpperCase()}</div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                {business.category && <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText }}>{getCategoryIcon(business.category.name)} {business.category.name}</span>}
                                {isVerified && <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText }}>✓ Verified</span>}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-3 leading-tight tracking-tight" style={{ color: theme.heroText }}>{business.business_name}</h1>
                            {business.description && <p className="text-lg md:text-xl mb-6 max-w-lg leading-relaxed" style={{ color: theme.heroSubText }}>{business.description}</p>}
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-8 flex-wrap">
                                {business.location && <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: theme.heroSubText }}><MapPin className="w-4 h-4" />{business.location}</span>}
                                {averageRating && <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: theme.heroSubText }}><Star className="w-4 h-4 fill-current text-yellow-400" />{averageRating} ({reviews.length} reviews)</span>}
                                <UpvoteButton userId={business.id} initialUpvotes={business.upvotes || 0} size="sm" />
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                <a href="#catalog">
                                    <button className="h-13 px-8 py-3.5 rounded-2xl text-base font-black flex items-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-xl micro-lift" style={{ background: theme.ctaBg, color: theme.ctaText }}>
                                        <ShoppingBag className="w-5 h-5" />Shop Now<ArrowRight className="w-4 h-4" />
                                    </button>
                                </a>
                                {business.whatsapp_number && (
                                    <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                        <button className="h-13 px-6 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 transition-all hover:opacity-80" style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText, border: '1px solid rgba(255,255,255,0.25)' }}>
                                            <MessageCircle className="w-5 h-5" />WhatsApp
                                        </button>
                                    </a>
                                )}
                                {business.ai_enabled && business.plan === 'pro' && (
                                    <button
                                        onClick={() => {
                                            const event = new CustomEvent('open-ai-chat')
                                            window.dispatchEvent(event)
                                        }}
                                        className="h-13 px-6 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 transition-all hover:opacity-80"
                                        style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText, border: '1px solid rgba(255,255,255,0.25)' }}
                                    >
                                        <Sparkles className="w-5 h-5" />Chat with AI
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT */}
            {business.description && (
                <section className="py-16 px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div>
                                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>About Us</p>
                                <h2 className="text-3xl md:text-4xl font-black mb-5 leading-tight" style={{ color: theme.headingText }}>Who we are</h2>
                                <p className="text-lg leading-relaxed mb-6" style={{ color: theme.mutedText }}>{business.description}</p>
                                <div className="flex flex-col gap-3">
                                    {business.location && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: theme.accent + '22' }}><MapPin className="w-4 h-4" style={{ color: theme.accent }} /></div>
                                            <span className="text-sm font-medium" style={{ color: theme.bodyText }}>{business.location}</span>
                                        </div>
                                    )}
                                    {business.whatsapp_number && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#dcfce7' }}><Phone className="w-4 h-4 text-green-600" /></div>
                                            <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: theme.bodyText }}>+{business.whatsapp_number}</a>
                                        </div>
                                    )}
                                    {business.instagram_handle && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fce7f3' }}><Instagram className="w-4 h-4 text-pink-600" /></div>
                                            <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: theme.bodyText }}>@{business.instagram_handle}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="rounded-3xl p-8 micro-lift" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(16px)' }}>
                                <div className="grid grid-cols-2 gap-6">
                                    {[{ label: 'Products', value: products.length, suffix: '+' }, { label: 'Reviews', value: reviews.length, suffix: '' }, { label: 'Upvotes', value: business.upvotes || 0, suffix: '' }, { label: 'Rating', value: averageRating || '—', suffix: averageRating ? '★' : '' }].map(({ label, value, suffix }) => (
                                        <div key={label} className="text-center">
                                            <p className="text-3xl font-black mb-1" style={{ color: theme.accent }}>{value}{suffix}</p>
                                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.mutedText }}>{label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8">
                                    <a href="#catalog">
                                        <button className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: theme.accent, color: theme.accentText }}>
                                            <ShoppingBag className="w-4 h-4" />Browse Products<ArrowRight className="w-4 h-4" />
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* INLINE CATALOG — no page change, just scroll */}
            <section id="catalog" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto px-4 pt-12 pb-4 text-center">
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>Catalog</p>
                    <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: theme.headingText }}>Our Products</h2>
                    <p className="text-base mb-0" style={{ color: theme.mutedText }}>Tap any item to view details and order via WhatsApp</p>
                </div>
                <StorefrontClient
                    products={products}
                    business={business}
                    isPro={isPro}
                    reviews={reviews}
                    slug={slug}
                    averageRating={averageRating}
                    whatsappNumber={business.whatsapp_number || ''}
                    instagramHandle={business.instagram_handle}
                />
            </section>

            {/* REVIEWS */}
            {reviews.length > 0 && (
                <section className="py-16 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>Testimonials</p>
                            <h2 className="text-3xl md:text-4xl font-black" style={{ color: theme.headingText }}>What customers say</h2>
                            {averageRating && (
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${parseFloat(averageRating) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}</div>
                                    <span className="font-bold text-lg" style={{ color: theme.headingText }}>{averageRating}</span>
                                    <span className="text-sm" style={{ color: theme.mutedText }}>({reviews.length} reviews)</span>
                                </div>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reviews.map((review: Review) => (
                                <div key={review.id} className="rounded-2xl p-6 micro-lift" style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, backdropFilter: 'blur(12px)' }}>
                                    <div className="flex mb-3">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}</div>
                                    {review.comment && <p className="text-sm leading-relaxed mb-4 italic" style={{ color: theme.bodyText }}>&ldquo;{review.comment}&rdquo;</p>}
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: theme.accent }}>{review.customer_name[0].toUpperCase()}</div>
                                        <div>
                                            <p className="text-xs font-bold" style={{ color: theme.headingText }}>{review.customer_name}</p>
                                            <p className="text-xs" style={{ color: theme.mutedText }}>{new Date(review.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href={`/${slug}/review`}>
                                <button className="px-6 py-2.5 rounded-xl text-sm font-bold border-2 transition-all hover:opacity-80" style={{ borderColor: theme.accent, color: theme.accent }}>
                                    <Star className="w-4 h-4 inline mr-1.5" />Leave a Review
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* FINAL CTA */}
            <section className="py-20 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden animate-gentle-scale" style={{ background: theme.heroBg }}>
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
                        <div className="relative z-10">
                            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>Ready to order?</p>
                            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight" style={{ color: theme.heroText }}>Get in touch with {business.business_name}</h2>
                            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: theme.heroSubText }}>Browse our full catalogue above, or send us a direct message on WhatsApp to place your order.</p>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <a href="#catalog">
                                    <button className="h-13 px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-xl" style={{ background: theme.ctaBg, color: theme.ctaText }}>
                                        <ShoppingBag className="w-5 h-5" />View All Products<ArrowRight className="w-4 h-4" />
                                    </button>
                                </a>
                                {business.whatsapp_number && (
                                    <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                                        <button className="h-13 px-6 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 transition-all hover:opacity-80" style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText, border: '1px solid rgba(255,255,255,0.25)' }}>
                                            <MessageCircle className="w-5 h-5" />WhatsApp Us
                                        </button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-8 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: theme.mutedText }}>© {new Date().getFullYear()} {business.business_name}. Powered by{' '}<Link href="/" className="font-semibold hover:underline" style={{ color: theme.accent }}>NaijaBiz</Link>{' '}– The link that proves you are legit</p>
                    <div className="flex items-center gap-4">
                        {business.instagram_handle && <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" style={{ color: theme.mutedText }}><Instagram className="w-5 h-5" /></a>}
                        {business.whatsapp_number && <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity" style={{ color: theme.mutedText }}><MessageCircle className="w-5 h-5" /></a>}
                    </div>
                </div>
            </footer>

            <AiChatWidget business={business} />
        </div>
    )
}
