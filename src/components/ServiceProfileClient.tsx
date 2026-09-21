'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    MapPin,
    Star,
    Instagram,
    LayoutDashboard,
    CheckCircle2,
    CalendarCheck,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { UpvoteButton } from '@/components/UpvoteButton'
import { BusinessShareButton } from '@/components/BusinessShareButton'
import { getCategoryIcon } from '@/lib/category-icons'
import GradientText from '@/components/ui/GradientText'
import BorderBeam from 'border-beam'
import type { Product, User, Review } from '@/lib/types'
import { AiChatWidget } from '@/components/AiChatWidget'
import type { WebsiteTheme } from '@/lib/website-theme'

interface ServiceProfileClientProps {
    products: Product[]
    business: User & { category?: { name: string }; reviewCount?: number; viewCount?: number }
    isPro: boolean
    reviews: Review[]
    averageRating: string | null
    isOwner: boolean
    waWhatsappEnabled?: boolean
    reviewHref?: string
    theme?: WebsiteTheme
}

export function ServiceProfileClient({
    products,
    business,
    isPro,
    reviews,
    averageRating,
    isOwner,
    waWhatsappEnabled,
    reviewHref,
    theme
}: ServiceProfileClientProps) {
    const pageTheme: WebsiteTheme = theme || {
        id: 'deep-teal-champagne',
        heroBg: 'linear-gradient(135deg, #004953 0%, #003153 100%)',
        heroText: '#ffffff',
        heroSubText: 'rgba(255,255,255,0.80)',
        pageBg: '#f5faf9',
        navBg: 'rgba(255,255,255,0.90)',
        accent: '#004953',
        accentHover: '#003153',
        accentText: '#ffffff',
        headingText: '#004953',
        bodyText: '#36454F',
        mutedText: 'rgba(54,69,79,0.72)',
        cardBg: '#ffffff',
        cardBorder: 'rgba(0,73,83,0.16)',
        logoRing: '#F0E68C',
        ctaBg: '#F0E68C',
        ctaText: '#004953',
        divider: 'rgba(0,73,83,0.14)',
    }
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const isVaEnabled = waWhatsappEnabled || false
    const whatsappNumber = isVaEnabled ? '2347047207012' : business.whatsapp_number
    const slug = business.business_slug
    const fallbackServiceName = 'General appointment'
    const [selectedService, setSelectedService] = useState(products[0]?.name || fallbackServiceName)
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [bookingNotes, setBookingNotes] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [customerPhone, setCustomerPhone] = useState('')
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [bookingState, setBookingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [bookingError, setBookingError] = useState('')

    useEffect(() => {
        if (!preferredDate) return
        setBookingError('')
        setAvailableSlots([])
        setPreferredTime('')
        fetch(`/api/bookings?business_id=${business.id}&date=${preferredDate}`)
            .then(response => response.json())
            .then(data => setAvailableSlots(data.slots || []))
            .catch(() => setBookingError('Could not load availability. Please try again.'))
    }, [business.id, preferredDate])

    const submitBooking = async () => {
        if (!customerName.trim() || !customerPhone.trim() || !selectedService || !preferredDate || !preferredTime) {
            setBookingState('error')
            setBookingError('Please add your name, phone number, appointment type, date, and time before confirming.')
            return
        }
        setBookingState('loading')
        setBookingError('')
        const service = products.find(item => item.name === selectedService)
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

    return (
        <div className="min-h-screen" style={{ background: pageTheme.pageBg, color: pageTheme.bodyText }}>
            {/* Header */}
            <header className="backdrop-blur-md sticky top-0 z-50 border-b" style={{ background: pageTheme.navBg, borderColor: pageTheme.divider }}>
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <Image src="/logo.png" alt="Qriblo" width={24} height={24} className="opacity-80" />
                        <span className="font-bold text-gray-900 hidden sm:inline">Qriblo</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {isOwner && (
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm" className="hidden sm:flex">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                        <BusinessShareButton businessName={business.business_name || 'Business'} />
                        {whatsappNumber && (
                            <a href="#booking-panel">
                                <Button size="sm" className="text-white rounded-full px-5" style={{ background: pageTheme.accent }}>
                                    Book Now
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row gap-8 items-start mb-16">
                    <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 relative rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100">
                        {business.logo_url ? (
                            <Image
                                src={business.logo_url}
                                alt={business.business_name || 'Logo'}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                {business.business_name?.[0]?.toUpperCase() || 'B'}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: pageTheme.headingText }}>
                                <GradientText colors={[pageTheme.accent, pageTheme.ctaBg, pageTheme.headingText]}>{business.business_name}</GradientText>
                            </h1>
                            {(isPro || (business.reviewCount && business.reviewCount >= 5)) && (
                                <VerifiedBadge size="md" isCommunityVerified={!isPro} />
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium mb-6" style={{ color: pageTheme.mutedText }}>
                            {business.category && (
                                <span className="flex items-center gap-1.5 border px-3 py-1 rounded-full shadow-sm" style={{ background: pageTheme.cardBg, borderColor: pageTheme.cardBorder, color: pageTheme.bodyText }}>
                                    {getCategoryIcon(business.category.name)} {business.category.name}
                                </span>
                            )}
                            {business.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {business.location}
                                </span>
                            )}
                            {averageRating && (
                                <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    {averageRating} ({reviews.length})
                                </span>
                            )}
                        </div>

                        {business.description && (
                            <p className="text-lg leading-relaxed max-w-2xl mb-8" style={{ color: pageTheme.mutedText }}>
                                {business.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {whatsappNumber && (
                                <a href="#booking-panel">
                                    <Button className="h-12 px-8 rounded-full text-white font-bold text-base shadow-lg" style={{ background: pageTheme.accent }}>
                                        <CalendarCheck className="w-5 h-5 mr-2" /> Book Now
                                    </Button>
                                </a>
                            )}
                            {business.instagram_handle && (
                                <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="h-12 px-6 rounded-full font-semibold" style={{ color: pageTheme.bodyText }}>
                                        <Instagram className="w-5 h-5 mr-2 text-pink-600" /> Instagram
                                    </Button>
                                </a>
                            )}
                            <UpvoteButton userId={business.id} initialUpvotes={business.upvotes || 0} size="default" />
                        </div>
                    </div>
                </div>

                {/* Services/Packages */}
                {products.length > 0 && (
                    <div className="mb-16">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                            <div>
                            <h2 className="text-2xl font-black" style={{ color: pageTheme.headingText }}>Services & Packages</h2>
                                <p className="text-sm mt-1" style={{ color: pageTheme.mutedText }}>
                                    Choose a service, then send your preferred date and time on WhatsApp.
                                </p>
                            </div>
                            {isPro && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1" style={{ color: pageTheme.accent, borderColor: pageTheme.cardBorder, background: pageTheme.cardBg }}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Priority booking display
                                </span>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div key={product.id} className="rounded-2xl p-4 sm:p-5 border shadow-sm hover:shadow-md transition-shadow group flex gap-4" style={{ background: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                                    {product.image_url && (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <h3 className="font-bold text-lg line-clamp-1 mb-1" style={{ color: pageTheme.headingText }}>{product.name}</h3>
                                        <p className="text-sm line-clamp-2 mb-2 flex-1" style={{ color: pageTheme.mutedText }}>
                                            {product.description || 'Professional service offering.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-black text-lg" style={{ color: pageTheme.headingText }}>
                                                {formatPrice(product.price)}
                                            </span>
                                            {whatsappNumber && (
                                                <a
                                                    href="#booking-panel"
                                                    onClick={() => setSelectedService(product.name)}
                                                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold transition-colors"
                                                    style={{ background: pageTheme.accent, color: pageTheme.accentText }}
                                                >
                                                    Book <ArrowRight className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Booking Request */}
                {whatsappNumber && (
                    <BorderBeam id="booking-panel" colorVariant="sunset" theme="light" size="md" duration={7} strength={0.5} borderRadius={24} className="mb-16 rounded-3xl border shadow-sm p-5 sm:p-6" style={{ background: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: pageTheme.accent }}>Request an appointment</p>
                                <h2 className="text-2xl font-black" style={{ color: pageTheme.headingText }}>Send a complete booking request</h2>
                                <p className="text-sm mt-2 max-w-xl" style={{ color: pageTheme.mutedText }}>
                                    {products.length > 0 ? 'Pick an available service slot. Your booking is confirmed instantly and the business can manage it from their dashboard.' : 'Request an available appointment slot. The business can add specific services later.'}
                                </p>
                            </div>
                            {isPro && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold border rounded-full px-3 py-1 shrink-0" style={{ color: pageTheme.accent, borderColor: pageTheme.cardBorder, background: pageTheme.pageBg }}>
                                    <CalendarCheck className="w-3.5 h-3.5" /> AI booking assistant enabled
                                </span>
                            )}
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
                                <select
                                    id="service"
                                    value={selectedService}
                                    onChange={(event) => setSelectedService(event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                >
                                    {products.length > 0
                                        ? products.map(product => (
                                            <option key={product.id} value={product.name}>{product.name}</option>
                                        ))
                                        : <option value={fallbackServiceName}>{fallbackServiceName}</option>}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label htmlFor="date" className="text-sm font-bold text-gray-700">Date</label>
                                    <input
                                        id="date"
                                        type="date"
                                        value={preferredDate}
                                        onChange={(event) => setPreferredDate(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="time" className="text-sm font-bold text-gray-700">Time</label>
                                    <select
                                        id="time"
                                        value={preferredTime}
                                        onChange={(event) => setPreferredTime(event.target.value)}
                                        disabled={!preferredDate || availableSlots.length === 0}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                    >
                                        <option value="">Select a slot</option>
                                        {availableSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="notes" className="text-sm font-bold text-gray-700">Notes</label>
                                <textarea
                                    id="notes"
                                    value={bookingNotes}
                                    onChange={(event) => setBookingNotes(event.target.value)}
                                    rows={3}
                                    placeholder="Add your address, issue, event type, or anything the business should know..."
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {preferredDate && availableSlots.length === 0 ? 'No available slot for this date. Try another date.' : availableSlots.length ? `${availableSlots.length} available slots. Bookings use Africa/Lagos time.` : 'Choose a date to see available slots.'}
                            </p>
                            <Button onClick={submitBooking} disabled={bookingState === 'loading'} className="w-full sm:w-auto text-white font-bold" style={{ background: pageTheme.accent }}>
                                {bookingState === 'success' ? 'Booking confirmed' : bookingState === 'loading' ? 'Booking...' : 'Confirm booking'} <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                        {bookingError && <p className="mt-3 text-sm text-red-600">{bookingError}</p>}
                        {bookingState === 'success' && <p className="mt-3 text-sm text-green-700">Your appointment is confirmed. The business has received the booking.</p>}
                    </BorderBeam>
                )}

                {/* Reviews */}
                <div className="mb-16">
                        <h2 className="text-2xl font-black mb-6" style={{ color: pageTheme.headingText }}>Client Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-5 rounded-2xl border shadow-sm" style={{ background: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        {review.comment && <p className="text-gray-700 italic mb-4">&ldquo;{review.comment}&rdquo;</p>}
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm text-gray-900">{review.customer_name}</p>
                                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 rounded-2xl border border-dashed" style={{ background: pageTheme.cardBg, borderColor: pageTheme.cardBorder }}>
                                <p style={{ color: pageTheme.mutedText }}>No reviews yet.</p>
                            </div>
                        )}
                        <div className="mt-6 text-center">
                            <Link href={reviewHref || `/${slug}/review`}>
                                <Button variant="outline" className="font-semibold rounded-full px-8" style={{ borderColor: pageTheme.accent, color: pageTheme.accent }}>
                                    Leave a Review
                                </Button>
                            </Link>
                        </div>
                    </div>
            </main>
            
            <AiChatWidget business={business} />
        </div>
    )
}
