import Link from 'next/link'
import Image from 'next/image'
import { User } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { MapPin, ExternalLink } from 'lucide-react'

interface BusinessCardProps {
    business: User & { category?: { name: string; icon: string } }
    rank?: number
    isNew?: boolean
}

export function BusinessCard({ business, rank, isNew }: BusinessCardProps) {
    return (
        <Link href={`/${business.business_slug}`}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 card-hover group">
                <div className="flex items-start gap-4">
                    {/* Rank number */}
                    {rank && (
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 font-semibold">
                            {rank}
                        </div>
                    )}

                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {business.logo_url ? (
                            <Image
                                src={business.logo_url}
                                alt={business.business_name || ''}
                                width={64}
                                height={64}
                                className="rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                                {business.business_name?.[0]?.toUpperCase() || 'B'}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                {business.business_name}
                            </h3>
                            {business.is_verified && business.plan === 'pro' && (
                                <VerifiedBadge size="sm" showText={false} />
                            )}
                            {isNew && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                    NEW
                                </span>
                            )}
                        </div>

                        {business.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {business.description}
                            </p>
                        )}

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            {business.category && (
                                <span className="flex items-center gap-1">
                                    <span>{business.category.icon}</span>
                                    <span>{business.category.name}</span>
                                </span>
                            )}
                            {business.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{business.location}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Visit arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

interface ProductCardMiniProps {
    product: {
        name: string
        price: number
        image_url: string | null
    }
}

export function ProductCardMini({ product }: ProductCardMiniProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
            {product.image_url ? (
                <Image
                    src={product.image_url}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded object-cover"
                />
            ) : (
                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                    📦
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                <p className="text-xs text-orange-600 font-semibold">{formatPrice(product.price)}</p>
            </div>
        </div>
    )
}
