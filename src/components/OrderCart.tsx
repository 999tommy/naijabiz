'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import type { Product, CartItem } from '@/lib/types'
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
    extraBottomSpacing?: boolean
}

export function OrderCart({ products, businessName, whatsappNumber, instagramHandle, extraBottomSpacing = false }: OrderCartProps) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [orderMethod, setOrderMethod] = useState<'whatsapp' | 'instagram'>('whatsapp')
    const [step, setStep] = useState<'cart' | 'details'>('cart')

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === productId) {
                    const newQty = item.quantity + delta
                    return newQty > 0 ? { ...item, quantity: newQty } : item
                }
                return item
            }).filter(item => item.quantity > 0)
        })
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const clearCart = () => {
        setCart([])
        setStep('cart')
        setCustomerName('')
        setCustomerAddress('')
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const generateOrderMessage = () => {
        const itemsList = cart.map(item =>
            `• ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`
        ).join('\n')

        return `Hello! I am ordering from your NaijaBiz page: *${businessName}*

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
            const whatsappUrl = generateWhatsAppLink(whatsappNumber, message)
            window.open(whatsappUrl, '_blank')
        } else if (instagramHandle) {
            // For Instagram, copy message and open DM
            navigator.clipboard.writeText(message)
            window.open(`https://instagram.com/direct/t/${instagramHandle.replace('@', '')}`, '_blank')
        }

        clearCart()
        setIsOpen(false)
    }

    return (
        <>
            {/* Product cards with Add to Cart */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover"
                    >
                        <div className="aspect-square relative bg-gray-100">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <Package className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                            <p className="text-lg font-bold text-orange-600 mt-1">
                                {formatPrice(product.price)}
                            </p>
                            {product.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                    {product.description}
                                </p>
                            )}
                            <Button
                                onClick={() => addToCart(product)}
                                className="w-full mt-3"
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
                    className={`fixed right-6 z-40 bg-orange-500 text-white rounded-full p-4 shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition-all animate-pulse-glow ${extraBottomSpacing ? 'bottom-24' : 'bottom-6'}`}
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
                                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-sm text-orange-600 font-semibold">
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
                                        <span className="text-orange-600">{formatPrice(totalAmount)}</span>
                                    </div>
                                    <Button onClick={() => setStep('details')} className="w-full" size="lg">
                                        Continue to Checkout
                                    </Button>
                                    <button
                                        onClick={clearCart}
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
                                        className="text-sm text-orange-600 hover:underline"
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
                                            className="w-full h-11 px-4 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                                                <span className="text-orange-600">{formatPrice(totalAmount)}</span>
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
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Order via {orderMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
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
