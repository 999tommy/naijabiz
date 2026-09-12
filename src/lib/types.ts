export interface Category {
    id: string
    name: string
    slug: string
    icon: string
}

export interface User {
    id: string
    email: string | null
    phone: string | null
    business_name: string | null
    business_slug: string | null
    description: string | null
    location: string | null
    category_id: string | null
    whatsapp_number: string | null
    instagram_handle: string | null
    tiktok_handle: string | null
    logo_url: string | null
    is_verified: boolean
    verification_document_url: string | null
    verification_status: 'none' | 'pending' | 'approved' | 'rejected'
    plan: 'free' | 'pro'
    subscription_id: string | null
    subscription_ends_at: string | null
    paystack_customer_code?: string | null
    paystack_plan_code?: string | null
    referral_count: number
    referred_by: string | null
    has_joined_referral: boolean
    referral_payment_details: any | null
    upvotes: number
    created_at: string
    updated_at: string
    category?: Category
    // AI & Business Config Fields
    ai_enabled: boolean
    ai_instructions: string | null
    ai_welcome_msg: string
    ai_usage_limit: number
    ai_usage_count: number
    ai_persona?: 'friendly' | 'formal' | 'pidgin' | 'yoruba' | 'igbo' | 'hausa'
    business_type?: 'products' | 'services' | 'both'
    // WhatsApp VA (Central Number Model)
    wa_whatsapp_enabled?: boolean
    // Bank details
    bank_name?: string | null
    account_number?: string | null
    booking_hours?: Record<string, { enabled: boolean; start: string; end: string }> | null
    booking_slot_minutes?: number | null
}

export interface Product {
    id: string
    user_id: string
    name: string
    price: number
    description: string | null
    image_url: string | null
    is_active: boolean
    in_stock?: boolean
    item_type?: 'product' | 'service'
    created_at: string
    updated_at: string
}

export interface Order {
    id: string
    user_id: string
    customer_name: string
    customer_contact: string
    items: OrderItem[]
    total_amount: number
    order_method: 'whatsapp' | 'instagram'
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    preferred_date?: string | null
    preferred_time?: string | null
    created_at: string
}

export interface OrderItem {
    product_id: string
    name: string
    price: number
    quantity: number
}

export interface Review {
    id: string
    business_id: string
    customer_name: string
    customer_contact: string
    rating: number
    comment: string | null
    is_verified: boolean
    order_id: string | null
    created_at: string
}

export interface PageView {
    id: string
    business_id: string
    viewer_ip: string | null
    viewer_user_agent: string | null
    referrer: string | null
    created_at: string
}

export interface CartItem extends Product {
    quantity: number
}

export interface ChatSession {
    id: string
    business_id: string
    customer_phone: string
    messages: { role: 'user' | 'assistant', content: string }[]
    created_at: string
    updated_at: string
}

export interface Booking {
    id: string
    business_id: string
    service_id: string | null
    service_name: string
    customer_name: string
    customer_phone: string
    booking_date: string
    booking_time: string
    notes: string | null
    status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed'
    created_at: string
    updated_at: string
}
