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
    logo_url: string | null
    is_verified: boolean
    verification_document_url: string | null
    verification_status: 'none' | 'pending' | 'approved' | 'rejected'
    plan: 'free' | 'pro'
    subscription_id: string | null
    subscription_ends_at: string | null
    created_at: string
    updated_at: string
    category?: Category
}

export interface Product {
    id: string
    user_id: string
    name: string
    price: number
    description: string | null
    image_url: string | null
    is_active: boolean
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
