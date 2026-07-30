import type { Metadata } from 'next'
import { ServiceProfileClient } from '@/components/ServiceProfileClient'

const business = {
    id: 'mock-service-musa-001',
    email: 'hello@musafix.ng',
    phone: null,
    business_name: 'MusaFix Electricals',
    business_slug: 'musafix-electricals',
    description: 'Licensed residential and small-office electrician in Lagos. Book fault tracing, wiring checks, inverter installation, and emergency repairs with clear pricing and fast WhatsApp response.',
    location: 'Yaba, Lagos',
    category_id: 'mock-artisan-services',
    whatsapp_number: '2349116891270',
    instagram_handle: 'musafixelectricals',
    tiktok_handle: null,
    logo_url: null,
    is_verified: true,
    verification_document_url: null,
    verification_status: 'approved',
    plan: 'pro',
    subscription_id: null,
    subscription_ends_at: null,
    referral_count: 0,
    referred_by: null,
    has_joined_referral: false,
    referral_payment_details: null,
    upvotes: 86,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ai_enabled: true,
    ai_instructions: 'Ask for the customer address, preferred appointment date, electrical issue, and whether it is urgent. Explain that final prices may change after inspection.',
    ai_welcome_msg: 'Hello, this is MusaFix Electricals. What electrical issue do you need help with, and when would you like us to come?',
    ai_usage_limit: 100,
    ai_usage_count: 12,
    ai_persona: 'friendly',
    business_type: 'services',
    category: {
        id: 'mock-artisan-services',
        name: 'Home Services',
        slug: 'home-services',
        icon: '🔧',
    },
    reviewCount: 7,
    viewCount: 324,
}

const services = [
    {
        id: 'svc-1',
        user_id: business.id,
        name: 'Home Wiring Inspection',
        price: 12000,
        description: 'Full safety check for sockets, switches, breakers, exposed wiring, and load balance. Best before moving into a new apartment.',
        image_url: null,
        is_active: true,
        in_stock: true,
        item_type: 'service',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'svc-2',
        user_id: business.id,
        name: 'Emergency Fault Repair',
        price: 18000,
        description: 'Rapid troubleshooting for partial power loss, tripping breakers, burnt sockets, and urgent electrical faults.',
        image_url: null,
        is_active: true,
        in_stock: true,
        item_type: 'service',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'svc-3',
        user_id: business.id,
        name: 'Inverter Installation Quote',
        price: 35000,
        description: 'Site inspection and installation planning for inverter, battery, and changeover setup. Final quote depends on load requirements.',
        image_url: null,
        is_active: true,
        in_stock: true,
        item_type: 'service',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: 'svc-4',
        user_id: business.id,
        name: 'Appliance Power Point Setup',
        price: 15000,
        description: 'Install or relocate dedicated power points for AC units, washing machines, cookers, freezers, and office equipment.',
        image_url: null,
        is_active: true,
        in_stock: true,
        item_type: 'service',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
]

const reviews = [
    {
        id: 'rev-musa-1',
        business_id: business.id,
        customer_name: 'Nkechi A.',
        customer_contact: 'hidden',
        rating: 5,
        comment: 'Musa found the fault quickly and explained what caused the breaker issue. Very professional.',
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'rev-musa-2',
        business_id: business.id,
        customer_name: 'Tunde O.',
        customer_contact: 'hidden',
        rating: 5,
        comment: 'Booked an inverter installation inspection. Clear pricing, came on time, and gave a proper quote.',
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'rev-musa-3',
        business_id: business.id,
        customer_name: 'Mariam B.',
        customer_contact: 'hidden',
        rating: 4,
        comment: 'Good service. He fixed two sockets and checked the rest of the apartment.',
        is_verified: true,
        order_id: null,
        created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
]

export const metadata: Metadata = {
    title: 'MusaFix Electricals - Service Brand Demo | NaijaBiz',
    description: 'A NaijaBiz Pro service brand demo for an artisan electrician accepting bookings through a branded business link.',
}

export default function MusaFixElectricalsPage() {
    const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)

    return (
        <>
            <div className="text-center py-2 text-xs font-bold uppercase tracking-widest bg-[#15382b] text-white">
                This is an example Pro service website - create yours free on NaijaBiz
            </div>
            <ServiceProfileClient
                business={business as any}
                products={services as any}
                reviews={reviews as any}
                averageRating={averageRating}
                isPro={true}
                isOwner={false}
            />
        </>
    )
}
