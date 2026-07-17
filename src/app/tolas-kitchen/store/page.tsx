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
} from 'lucide-react'
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
    title: "Tola's Kitchen – Store | NaijaBiz",
    description: "Order Nigerian food from Tola's Kitchen. Party Jollof, Egusi Soup, Fried Rice and more. Order via WhatsApp.",
    openGraph: {
        title: "Tola's Kitchen – Store | NaijaBiz",
        description: "Order Nigerian food from Tola's Kitchen. Party Jollof, Egusi Soup, Fried Rice and more.",
        type: 'website',
        images: ['/tolas-kitchen.png'],
    },
}

export default function ExampleStorePage() {
    const business = MOCK_BUSINESS
    const products = MOCK_PRODUCTS
    const reviews = MOCK_REVIEWS

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null

    const theme = getWebsiteTheme(business.category.slug, business.category.name, business.business_slug)

    return (
        <div className="min-h-screen" style={{ background: theme.pageBg }}>

            {/* Example badge banner */}
            <div
                className="text-center py-2 text-xs font-bold uppercase tracking-widest"
                style={{ background: theme.accent, color: theme.accentText }}
            >
                ✦ This is an example Pro store — <Link href="/signup" className="underline hover:opacity-80">Create yours free ↗</Link>
            </div>

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
                        href="/tolas-kitchen"
                        className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
                        style={{ color: theme.accent }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to {business.business_name}</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href="/signup" className="md:hidden">
                            <Button size="sm" className="font-bold h-8 text-xs"
                                style={{ background: theme.accent, color: theme.accentText }}>
                                Create Page
                            </Button>
                        </Link>
                        <span className="hidden md:inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={{ background: theme.accent + '22', color: theme.accent }}>
                            Example Store
                        </span>
                    </div>
                </div>
            </header>

            {/* Business info strip */}
            <div className="border-b" style={{ background: theme.cardBg, borderColor: theme.divider }}>
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <Image
                                src={business.logo_url}
                                alt={business.business_name}
                                width={80}
                                height={80}
                                className="rounded-2xl object-cover"
                                priority
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h1 className="text-xl font-black" style={{ color: theme.headingText }}>
                                    {business.business_name}
                                </h1>
                                <VerifiedBadge size="sm" isVerified={true} />
                                <MockUpvoteButton initialUpvotes={business.upvotes} size="sm" />
                            </div>

                            <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.mutedText }}>
                                {business.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="outline" className="gap-1.5 pl-1.5 text-xs">
                                    {getCategoryIcon(business.category.name)} {business.category.name}
                                </Badge>
                                <span className="flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                                    <MapPin className="w-3.5 h-3.5" />{business.location}
                                </span>
                                {averageRating && (
                                    <span className="flex items-center gap-1 text-xs" style={{ color: theme.mutedText }}>
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        {averageRating} ({reviews.length})
                                    </span>
                                )}
                            </div>

                            <div className="mt-3">
                                <MockSocialActions />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products + Reviews via StorefrontClient */}
            <StorefrontClient
                products={products}
                business={business as any}
                isPro={true}
                reviews={reviews as any}
                slug="tolas-kitchen"
                averageRating={averageRating}
                whatsappNumber={business.whatsapp_number}
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

            {/* Visitor CTA */}
            <div className="hidden md:block fixed bottom-6 right-6 z-40">
                <Link href="/signup">
                    <Button
                        className="font-bold h-12 px-6 shadow-xl rounded-full"
                        style={{ background: theme.accent, color: theme.accentText }}
                    >
                        Create your own store like this ↗
                    </Button>
                </Link>
            </div>
        </div>
    )
}
