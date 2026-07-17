import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { StorefrontClient } from '@/components/StorefrontClient'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MockUpvoteButton } from '@/components/MockUpvoteButton'
import {
    MapPin,
    Star,
    ArrowLeft,
    MessageCircle,
    Instagram,
    ShoppingBag,
    ArrowRight,
    Phone,
} from 'lucide-react'
import { MockHeaderActions } from '@/components/MockHeaderActions'
import { MockSocialActions } from '@/components/MockSocialActions'
import { getWebsiteTheme } from '@/lib/website-theme'
import { getCategoryIcon } from '@/lib/category-icons'

const MOCK_BUSINESS = {
    id: 'mock-id-123',
    business_name: "Tola's Kitchen",
    business_slug: "tolas-kitchen",
    description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
    location: "Surulere, Lagos",
    category: {
        id: 'cat-1',
        name: 'Food & Drinks',
        slug: 'food-drinks',
        icon: '🍳'
    },
    whatsapp_number: "2349116891270",
    instagram_handle: "tolas_kitchen_",
    tiktok_handle: "tolasText_kitchen_tiktok",
    is_verified: true,
    plan: 'pro',
    upvotes: 124,
    logo_url: '/tolas-kitchen.png',
    ai_enabled: true,
    ai_welcome_msg: "Hi! Welcome to Tola's Kitchen 🍲 What would you like to order today?",
}

