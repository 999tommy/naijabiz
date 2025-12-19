import Image from 'next/image'
import Link from 'next/link'
import { OrderCart } from '@/components/OrderCart'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    MapPin,
    MessageCircle,
    Star,
    ArrowLeft,
    Share2,
    Package,
    Rocket,
    ThumbsUp
} from 'lucide-react'
import { useState } from 'react'

// Mock Data
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
        image_url: null, // User said they will find images themselves
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
        image_url: null,
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
        image_url: null,
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
        image_url: null,
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

function MockUpvoteButton({
    initialUpvotes,
    size = 'default'
}: {
    initialUpvotes: number
    size?: 'sm' | 'default' | 'lg'
}) {
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [hasUpvoted, setHasUpvoted] = useState(false)

    const handleUpvote = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (hasUpvoted) return
        setUpvotes(prev => prev + 1)
        setHasUpvoted(true)
    }

    return (
        <Button
            size={size === 'default' ? 'default' : 'sm'}
            variant="outline"
            className={`gap-2 transition-all duration-300 font-bold border-2 ${hasUpvoted
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300 cursor-default"
                    : "text-gray-600 border-gray-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                }`}
            onClick={handleUpvote}
            disabled={hasUpvoted}
        >
            {hasUpvoted ? <ThumbsUp className="w-4 h-4 fill-current" /> : <Rocket className="w-4 h-4" />}
            <span>{upvotes}</span>
            <span className="sr-only">Upvotes</span>
        </Button>
    )
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
                            onClick={() => {
                                // Mock share
                                alert("This is a demo page. In a real page, this would share the link!")
                            }}
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
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => alert("This is a demo. It would open WhatsApp.")}>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => alert("This is a demo. It would open Instagram.")}>
                                    📷 Instagram
                                </Button>
                                <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50" onClick={() => alert("This is a demo. It would open TikTok.")}>
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                            <Button variant="outline" onClick={() => alert("This is a demo of the review feature.")}>
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
