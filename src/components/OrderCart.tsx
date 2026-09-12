'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import type { Product, CartItem } from '@/lib/types'
import type { WebsiteTheme } from '@/lib/website-theme'
import { useCart } from '@/lib/useCart'
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    X,
    MessageCircle,
    Send,
    Package,
    Instagram
} from 'lucide-react'

interface OrderCartProps {
    products: Product[]
    businessName: string
    whatsappNumber: string
    instagramHandle?: string | null
    waWhatsappEnabled?: boolean
    businessSlug?: string
    extraBottomSpacing?: boolean
    // Shared cart props
    cart?: CartItem[]
    addToCart?: (product: Product) => void
    updateQuantity?: (productId: string, delta: number) => void
    removeFromCart?: (productId: string) => void
    clearCart?: () => void
    totalItems?: number
    totalAmount?: number
    theme?: WebsiteTheme
}

export function OrderCart({
    products,
    businessName,
    whatsappNumber,
    instagramHandle,
    waWhatsappEnabled,
    businessSlug,
    extraBottomSpacing = false,
    theme,
    ...props
}: OrderCartProps) {
    const accent = theme?.accent || '#CC5500'
    const accentHover = theme?.accentHover || '#36454F'
    const accentText = theme?.accentText || '#ffffff'
    const cardBorder = theme?.cardBorder || 'rgba(0,0,0,0.08)'
    const headingText = theme?.headingText || '#111827'
    const bodyText = theme?.bodyText || '#36454F'
    const mutedText = theme?.mutedText || '#6b7280'
    const localCartHelper = useCart(businessName)

    const cart = props.cart ?? localCartHelper.cart
    const addToCart = props.addToCart ?? localCartHelper.addToCart
    const updateQuantity = props.updateQuantity ?? localCartHelper.updateQuantity
    const removeFromCart = props.removeFromCart ?? localCartHelper.removeFromCart
    const clearCart = props.clearCart ?? localCartHelper.clearCart
    const totalItems = props.totalItems ?? localCartHelper.totalItems
    const totalAmount = props.totalAmount ?? localCartHelper.totalAmount

    const [isOpen, setIsOpen] = useState(false)
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [orderMethod, setOrderMethod] = useState<'whatsapp' | 'instagram'>('whatsapp')
    const [step, setStep] = useState<'cart' | 'details'>('cart')

    // Restore checkout info from localStorage on mount
    useEffect(() => {
        try {
            const savedName = localStorage.getItem('nb-customer-name')
            if (savedName) setCustomerName(savedName)

            const savedAddress = localStorage.getItem('nb-customer-address')
            if (savedAddress) setCustomerAddress(savedAddress)

            const savedMethod = localStorage.getItem('nb-order-method')
            if (savedMethod === 'whatsapp' || savedMethod === 'instagram') {
                setOrderMethod(savedMethod)
            }
        } catch { /* ignore */ }
    }, [])

    // Save checkout info to localStorage when they change
    useEffect(() => {
        try {
            localStorage.setItem('nb-customer-name', customerName)
        } catch { /* ignore */ }
    }, [customerName])

    useEffect(() => {
        try {
            localStorage.setItem('nb-customer-address', customerAddress)
        } catch { /* ignore */ }
    }, [customerAddress])

    useEffect(() => {
        try {
            localStorage.setItem('nb-order-method', orderMethod)
        } catch { /* ignore */ }
    }, [orderMethod])

    const handleClearCart = () => {
        clearCart()
        setStep('cart')
        setCustomerName('')
        setCustomerAddress('')
    }

    const totalItemsCalculated = totalItems
    const totalAmountCalculated = totalAmount

    const generateOrderMessage = () => {
        const itemsList = cart.map(item =>
            `• ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`
        ).join('\n')

        const prefix = waWhatsappEnabled ? `hi ${businessSlug}\n` : ''
        return `${prefix}Hello! I am ordering from your Qriblo page: *${businessName}*

*Customer Details:*
Name: ${customerName}
${customerAddress ? `Address: ${customerAddress}` : ''}

*Order Items:*
${itemsList}

*Total: ${formatPrice(totalAmount)}*

Please confirm my order. Thank you!`
    }

    const handleCheckout = () => {
        if (!customerName.trim()) return

        const message = generateOrderMessage()

        if (orderMethod === 'whatsapp') {
            const finalWaNumber = waWhatsappEnabled ? '2347047207012' : whatsappNumber
            const whatsappUrl = generateWhatsAppLink(finalWaNumber, message)
            window.open(whatsappUrl, '_blank')
        } else if (instagramHandle) {
            // For Instagram, copy message and open DM
            navigator.clipboard.writeText(message)
            window.open(`https://instagram.com/direct/t/${instagramHandle.replace('@', '')}`, '_blank')
        }

        handleClearCart()
        setIsOpen(false)
    }

    return (
        <>
            {/* Product cards with Add to Cart */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl border overflow-hidden card-hover"
                        style={{ borderColor: cardBorder }}
                    >
                        <div className="aspect-square relative bg-gray-100">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium truncate" style={{ color: headingText }}>{product.name}</h3>
                            <p className="text-lg font-bold mt-1" style={{ color: accent }}>
                                {formatPrice(product.price)}
                            </p>
                            {product.description && (
                                <p className="text-sm mt-1 line-clamp-2" style={{ color: mutedText }}>
                                    {product.description}
                                </p>
                            )}
                            <Button
                                onClick={() => addToCart(product)}
                                className="w-full mt-3"
                                style={{ backgroundColor: accent, color: accentText }}
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Floating cart button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`fixed right-3 sm:right-5 z-40 rounded-full p-4 shadow-lg transition-all animate-pulse-glow ${extraBottomSpacing ? 'bottom-24' : 'bottom-3 sm:bottom-5'}`}
                    style={{ backgroundColor: accent, color: accentText, boxShadow: `0 16px 34px ${accent}40` }}
                >
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {totalItems}
                    </span>
                </button>
            )}

            {/* Cart drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Your Order</h2>
                            <button onClick={() => setIsOpen(false)}>
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {step === 'cart' ? (
                            <>
                                {/* Cart items */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                            {item.image_url ? (
                                                <Image
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    width={60}
                                                    height={60}
                                                    className="rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-[60px] h-[60px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate" style={{ color: headingText }}>{item.name}</p>
                                                <p className="text-sm font-semibold" style={{ color: accent }}>
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-8 h-8 rounded-full text-red-500 hover:bg-red-50 flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="border-t p-4 space-y-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span style={{ color: accent }}>{formatPrice(totalAmount)}</span>
                                    </div>
                                    <Button onClick={() => setStep('details')} className="w-full" size="lg" style={{ backgroundColor: accent, color: accentText }}>
                                        Continue to Checkout
                                    </Button>
                                    <button
                                        onClick={handleClearCart}
                                        className="w-full text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Customer details */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <button
                                        onClick={() => setStep('cart')}
                                        className="text-sm hover:underline"
                                        style={{ color: accent }}
                                    >
                                        ← Back to cart
                                    </button>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:ring-2"
                                            style={{ '--tw-ring-color': `${accent}33`, borderColor: cardBorder } as React.CSSProperties}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Delivery Address (optional)
                                        </label>
                                        <textarea
                                            value={customerAddress}
                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                            placeholder="Enter your delivery address"
                                            rows={3}
                                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2"
                                            style={{ '--tw-ring-color': `${accent}33`, borderColor: cardBorder } as React.CSSProperties}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Order via
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setOrderMethod('whatsapp')}
                                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${orderMethod === 'whatsapp'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                WhatsApp
                                            </button>
                                            {instagramHandle && (
                                                <button
                                                    onClick={() => setOrderMethod('instagram')}
                                                    className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${orderMethod === 'instagram'
                                                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <Instagram className="w-5 h-5" /> Instagram
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order summary */}
                                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                                        <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                                        <div className="space-y-1 text-sm">
                                            {cart.map(item => (
                                                <div key={item.id} className="flex justify-between">
                                                    <span>{item.quantity}x {item.name}</span>
                                                    <span>{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                                                <span>Total</span>
                                                <span style={{ color: accent }}>{formatPrice(totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout button */}
                                <div className="border-t p-4">
                                    <Button
                                        onClick={handleCheckout}
                                        className="w-full"
                                        size="lg"
                                        disabled={!customerName.trim()}
                                        style={{ backgroundColor: customerName.trim() ? accent : undefined, color: customerName.trim() ? accentText : undefined }}
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        {orderMethod === 'whatsapp' 
                                            ? (waWhatsappEnabled ? 'Send Order to Assistant' : 'Send Order via WhatsApp') 
                                            : 'Send Order via Instagram'}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Your order will be sent directly to the seller
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
