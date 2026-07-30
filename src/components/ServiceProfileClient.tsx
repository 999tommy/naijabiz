'use client'

import React, { useMemo, useState } from 'react'
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
import type { Product, User, Review } from '@/lib/types'
import { AiChatWidget } from '@/components/AiChatWidget'

interface ServiceProfileClientProps {
    products: Product[]
    business: User & { category?: { name: string }; reviewCount?: number; viewCount?: number }
    isPro: boolean
    reviews: Review[]
    averageRating: string | null
    isOwner: boolean
}

export function ServiceProfileClient({
    products,
    business,
    isPro,
    reviews,
    averageRating,
    isOwner
}: ServiceProfileClientProps) {
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const whatsappNumber = business.whatsapp_number
    const slug = business.business_slug
    const [selectedService, setSelectedService] = useState(products[0]?.name || '')
    const [preferredDate, setPreferredDate] = useState('')
    const [preferredTime, setPreferredTime] = useState('')
    const [bookingNotes, setBookingNotes] = useState('')

    const bookingMessage = useMemo(() => {
        const lines = [
            `Hi ${business.business_name}, I want to book a service.`,
            selectedService ? `Service: ${selectedService}` : '',
            preferredDate ? `Preferred date: ${preferredDate}` : '',
            preferredTime ? `Preferred time: ${preferredTime}` : '',
            bookingNotes ? `Notes: ${bookingNotes}` : '',
        ].filter(Boolean)

        return lines.join('\n')
    }, [bookingNotes, business.business_name, preferredDate, preferredTime, selectedService])

    const bookingUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(bookingMessage)}`
        : '#'

    return (
        <div className="min-h-screen bg-[#faf9f6]">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <Image src="/logo.png" alt="NaijaBiz" width={24} height={24} className="opacity-80" />
                        <span className="font-bold text-gray-900 hidden sm:inline">NaijaBiz</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        {isOwner && (
                            <Link href="/dashboard">
                                <Button variant="outline" size="sm" className="hidden sm:flex border-gray-200 text-gray-700 hover:bg-gray-50">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                        <BusinessShareButton businessName={business.business_name || 'Business'} />
                        {whatsappNumber && (
                            <a href="#booking-panel">
                                <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-5">
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
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                                {business.business_name}
                            </h1>
                            {(isPro || (business.reviewCount && business.reviewCount >= 5)) && (
                                <VerifiedBadge size="md" isCommunityVerified={!isPro} />
                            )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 mb-6">
                            {business.category && (
                                <span className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-700 shadow-sm">
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
                            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-8">
                                {business.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {whatsappNumber && (
                                <a href="#booking-panel">
                                    <Button className="h-12 px-8 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-600/20">
                                        <CalendarCheck className="w-5 h-5 mr-2" /> Book Now
                                    </Button>
                                </a>
                            )}
                            {business.instagram_handle && (
                                <a href={`https://instagram.com/${business.instagram_handle}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="h-12 px-6 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold">
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
                                <h2 className="text-2xl font-black text-gray-900">Services & Packages</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Choose a service, then send your preferred date and time on WhatsApp.
                                </p>
                            </div>
                            {isPro && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Priority booking display
                                </span>
                            )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex gap-4">
                                    {product.image_url && (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1">{product.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-2 flex-1">
                                            {product.description || 'Professional service offering.'}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="font-black text-gray-900 text-lg">
                                                {formatPrice(product.price)}
                                            </span>
                                            {whatsappNumber && (
                                                <a
                                                    href="#booking-panel"
                                                    onClick={() => setSelectedService(product.name)}
                                                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-900 hover:text-white transition-colors"
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
                {whatsappNumber && products.length > 0 && (
                    <div id="booking-panel" className="mb-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-green-700 mb-2">Request an appointment</p>
                                <h2 className="text-2xl font-black text-gray-900">Send a complete booking request</h2>
                                <p className="text-sm text-gray-500 mt-2 max-w-xl">
                                    Pick the service, date, and time. NaijaBiz prepares a structured WhatsApp message so the business gets the details clearly.
                                </p>
                            </div>
                            {isPro && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 shrink-0">
                                    <CalendarCheck className="w-3.5 h-3.5" /> AI booking assistant enabled
                                </span>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="service" className="text-sm font-bold text-gray-700">Service</label>
                                <select
                                    id="service"
                                    value={selectedService}
                                    onChange={(event) => setSelectedService(event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                >
                                    {products.map(product => (
                                        <option key={product.id} value={product.name}>{product.name}</option>
                                    ))}
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
                                    <input
                                        id="time"
                                        type="time"
                                        value={preferredTime}
                                        onChange={(event) => setPreferredTime(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                                    />
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
                                WhatsApp-first today. The business confirms availability and payment directly with you.
                            </p>
                            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold">
                                    Send Booking Request <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </a>
                        </div>
                    </div>
                )}

                {/* Reviews */}
                {isPro && (
                    <div className="mb-16">
                        <h2 className="text-2xl font-black text-gray-900 mb-6">Client Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 italic mb-4">"{review.comment}"</p>
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm text-gray-900">{review.customer_name}</p>
                                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500">No reviews yet.</p>
                            </div>
                        )}
                        <div className="mt-6 text-center">
                            <Link href={`/${slug}/review`}>
                                <Button variant="outline" className="border-gray-300 text-gray-700 font-semibold rounded-full px-8">
                                    Leave a Review
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </main>
            
            <AiChatWidget business={business} />
        </div>
    )
}
