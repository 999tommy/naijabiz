'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Film, Star, Package } from 'lucide-react'
import Link from 'next/link'
import { OrderCart } from '@/components/OrderCart'
import { ShoppableReels } from '@/components/ShoppableReels'
import { Button } from '@/components/ui/button'
import type { Product, User, Review } from '@/lib/types'

interface StorefrontClientProps {
    products: Product[]
    business: User & { category?: { name: string }; reviewCount?: number; viewCount?: number }
    isPro: boolean
    reviews: Review[]
    slug: string
    averageRating: string | null
    whatsappNumber: string
    instagramHandle?: string | null
}

export function StorefrontClient({
    products,
    business,
    isPro,
    reviews,
    slug,
    averageRating,
    whatsappNumber,
    instagramHandle,
}: StorefrontClientProps) {
    // Default to Reels for Pro businesses, Grid for free
    const [viewMode, setViewMode] = useState<'grid' | 'reels'>(isPro ? 'reels' : 'grid')

    // Restore saved preference on mount
    useEffect(() => {
        if (!isPro) return
        try {
            const saved = localStorage.getItem(`nb-view-${business.id}`) as 'grid' | 'reels' | null
            if (saved === 'grid' || saved === 'reels') setViewMode(saved)
        } catch {
            // localStorage unavailable (e.g. private browsing edge case)
        }
    }, [business.id, isPro])

    // Lock body scroll when reels are active so only the reel container scrolls
    useEffect(() => {
        if (viewMode === 'reels' && isPro) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [viewMode, isPro])

    const handleToggle = (mode: 'grid' | 'reels') => {
        setViewMode(mode)
        if (isPro) {
            try {
                localStorage.setItem(`nb-view-${business.id}`, mode)
            } catch { /* ignore */ }
        }
    }

    const inReelMode = viewMode === 'reels' && isPro

    return (
        <>
            {/* ══════════════════════════════════════
                GRID MODE — products + reviews
            ══════════════════════════════════════ */}
            {!inReelMode && (
                <>
                    {/* Products section */}
                    <div className="max-w-4xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Products ({products.length})
                            </h2>
                            {/* Toggle only for Pro businesses */}
                            {isPro && (
                                <LayoutToggle viewMode={viewMode} onChange={handleToggle} dark={false} />
                            )}
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Package className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No products listed yet</p>
                            </div>
                        ) : (
                            <OrderCart
                                products={products}
                                businessName={business.business_name || ''}
                                whatsappNumber={whatsappNumber}
                                instagramHandle={instagramHandle}
                            />
                        )}
                    </div>

                    {/* Reviews section (Pro only, grid only) */}
                    {isPro && (
                        <div className="max-w-4xl mx-auto px-4 pb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Customer Reviews ({reviews.length})
                            </h2>

                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <div
                                            key={review.id}
                                            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < review.rating
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {review.customer_name}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 text-sm italic">
                                                    &ldquo;{review.comment}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                                    <Star className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                                    <p className="text-gray-400">
                                        No reviews yet. Be the first to share your experience!
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 text-center">
                                <Link href={`/${slug}/review`}>
                                    <Button
                                        variant="outline"
                                        className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-bold px-8"
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Leave a Review
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ══════════════════════════════════════
                REELS MODE — full-screen overlay
                + floating toggle pill to switch back
            ══════════════════════════════════════ */}
            {inReelMode && (
                <>
                    {products.length === 0 ? (
                        // Edge case: Pro store with no products yet
                        <div className="fixed inset-0 z-20 bg-black flex items-center justify-center flex-col gap-4">
                            <Package className="w-14 h-14 text-white/20" />
                            <p className="text-white/40 font-medium">No products listed yet</p>
                        </div>
                    ) : (
                        <ShoppableReels
                            products={products}
                            business={business}
                            whatsappNumber={whatsappNumber}
                            instagramHandle={instagramHandle}
                        />
                    )}

                    {/* Floating toggle — bottom centre, z-30 (above reel, below header) */}
                    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-30">
                        <LayoutToggle viewMode={viewMode} onChange={handleToggle} dark={true} />
                    </div>
                </>
            )}
        </>
    )
}

/* ──────────────────────────────────────────
   LayoutToggle — iOS-style segmented control
   dark=true → liquid glass on black
   dark=false → subtle pill on white page
────────────────────────────────────────── */
interface LayoutToggleProps {
    viewMode: 'grid' | 'reels'
    onChange: (mode: 'grid' | 'reels') => void
    dark: boolean
}

function LayoutToggle({ viewMode, onChange, dark }: LayoutToggleProps) {
    const wrapperStyle: React.CSSProperties = dark
        ? {
            backdropFilter: 'blur(24px) saturate(220%)',
            background: 'rgba(255, 255, 255, 0.45)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 32px rgba(0,0,0,0.06)',
        }
        : {
            background: 'rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.09)',
        }

    const activeStyle = (active: boolean): React.CSSProperties =>
        dark
            ? active
                ? {
                    backdropFilter: 'blur(16px) saturate(180%)',
                    background: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)',
                    color: '#111827',
                }
                : { color: 'rgba(0,0,0,0.45)', background: 'transparent', border: '1px solid transparent' }
            : active
                ? {
                    background: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    color: '#111827',
                }
                : { color: '#9ca3af', background: 'transparent', border: '1px solid transparent' }

    return (
        <div className="flex items-center p-1 rounded-full" style={wrapperStyle}>
            <button
                id="toggle-grid-view"
                onClick={() => onChange('grid')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={activeStyle(viewMode === 'grid')}
                aria-pressed={viewMode === 'grid'}
            >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
            </button>
            <button
                id="toggle-reels-view"
                onClick={() => onChange('reels')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={activeStyle(viewMode === 'reels')}
                aria-pressed={viewMode === 'reels'}
            >
                <Film className="w-3.5 h-3.5" />
                Reels
            </button>
        </div>
    )
}