const MOCK_PRODUCTS = [
    {
        id: 'prod-1',
        user_id: 'mock-id-123',
        name: "Party Jollof Rice + Chicken",
        price: 3500,
        description: "Smoky party jollof served with spicy fried chicken and plantain.",
        image_url: '/jollof.png',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'prod-2',
        user_id: 'mock-id-123',
        name: "Egusi Soup + Pounded Yam",
        price: 4000,
        description: "Rich melon soup with assorted meat and stockfish.",
        image_url: '/egusi.jpg',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'prod-3',
        user_id: 'mock-id-123',
        name: "Fried Rice + Turkey",
        price: 4500,
        description: "Basmati fried rice loaded with veggies and liver, served with grilled turkey.",
        image_url: '/fried.jfif',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'prod-4',
        user_id: 'mock-id-123',
        name: "Asun (Spicy Goat Meat)",
        price: 2000,
        description: "Peppered goat meat bites, perfect for enjoyment.",
        image_url: '/asun.jfif',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

const MOCK_REVIEWS = [
    {
        id: 'rev-1',
        business_id: 'mock-id-123',
        customer_name: "Chidinma O.",
        customer_contact: "...",
        rating: 5,
        comment: "The best Jollof in Lagos! Legit smoky flavor.",
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'rev-2',
        business_id: 'mock-id-123',
        customer_name: "David K.",
        customer_contact: "...",
        rating: 5,
        comment: "Fast delivery, food was still hot when it arrived.",
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
        id: 'rev-3',
        business_id: 'mock-id-123',
        customer_name: "Sarah A.",
        customer_contact: "...",
        rating: 4,
        comment: "Portion is polite. Will order again.",
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
]

export const metadata: Metadata = {
    title: "Tola's Kitchen – Official Website | NaijaBiz",
    description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
    openGraph: {
        title: "Tola's Kitchen – Official Website | NaijaBiz",
        description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos.",
        type: 'website',
        images: ['/tolas-kitchen.png'],
    },
    twitter: {
        card: "summary_large_image",
        title: "Tola's Kitchen – Official Website | NaijaBiz",
        description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos.",
        images: ['/tolas-kitchen.png'],
    }
}

export default function ExampleBusinessPage() {
    const business = MOCK_BUSINESS
    const products = MOCK_PRODUCTS
    const reviews = MOCK_REVIEWS

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null

    const theme = getWebsiteTheme(business.category.slug, business.category.name, business.business_slug)
    const storeUrl = '/tolas-kitchen/store'

    const galleryImages = products
        .filter(p => p.image_url)
        .slice(0, 6)
        .map(p => ({ url: p.image_url, name: p.name }))

    return (
        <div style={{ background: theme.pageBg, color: theme.bodyText, minHeight: '100vh' }}>

            {/* Example badge banner */}
            <div
                className="text-center py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: theme.accent, color: theme.accentText }}
            >
                ✦ This is an example Pro website — <Link href="/signup" className="underline hover:opacity-80">Create yours free ↗</Link>
            </div>

            {/* ── NAVBAR ── */}
            <nav className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
                <div
                    className="max-w-5xl mx-auto flex justify-between items-center h-14 px-4 rounded-2xl"
                    style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        background: theme.navBg,
                        border: '1px solid rgba(255,255,255,0.85)',
                        boxShadow: '0 2px 24px rgba(0,0,0,0.07)',
                    }}
                >
                    <Link href="/" className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm font-medium">NaijaBiz</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="hidden md:inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={{ background: theme.accent + '22', color: theme.accent }}>
                            Example Page
                        </span>
                        <MockHeaderActions />
                        <Link href={storeUrl}>
                            <button
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                                style={{ background: theme.accent, color: theme.accentText }}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Order Now
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden"
                style={{ background: theme.heroBg }}
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />

                <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-28">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <div
                                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden relative shadow-2xl"
                                style={{ border: `3px solid ${theme.logoRing}`, boxShadow: `0 0 0 6px ${theme.logoRing}22` }}
                            >
                                <Image
                                    src={business.logo_url}
                                    alt={business.business_name}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="160px"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <span
                                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText }}
                                >
                                    {getCategoryIcon(business.category.name)} {business.category.name}
                                </span>
                                <span
                                    className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: theme.heroText }}
                                >
                                    ✓ Verified
                                </span>
                            </div>

                            <h1
                                className="text-4xl md:text-6xl font-black mb-3 leading-tight tracking-tight"
                                style={{ color: theme.heroText }}
                            >
                                {business.business_name}
                            </h1>

                            <p
                                className="text-lg md:text-xl mb-6 max-w-lg leading-relaxed"
                                style={{ color: theme.heroSubText }}
                            >
                                {business.description}
                            </p>

                            <div className="flex items-center justify-center md:justify-start gap-3 mb-8 flex-wrap">
                                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: theme.heroSubText }}>
                                    <MapPin className="w-4 h-4" />{business.location}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: theme.heroSubText }}>
                                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                                    {averageRating} ({reviews.length} reviews)
                                </span>
                                <MockUpvoteButton initialUpvotes={business.upvotes} size="sm" />
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                                <Link href={storeUrl}>
                                    <button
                                        className="h-13 px-8 py-3.5 rounded-2xl text-base font-black flex items-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-xl"
                                        style={{ background: theme.ctaBg, color: theme.ctaText }}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        View Store & Order
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                                <MockSocialActions />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ABOUT ── */}
            <section className="py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div>
                            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>
                                About Us
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black mb-5 leading-tight" style={{ color: theme.headingText }}>
                                Who we are
                            </h2>
                            <p className="text-lg leading-relaxed mb-6" style={{ color: theme.mutedText }}>
                                {business.description}
                            </p>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: theme.accent + '22' }}>
                                        <MapPin className="w-4 h-4" style={{ color: theme.accent }} />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: theme.bodyText }}>{business.location}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: '#dcfce7' }}>
                                        <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: theme.bodyText }}>+{business.whatsapp_number}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: '#fce7f3' }}>
                                        <Instagram className="w-4 h-4 text-pink-600" />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: theme.bodyText }}>@{business.instagram_handle}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats card */}
                        <div
                            className="rounded-3xl p-8"
                            style={{
                                background: theme.cardBg,
                                border: `1px solid ${theme.cardBorder}`,
                                backdropFilter: 'blur(16px)',
                            }}
                        >
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { label: 'Products', value: products.length, suffix: '+' },
                                    { label: 'Reviews', value: reviews.length, suffix: '' },
                                    { label: 'Upvotes', value: business.upvotes, suffix: '' },
                                    { label: 'Rating', value: averageRating || '—', suffix: averageRating ? '★' : '' },
                                ].map(({ label, value, suffix }) => (
                                    <div key={label} className="text-center">
                                        <p className="text-3xl font-black mb-1" style={{ color: theme.accent }}>
                                            {value}{suffix}
                                        </p>
                                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.mutedText }}>
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Link href={storeUrl}>
                                    <button
                                        className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                                        style={{ background: theme.accent, color: theme.accentText }}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Browse Products
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── GALLERY ── */}
            {galleryImages.length > 0 && (
                <section className="py-16 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>
                                Gallery
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black" style={{ color: theme.headingText }}>
                                Our Food
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {galleryImages.map((img, i) => (
                                <Link href={storeUrl} key={i} className="group relative aspect-square rounded-2xl overflow-hidden block">
                                    <Image
                                        src={img.url}
                                        alt={img.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
                                        <p className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {img.name}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <Link href={storeUrl}>
                                <button
                                    className="px-8 py-3.5 rounded-2xl font-bold text-sm inline-flex items-center gap-2 transition-all hover:opacity-90"
                                    style={{ background: theme.accent, color: theme.accentText }}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    See Full Menu & Order
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── REVIEWS ── */}
            <section className="py-16 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: theme.accent }}>
                            Testimonials
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black" style={{ color: theme.headingText }}>
                            What customers say
                        </h2>
                        {averageRating && (
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`w-5 h-5 ${parseFloat(averageRating) >= i ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                <span className="font-bold text-lg" style={{ color: theme.headingText }}>{averageRating}</span>
                                <span className="text-sm" style={{ color: theme.mutedText }}>({reviews.length} reviews)</span>
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="rounded-2xl p-6"
                                style={{
                                    background: theme.cardBg,
                                    border: `1px solid ${theme.cardBorder}`,
                                    backdropFilter: 'blur(12px)',
                                }}
                            >
                                <div className="flex mb-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                                {review.comment && (
                                    <p className="text-sm leading-relaxed mb-4 italic" style={{ color: theme.bodyText }}>
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                        style={{ background: theme.accent }}>
                                        {review.customer_name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold" style={{ color: theme.headingText }}>{review.customer_name}</p>
                                        <p className="text-xs" style={{ color: theme.mutedText }}>
                                            {new Date(review.created_at).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-20 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto">
                    <div
                        className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
                        style={{ background: theme.heroBg }}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                            style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
                        <div className="relative z-10">
                            <p className="text-xs font-bold tracking-widest uppercase mb-4"
                                style={{ color: 'rgba(255,255,255,0.7)' }}>
                                Ready to order?
                            </p>
                            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight" style={{ color: theme.heroText }}>
                                Get in touch with {business.business_name}
                            </h2>
                            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: theme.heroSubText }}>
                                Browse our full menu, place an order, or message us on WhatsApp.
                            </p>
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <Link href={storeUrl}>
                                    <button
                                        className="h-13 px-8 py-3.5 rounded-2xl font-black text-base flex items-center gap-2 transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-xl"
                                        style={{ background: theme.ctaBg, color: theme.ctaText }}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        View Our Store
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="py-8 px-4" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: theme.mutedText }}>
                        © {new Date().getFullYear()} {business.business_name}. Powered by{' '}
                        <Link href="/" className="font-semibold hover:underline" style={{ color: theme.accent }}>
                            NaijaBiz
                        </Link>
                        {' '}– The link that proves you are legit
                    </p>
                    <div className="flex items-center gap-4">
                        <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity" style={{ color: theme.mutedText }}>
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href={`https://wa.me/${business.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
                            className="hover:opacity-70 transition-opacity" style={{ color: theme.mutedText }}>
                            <MessageCircle className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </footer>

            {/* CTA for visitors — sign up */}
            <div className="hidden md:block fixed bottom-6 right-6 z-40">
                <Link href="/signup">
                    <Button
                        className="font-bold h-12 px-6 shadow-xl rounded-full"
                        style={{ background: theme.accent, color: theme.accentText }}
                    >
                        Create your website like this ↗
                    </Button>
                </Link>
            </div>
        </div>
    )
}
