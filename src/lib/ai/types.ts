export interface ProductRecommendation {
    id: string
    title: string
    price: string | null
    source: string
    link: string
    imageUrl?: string
    snippet?: string
    availability: 'in_stock' | 'out_of_stock' | 'unknown'
    external: boolean
    sellerSlug?: string
    sellerWhatsapp?: string
    serviceArea?: string
    paymentMethods?: string[]
    itemType?: 'product' | 'service'
    updatedAt?: string
    sellerMedianResponseHours?: number
    sellerCompletedRate?: number
    sellerOrderSampleSize?: number
    availabilityConfirmedAt?: string
}
