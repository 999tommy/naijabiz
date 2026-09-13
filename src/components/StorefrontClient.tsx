'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, CalendarCheck, LayoutGrid, Film, Star, Package } from 'lucide-react'
import Link from 'next/link'
import { OrderCart } from '@/components/OrderCart'
import { ShoppableReels } from '@/components/ShoppableReels'
import { Button } from '@/components/ui/button'
import type { Product, User, Review } from '@/lib/types'
import { useCart } from '@/lib/useCart'
import type { WebsiteTheme } from '@/lib/website-theme'

interface StorefrontClientProps {
    products: Product[]
    business: User & { category?: { name: string }; reviewCount?: number; viewCount?: number }
    isPro: boolean
    reviews: Review[]
    slug: string
    averageRating: string | null
    whatsappNumber: string
    instagramHandle?: string | null
    waWhatsappEnabled?: boolean
    reviewHref?: string
    theme?: WebsiteTheme
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
    waWhatsappEnabled,
    reviewHref,
    theme,
}: StorefrontClientProps) {
    // Default to Grid for all businesses
    const [viewMode, setViewMode] = useState<'grid' | 'reels'>('grid')
    const cartHelper = useCart(business.business_name || '')
    const productItems = products.filter(product => product.item_type !== 'service')
    const serviceItems = products.filter(product => product.item_type === 'service')
    const showHybridBookings = business.business_type === 'both'
    const fallbackServiceName = 'General appointment'
    const [selectedService, setSelectedService] = useState(serviceItems[0]?.name || fallbackServiceName)
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [bookingNotes, setBookingNotes] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [bookingError, setBookingError] = useState('')

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

    // Lock body and html scroll when reels are active so only the reel container scrolls
    useEffect(() => {
        if (viewMode === 'reels' && isPro) {
            document.documentElement.style.overflow = 'hidden'
            document.documentElement.style.height = '100dvh'
            document.body.style.overflow = 'hidden'
            document.body.style.height = '100dvh'
        } else {
            document.documentElement.style.overflow = ''
            document.documentElement.style.height = ''
            document.body.style.overflow = ''
            document.body.style.height = ''
        }
        return () => {
            document.documentElement.style.overflow = ''
            document.documentElement.style.height = ''
            document.body.style.overflow = ''
            document.body.style.height = ''
        }
    }, [viewMode, isPro])

    useEffect(() => {
        if (!preferredDate || !showHybridBookings) return
        setBookingError('')
        setAvailableSlots([])
        setPreferredTime('')
        fetch(`/api/bookings?business_id=${business.id}&date=${preferredDate}`)
            .then(response => response.json())
            .then(data => setAvailableSlots(data.slots || []))
            .catch(() => setBookingError('Could not load availability. Please try again.'))
    }, [business.id, preferredDate, showHybridBookings])

    const submitBooking = async () => {
        if (!customerName.trim() || !customerPhone.trim() || !selectedService || !preferredDate || !preferredTime) {
            setBookingState('error')
            setBookingError('Please add your name, phone number, appointment type, date, and time before confirming.')
            return
        }

        setBookingState('loading')
        setBookingError('')
        const service = serviceItems.find(item => item.name === selectedService)
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                business_id: business.id,
                service_id: service?.id,
                service_name: selectedService,
                customer_name: customerName,
                customer_phone: customerPhone,
                booking_date: preferredDate,
                booking_time: preferredTime,
                notes: bookingNotes,
            }),
        })
        const data = await response.json()
        if (!response.ok) {
            setBookingState('error')
            setBookingError(data.error || 'Could not create booking')
            return
        }
        setBookingState('success')
    }

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
                            <h2 className="text-xl font-semibold" style={theme ? { color: theme.headingText } : undefined}>
                                {showHybridBookings ? `Products (${productItems.length})` : `Products (${products.length})`}
                            </h2>
                            {/* Toggle only for Pro businesses */}
                            {isPro && (
                                <LayoutToggle viewMode={viewMode} onChange={handleToggle} dark={false} />
                            )}
                        </div>

                        {(showHybridBookings ? productItems : products).length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Package className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-medium">No products listed yet</p>
                            </div>
                        ) : (
                            <OrderCart
                                products={showHybridBookings ? productItems : products}
                                businessName={business.business_name || ''}
                                whatsappNumber={whatsappNumber}
                                instagramHandle={instagramHandle}
                                waWhatsappEnabled={waWhatsappEnabled}
                                businessSlug={slug}
                                cart={cartHelper.cart}
                                addToCart={cartHelper.addToCart}
                                updateQuantity={cartHelper.updateQuantity}
                                removeFromCart={cartHelper.removeFromCart}
                                clearCart={cartHelper.clearCart}
                                totalItems={cartHelper.totalItems}
                                totalAmount={cartHelper.totalAmount}
                                theme={theme}
                            />
                        )}
                    </div>

                    {showHybridBookings && (
                        <div id="booking-panel" className="max-w-4xl mx-auto px-4 pb-10">
                            <div className="bg-white rounded-2xl border shadow-sm p-5 sm:p-6" style={theme ? { borderColor: theme.cardBorder } : undefined}>
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={theme ? { color: theme.accent } : undefined}>Bookings</p>
                                        <h2 className="text-2xl font-black" style={theme ? { color: theme.headingText } : undefined}>Book an appointment</h2>
                                        <p className="text-sm mt-1" style={theme ? { color: theme.mutedText } : undefined}>
                                            {serviceItems.length > 0 ? 'Choose one of the services from this hybrid brand and request an available slot.' : 'Request an appointment with this hybrid brand. The business can add specific service listings later.'}
                                        </p>
                                    </div>
                                    <CalendarCheck className="w-9 h-9" style={theme ? { color: theme.accent } : undefined} />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="customer-name" className="text-sm font-bold text-gray-700">Name</label>
                                        <input id="customer-name" value={customerName} onChange={event => setCustomerName(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="customer-phone" className="text-sm font-bold text-gray-700">Phone</label>
                                        <input id="customer-phone" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="service" className="text-sm font-bold text-gray-700">Appointment type</label>
                                        <select id="service" value={selectedService} onChange={event => setSelectedService(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium">
                                            {serviceItems.length > 0
                                                ? serviceItems.map(service => <option key={service.id} value={service.name}>{service.name}</option>)
                                                : <option value={fallbackServiceName}>{fallbackServiceName}</option>}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label htmlFor="date" className="text-sm font-bold text-gray-700">Date</label>
                                            <input id="date" type="date" value={preferredDate} onChange={event => setPreferredDate(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="time" className="text-sm font-bold text-gray-700">Time</label>
                                            <select id="time" value={preferredTime} onChange={event => setPreferredTime(event.target.value)} disabled={!preferredDate || availableSlots.length === 0} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium">
                                                <option value="">Select a slot</option>
                                                {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label htmlFor="notes" className="text-sm font-bold text-gray-700">Notes</label>
                                        <textarea id="notes" value={bookingNotes} onChange={event => setBookingNotes(event.target.value)} rows={3} placeholder="Add your address, preferred style, issue, or anything the business should know..." className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium" />
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        {preferredDate && availableSlots.length === 0 ? 'No available slot for this date. Try another date.' : availableSlots.length ? `${availableSlots.length} available slots. Bookings use Africa/Lagos time.` : 'Choose a date to see available slots.'}
                                    </p>
                                    <Button onClick={submitBooking} disabled={bookingState === 'loading'} className="w-full sm:w-auto text-white font-bold" style={theme ? { backgroundColor: theme.accent, color: theme.accentText } : undefined}>
                                        {bookingState === 'success' ? 'Booking confirmed' : bookingState === 'loading' ? 'Booking...' : 'Confirm booking'} <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                                {bookingError && <p className="mt-3 text-sm text-red-600">{bookingError}</p>}
                                {bookingState === 'success' && <p className="mt-3 text-sm text-green-700">Your appointment is confirmed. The business has received the booking.</p>}
                            </div>
                        </div>
                    )}

                    {/* Reviews section */}
                    <div className="max-w-4xl mx-auto px-4 pb-8">
                            <h2 className="text-xl font-semibold mb-6" style={theme ? { color: theme.headingText } : undefined}>
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
                                <Link href={reviewHref || `/${slug}/review`}>
                                    <Button
                                        variant="outline"
                                        className="font-bold px-8"
                                        style={theme ? { borderColor: theme.accent, color: theme.accent } : undefined}
                                    >
                                        <Star className="w-4 h-4 mr-2" />
                                        Leave a Review
                                    </Button>
                                </Link>
                            </div>
                    </div>
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
                            cart={cartHelper.cart}
                            addToCart={cartHelper.addToCart}
                            updateQuantity={cartHelper.updateQuantity}
                            removeFromCart={cartHelper.removeFromCart}
                            clearCart={cartHelper.clearCart}
                            totalItems={cartHelper.totalItems}
                            totalAmount={cartHelper.totalAmount}
                            theme={theme}
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
                type="button"
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
                type="button"
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
