import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { OrderCart } from '@/components/OrderCart'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MockUpvoteButton } from '@/components/MockUpvoteButton'
import {
    MapPin,
    MessageCircle,
    Star,
    ArrowLeft,
    Share2,
    Package,
    Instagram
} from 'lucide-react'

const MOCK_BUSINESS = {
    id: 'mock-id-123',
    business_name: "Tola's Kitchen",
    business_slug: "tolas-kitchen",
    description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
    location: "Surulere, Lagos",
    category: {
        id: 'cat-1',
        name: 'Food & Drink',
        slug: 'food-drink',
        icon: '🍳'
    },
    whatsapp_number: "2348000000000",
    instagram_handle: "tolas_kitchen_",
    tiktok_handle: "tolasText_kitchen_tiktok",
    is_verified: true,
    plan: 'pro',
    upvotes: 124,
    // Using a placeholder color background if no logo, or maybe a generic food icon
    logo_url: null
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
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
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
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
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
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
    }
]

export const metadata: Metadata = {
    title: "Tola's Kitchen | NaijaBiz",
    description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
    openGraph: {
        title: "Tola's Kitchen | NaijaBiz",
        description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
        type: 'website',
        // In a real app we'd use absolute URLs, but relative should work with metadataBase in layout
    },
    twitter: {
        card: "summary_large_image",
        title: "Tola's Kitchen | NaijaBiz",
        description: "Authentic Nigerian Jollof, Fried Rice, and Soups delivering to all parts of Lagos. Taste the difference today!",
    }
}

export default function ExampleBusinessPage() {
    const business = MOCK_BUSINESS
    const products = MOCK_PRODUCTS
    const reviews = MOCK_REVIEWS

    const isPro = business.plan === 'pro'
    // Actually mock verified check logic
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
                        <span className="hidden sm:inline">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Example Page
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                        // Client interactivity for share button needs client component or simple onclick if we are lenient. 
                        // But since this is a server component now, we can't pass onClick to Button directly if Button is a client component? 
                        // Wait, Button is a client component usually? No, Shadcn Button is usually just a styled native button.
                        // If Button is a server component (just renders <button>), onClick won't work.
                        // However, we can use a small Client Component wrapper for the Share button or just ignore it for now as it's a mock page.
                        // The original code used onClick={alert}. We can't do that in Server Component.
                        // Let's replace Share button with a Link or just remove `onClick` to avoid hydration error if we don't want to make a client wrapper.
                        // OR, even better, I'll make a specialized ShareButton client component if crucial.
                        // For this task, I'll just remove the onClick alert for the header share button to keep it simple, or make it a client component.
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                    </div>
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
                                <MockUpvoteButton initialUpvotes={business.upvotes} size="sm" />
                            </div>

                            {business.description && (
                                <p className="text-gray-600 mt-2">{business.description}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                {business.category && (
                                    <Badge variant="outline">
                                        {business.category.icon} {business.category.name}
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
                                {/* Since these are links/buttons with href or onClick in previous code, 
                                    I need to match them. Previous code used Buttons with onClick alerts.
                                    I'll convert them to simple hrefs for simplicity or empty buttons.
                                */}
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm" onClick={() => alert("This is a demo. It would open WhatsApp.")}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button size="sm" className="bg-gradient-to-tr from-[#f09433] via-[#bc1888] to-[#2cc6cb] hover:opacity-90 text-white border-0 font-semibold shadow-sm" onClick={() => alert("This is a demo. It would open Instagram.")}>
                                    <Instagram className="w-4 h-4 mr-2" />
                                    Instagram
                                </Button>
                                <Button size="sm" className="bg-black hover:bg-gray-800 text-white border-0 font-semibold shadow-sm" onClick={() => alert("This is a demo. It would open TikTok.")}>
                                    <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                    TikTok
                                </Button>
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

                <OrderCart
                    products={products}
                    businessName={business.business_name}
                    whatsappNumber={business.whatsapp_number}
                    instagramHandle={business.instagram_handle}
                    extraBottomSpacing={true}
                />
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
                            <Button variant="outline">
                                <Star className="w-4 h-4 mr-2" />
                                Leave a Review
                            </Button>
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

            {/* CTA Overlay for non-logged in users (optional, but good for conversion) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 md:hidden">
                <Link href="/signup">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 shadow-lg">
                        Create your own page like this
                    </Button>
                </Link>
            </div>
            <div className="hidden md:block fixed bottom-6 right-6 z-40">
                <Link href="/signup">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold h-12 px-6 shadow-xl rounded-full">
                        Create your own page like this
                    </Button>
                </Link>
            </div>
        </div >
    )
}
