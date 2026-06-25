'use client'

import { useState, useEffect } from 'react'
import type { Product, CartItem } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export function useCart(businessName: string) {
    const [cart, setCart] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load initial cart state on client mount
    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            const saved = localStorage.getItem(`nb-cart-${businessName}`)
            if (saved) {
                setCart(JSON.parse(saved))
            }
        } catch (e) {
            console.error('Failed to load cart from localStorage:', e)
        }
        setIsLoaded(true)
    }, [businessName])

    // Save cart state to localStorage on changes
    useEffect(() => {
        if (!isLoaded || typeof window === 'undefined') return
        try {
            localStorage.setItem(`nb-cart-${businessName}`, JSON.stringify(cart))
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e)
        }
    }, [cart, businessName, isLoaded])

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev =>
            prev
                .map(item => {
                    if (item.id === productId) {
                        const newQty = item.quantity + delta
                        return newQty > 0 ? { ...item, quantity: newQty } : item
                    }
                    return item
                })
                .filter(item => item.quantity > 0)
        )
    }

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId))
    }

    const clearCart = () => setCart([])

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const generateOrderMessage = (customerName?: string, customerAddress?: string) => {
        const itemsList = cart
            .map(item => `• ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`)
            .join('\n')

        return `Hello! I am ordering from your NaijaBiz page: *${businessName}*

*Customer Details:*
Name: ${customerName || 'Not provided'}
${customerAddress ? `Address: ${customerAddress}` : ''}

*Order Items:*
${itemsList}

*Total: ${formatPrice(totalAmount)}*

Please confirm my order. Thank you!`
    }

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
        generateOrderMessage,
    }
}
