'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/useCart'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import type { Product, User } from '@/lib/types'
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    X,
    MessageCircle,
    Send,
    Package,
    Instagram,
    ChevronDown,
} from 'lucide-react'

// ─── Shared glass style (light / Apple liquid-glass aesthetic — thin water glass) ───────────────
const glass = {
    backdropFilter: 'blur(16px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1px 0 rgba(0, 0, 0, 0.01), 0 4px 16px rgba(0, 0, 0, 0.03)',
} as React.CSSProperties

const glassStrong = {
    backdropFilter: 'blur(20px) saturate(190%)',
    background: 'rgba(255, 255, 255, 0.28)',
    border: '1px solid rgba(255, 255, 255, 0.35)',
    boxShadow:
        'inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.02), 0 -4px 32px rgba(0, 0, 0, 0.04)',
} as React.CSSProperties

// ─── TikTok icon ──────────────────────────────────────────────────────────────
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    )
}

// ─── Individual slide (owns its own 360° rotation state) ─────────────────────
interface SlideProps {
    product: Product
    business: User & { category?: { name: string } }
    index: number
    total: number
    whatsappNumber: string
    instagramHandle?: string | null
    onAdd: (product: Product) => void
    isFirst: boolean
    setRef: (el: HTMLDivElement | null) => void
    currentIndex: number
}

function ProductSlide({
    product, business, index, total, whatsappNumber, instagramHandle,
    onAdd, isFirst, setRef, currentIndex,
}: SlideProps) {
    const [rotateY, setRotateY] = useState(0)
    const [rotateX, setRotateX] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [showHint, setShowHint] = useState(true)
    const [aspectRatio, setAspectRatio] = useState<number | null>(null)
    const [localJustAdded, setLocalJustAdded] = useState(false)
    const lastPos = useRef<{ x: number; y: number } | null>(null)
    const imgContainerRef = useRef<HTMLDivElement>(null)

    const tiktokHandle = business.tiktok_handle
    const isPortrait = aspectRatio !== null && aspectRatio < 0.85

    const handleAddToCart = () => {
        onAdd(product)
        setLocalJustAdded(true)
        setTimeout(() => setLocalJustAdded(false), 1500)
    }

    const onPointerDown = (e: React.PointerEvent) => {
        if (!product.image_url) return
        setIsDragging(true)
        setShowHint(false)
        lastPos.current = { x: e.clientX, y: e.clientY }
        imgContainerRef.current?.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !lastPos.current) return
        const dx = e.clientX - lastPos.current.x
        const dy = e.clientY - lastPos.current.y
        setRotateY(p => p + dx * 0.5)
        setRotateX(p => Math.max(-32, Math.min(32, p - dy * 0.3)))
        lastPos.current = { x: e.clientX, y: e.clientY }
    }
    const onPointerUp = () => { setIsDragging(false); lastPos.current = null }

    return (
        <div
            ref={setRef}
            className="relative w-full flex-shrink-0 overflow-x-hidden"
            style={{ height: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', backgroundColor: '#ffffff' } as React.CSSProperties}
        >
            {/* Blurred ambient background — only render for visible and adjacent slides to prevent GPU scroll lag */}
            {Math.abs(currentIndex - index) <= 1 && !isPortrait && product.image_url && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image
                        src={product.image_url} alt="" fill aria-hidden
                        className="scale-110"
                        style={{ objectFit: 'cover', filter: 'blur(52px) brightness(1.05) saturate(1.1)', opacity: 0.45 }}
                        unoptimized={product.image_url.includes('supabase.co')}
                        priority={isFirst}
                    />
                </div>
            )}
            {/* Light frosted wash */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: isPortrait ? 'transparent' : 'rgba(255,255,255,0.2)' }} />

            {/* ── BRAND STRIP (top-left) ── */}
            <div className="absolute top-20 left-4 z-10">
                <div
                    className="flex flex-col gap-2 pl-2.5 pr-5 pt-2.5 pb-2.5 rounded-2xl min-w-[200px]"
                    style={glass}
                >
                    {/* Logo + name row */}
                    <div className="flex items-center gap-2">
                        {business.logo_url ? (
                            <Image
                                src={business.logo_url} alt={business.business_name || ''}
                                width={28} height={28}
                                className="rounded-full flex-shrink-0"
                                style={{ objectFit: 'cover', width: 28, height: 28 }}
                                unoptimized={business.logo_url.includes('supabase.co')}
                            />
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(business.business_name || 'B')[0].toUpperCase()}
                            </div>
                        )}
                        <span className="text-gray-900 font-extrabold text-sm max-w-[160px] truncate" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>
                            {business.business_name}
                        </span>
                    </div>

                    {/* Social icon row (aligned directly below name) */}
                    {(whatsappNumber || instagramHandle || tiktokHandle) && (
                        <div className="flex items-center gap-3.5 pl-[36px]">
                            {whatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber}`}
                                    target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    aria-label="WhatsApp"
                                    className="text-green-600 hover:text-green-700 transition-colors"
                                >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {instagramHandle && (
                                <a
                                    href={`https://instagram.com/${instagramHandle.replace('@', '')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    aria-label="Instagram"
                                    className="text-pink-500 hover:text-pink-600 transition-colors"
                                >
                                    <Instagram className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {tiktokHandle && (
                                <a
                                    href={`https://tiktok.com/@${tiktokHandle.replace('@', '')}`}
                                    target="_blank" rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    aria-label="TikTok"
                                    className="text-gray-900 hover:text-gray-600 transition-colors"
                                >
                                    <TikTokIcon className="w-3.5 h-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── SLIDE COUNTER (top-right) ── */}
            <div className="absolute top-20 right-4 z-10">
                <div
                    className="px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700"
                    style={glass}
                >
                    {index + 1} / {total}
                </div>
            </div>

            {/* ── ACTION RAIL (anchored to slide to avoid collisions) ── */}
            <div className="absolute right-3 bottom-[230px] z-20 flex flex-col gap-3.5 items-center">
                {/* WhatsApp */}
                {whatsappNumber && (
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi! I saw *${product.name}* (${formatPrice(product.price)}) on ${business.business_name}'s NaijaBiz store. Is it available? 🛍️`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 group"
                        aria-label="Chat on WhatsApp"
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="w-11 h-11 rounded-[16px] flex items-center justify-center transition-transform duration-100 active:scale-90"
                            style={glass}
                        >
                            <MessageCircle className="w-5 h-5 text-gray-800" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.7)' }}>Chat</span>
                    </a>
                )}

                {/* Add to Cart */}
                <button
                    onClick={e => { e.stopPropagation(); handleAddToCart() }}
                    className="flex flex-col items-center gap-1"
                    aria-label="Add to cart"
                >
                    <div
                        className="w-11 h-11 rounded-[16px] flex items-center justify-center active:scale-90"
                        style={{
                            ...glass,
                            background: localJustAdded ? 'rgba(249,115,22,0.22)' : 'rgba(255,255,255,0.12)',
                            border: localJustAdded ? '1px solid rgba(249,115,22,0.45)' : '1px solid rgba(255,255,255,0.3)',
                            transition: 'background 0.2s, border 0.2s',
                        }}
                    >
                        {/* CSS-only swap — no Framer wait delay */}
                        <span
                            className="text-orange-600 font-extrabold text-base"
                            style={{ display: localJustAdded ? 'block' : 'none' }}
                        >
                            ✓
                        </span>
                        <Plus
                            className="w-5 h-5 text-gray-800"
                            style={{ display: localJustAdded ? 'none' : 'block' }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-gray-700" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.7)' }}>Add</span>
                </button>
            </div>

            {/* ── IMAGE AREA (dynamic fit) ── */}
            <div
                className="absolute left-0 right-0 flex items-center justify-center"
                style={
                    isPortrait
                        ? { top: '0px', bottom: '0px', zIndex: 1 }
                        : { top: '148px', bottom: '220px', zIndex: 1 }
                }
            >
                <div
                    ref={imgContainerRef}
                    className="w-full h-full flex items-center justify-center select-none"
                    style={{
                        perspective: '900px',
                        cursor: product.image_url ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        touchAction: 'pan-y',
                    }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                >
                    {product.image_url ? (
                        <div
                            className="relative"
                            style={{
                                width: '100%',
                                height: isPortrait ? '100dvh' : '100%',
                                transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            <Image
                                src={product.image_url}
                                alt={product.name}
                                fill={isPortrait}
                                width={isPortrait ? undefined : 900}
                                height={isPortrait ? undefined : 900}
                                onLoad={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    if (img.naturalWidth && img.naturalHeight) {
                                        setAspectRatio(img.naturalWidth / img.naturalHeight);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    height: isPortrait ? '100%' : 'auto',
                                    maxHeight: isPortrait ? '100%' : '100%',
                                    objectFit: isPortrait ? 'cover' : 'contain',
                                    borderRadius: isPortrait ? '0px' : '16px',
                                    display: 'block',
                                    filter: isPortrait ? 'none' : 'drop-shadow(0 8px 28px rgba(0,0,0,0.12))',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                } as React.CSSProperties}
                                unoptimized={product.image_url.includes('supabase.co')}
                                draggable={false}
                                priority={isFirst}
                            />

                            {/* Specular glass sheen that shifts with rotation */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 55%)',
                                    borderRadius: isPortrait ? '0px' : '16px',
                                    transform: `rotateY(${-rotateY * 0.18}deg) rotateX(${-rotateX * 0.18}deg)`,
                                    transition: isDragging ? 'none' : 'transform 0.5s ease-out',
                                }}
                            />

                            {/* Drag-to-rotate hint */}
                            <AnimatePresence>
                                {showHint && (
                                    <motion.div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                        transition={{ delay: 1.2, duration: 0.4 }}
                                        style={{ zIndex: 10 }}
                                    >
                                        <motion.div
                                            animate={{ x: [0, 22, -22, 0] }}
                                            transition={{ duration: 2, repeat: 2, ease: 'easeInOut', delay: 1.6 }}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-gray-800 text-xs font-bold"
                                            style={glass}
                                        >
                                            ↔ Drag to rotate
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="w-40 h-40 flex items-center justify-center rounded-3xl" style={glass}>
                            <Package className="w-14 h-14 text-gray-300" />
                        </div>
                    )}
                </div>
            </div>

            {/* ── BOTTOM INFO CARD (light liquid glass) ── */}
            {/* pb-20 ensures the Add to Cart button clears the floating Grid/Reels toggle pill */}
            <div className="absolute bottom-0 left-0 right-0 z-10 px-3 pt-3" style={{ paddingBottom: '80px' }}>
                <div className="rounded-[28px] p-4" style={glassStrong}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-black font-extrabold text-[17px] leading-snug" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>{product.name}</h3>
                            {product.description && (
                                <p className="text-gray-800 text-sm font-medium mt-1 line-clamp-2 leading-relaxed" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>{product.description}</p>
                            )}
                        </div>
                        <div className="flex-shrink-0">
                            <span
                                className="text-xl font-black"
                                style={{
                                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {formatPrice(product.price)}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all duration-150 active:scale-[0.97]"
                        style={{
                            background: localJustAdded 
                                ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                                : 'linear-gradient(135deg, rgba(249,115,22,0.95), rgba(234,88,12,0.95))',
                            boxShadow: localJustAdded 
                                ? '0 4px 16px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.2)' 
                                : '0 4px 16px rgba(249,115,22,0.22), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                    >
                        {localJustAdded ? '✓  Added to Cart!' : '+ Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Swipe-up nudge */}
            {isFirst && total > 1 && (
                <motion.div
                    className="absolute z-10 flex flex-col items-center gap-0.5 pointer-events-none"
                    style={{ bottom: '212px', left: '50%', transform: 'translateX(-50%)' }}
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.6, repeat: 4, ease: 'easeInOut', delay: 3.5 }}
                >
                    <ChevronDown className="w-4 h-4 text-gray-500/35" />
                    <span className="text-gray-500/35 text-[10px] font-medium tracking-widest uppercase">Swipe up</span>
                </motion.div>
            )}
        </div>
    )
}

// ─── Main ShoppableReels component ───────────────────────────────────────────
interface ShoppableReelsProps {
    products: Product[]
    business: User & { category?: { name: string }; reviewCount?: number; viewCount?: number }
    whatsappNumber: string
    instagramHandle?: string | null
}

export function ShoppableReels({ products, business, whatsappNumber, instagramHandle }: ShoppableReelsProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [step, setStep] = useState<'cart' | 'details'>('cart')
    const [customerName, setCustomerName] = useState('')
    const [customerAddress, setCustomerAddress] = useState('')
    const [orderMethod, setOrderMethod] = useState<'whatsapp' | 'instagram'>('whatsapp')

    const slideRefs = useRef<(HTMLDivElement | null)[]>([])

    const { cart, addToCart, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount, generateOrderMessage } =
        useCart(business.business_name || 'this business')

    // Track visible slide via IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const idx = slideRefs.current.findIndex(r => r === entry.target)
                        if (idx !== -1) setCurrentIndex(idx)
                    }
                })
            },
            { threshold: 0.55 }
        )
        const refs = slideRefs.current
        refs.forEach(r => { if (r) observer.observe(r) })
        return () => observer.disconnect()
    }, [products])

    const handleAddToCart = (product: Product) => {
        addToCart(product)
    }

    const handleCheckout = () => {
        if (!customerName.trim()) return
        const message = generateOrderMessage(customerName, customerAddress)
        if (orderMethod === 'whatsapp') {
            window.open(generateWhatsAppLink(whatsappNumber, message), '_blank')
        } else if (instagramHandle) {
            navigator.clipboard.writeText(message)
            window.open(`https://instagram.com/direct/t/${instagramHandle.replace('@', '')}`, '_blank')
        }
        clearCart(); setIsCartOpen(false); setStep('cart')
        setCustomerName(''); setCustomerAddress('')
    }

    return (
        <>
            {/* ══ REEL SCROLL CONTAINER — z-20 (header at z-50 overlays naturally) ══ */}
            <div
                className="fixed inset-0 z-20 overflow-y-scroll overflow-x-hidden bg-white"
                style={{ scrollSnapType: 'y mandatory', overscrollBehaviorY: 'contain', backgroundColor: '#ffffff' } as React.CSSProperties}
            >
                {products.map((product, index) => (
                    <ProductSlide
                        key={product.id}
                        product={product}
                        business={business}
                        index={index}
                        total={products.length}
                        whatsappNumber={whatsappNumber}
                        instagramHandle={instagramHandle}
                        onAdd={handleAddToCart}
                        isFirst={index === 0}
                        setRef={el => { slideRefs.current[index] = el }}
                        currentIndex={currentIndex}
                    />
                ))}
            </div>

            {/* ══ FLOATING CART BADGE — z-30 (below header z-50, above reel z-20) ══ */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.button
                        onClick={() => setIsCartOpen(true)}
                        className="fixed right-4 top-[68px] z-30 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold"
                        initial={{ opacity: 0, scale: 0.8, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        style={{
                            backdropFilter: 'blur(20px) saturate(200%)',
                            background: 'rgba(249, 115, 22, 0.9)',
                            border: '1px solid rgba(249,115,22,0.4)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 20px rgba(249,115,22,0.35)',
                            color: '#fff',
                        }}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ══ CART DRAWER — z-[60] — LIGHT MODE ══ */}
            <AnimatePresence>
                {isCartOpen && (
                    <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div
                            className="absolute inset-0"
                            style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.22)' }}
                            onClick={() => setIsCartOpen(false)}
                        />
                        <motion.div
                            className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col"
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            style={{
                                backdropFilter: 'blur(48px) saturate(200%)',
                                background: 'rgba(248, 248, 250, 0.97)',
                                borderLeft: '1px solid rgba(0,0,0,0.07)',
                                boxShadow: '-20px 0 80px rgba(0,0,0,0.1)',
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-black/6">
                                <h2 className="text-gray-900 font-bold text-lg tracking-tight">Your Order</h2>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 hover:bg-black/8 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            {step === 'cart' ? (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-black/5 shadow-sm">
                                                {item.image_url ? (
                                                    <Image
                                                        src={item.image_url} alt={item.name}
                                                        width={56} height={56}
                                                        className="rounded-xl flex-shrink-0"
                                                        style={{ objectFit: 'contain', width: 56, height: 56, background: '#f5f5f7' }}
                                                        unoptimized={item.image_url.includes('supabase.co')}
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-gray-900 font-semibold text-sm truncate">{item.name}</p>
                                                    <p className="text-orange-500 font-bold text-sm">{formatPrice(item.price)}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                                    <span className="w-5 text-center text-gray-900 font-bold text-sm">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 space-y-3 border-t border-black/6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-medium">Total</span>
                                            <span className="text-orange-500 font-black text-xl">{formatPrice(totalAmount)}</span>
                                        </div>
                                        <button
                                            onClick={() => setStep('details')}
                                            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] transition-all active:scale-[0.97]"
                                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                                        >
                                            Continue to Checkout →
                                        </button>
                                        <button onClick={() => { clearCart(); setIsCartOpen(false) }} className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                            Clear Cart
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        <button onClick={() => setStep('cart')} className="text-orange-500 text-sm hover:underline font-medium">← Back to cart</button>

                                        <div className="space-y-1.5">
                                            <label className="text-gray-700 text-sm font-semibold block">Your Name *</label>
                                            <input
                                                type="text" value={customerName}
                                                onChange={e => setCustomerName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-4 py-3 rounded-2xl text-gray-900 placeholder-gray-400 outline-none text-sm bg-white border border-black/8 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-gray-700 text-sm font-semibold block">Delivery Address (optional)</label>
                                            <textarea
                                                value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                                                placeholder="Enter delivery address" rows={3}
                                                className="w-full px-4 py-3 rounded-2xl text-gray-900 placeholder-gray-400 outline-none text-sm resize-none bg-white border border-black/8 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-gray-700 text-sm font-semibold block">Order via</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setOrderMethod('whatsapp')}
                                                    className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all border"
                                                    style={{
                                                        background: orderMethod === 'whatsapp' ? 'rgba(34,197,94,0.08)' : 'white',
                                                        borderColor: orderMethod === 'whatsapp' ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.08)',
                                                        color: orderMethod === 'whatsapp' ? 'rgb(22,163,74)' : '#6b7280',
                                                    }}
                                                >
                                                    <MessageCircle className="w-4 h-4" /> WhatsApp
                                                </button>
                                                {instagramHandle && (
                                                    <button
                                                        onClick={() => setOrderMethod('instagram')}
                                                        className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all border"
                                                        style={{
                                                            background: orderMethod === 'instagram' ? 'rgba(236,72,153,0.08)' : 'white',
                                                            borderColor: orderMethod === 'instagram' ? 'rgba(236,72,153,0.4)' : 'rgba(0,0,0,0.08)',
                                                            color: orderMethod === 'instagram' ? 'rgb(236,72,153)' : '#6b7280',
                                                        }}
                                                    >
                                                        <Instagram className="w-4 h-4" /> Instagram
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl p-4 bg-white border border-black/5">
                                            <h3 className="text-gray-500 font-semibold mb-2.5 text-xs uppercase tracking-wider">Order Summary</h3>
                                            <div className="space-y-1.5 text-sm">
                                                {cart.map(item => (
                                                    <div key={item.id} className="flex justify-between text-gray-500">
                                                        <span>{item.quantity}× {item.name}</span>
                                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between font-bold text-gray-900 pt-2 mt-1 border-t border-black/5">
                                                    <span>Total</span>
                                                    <span className="text-orange-500">{formatPrice(totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-black/6">
                                        <button
                                            onClick={handleCheckout} disabled={!customerName.trim()}
                                            className="w-full py-4 rounded-2xl font-bold text-white text-[15px] flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-40"
                                            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: customerName.trim() ? '0 4px 20px rgba(249,115,22,0.3)' : 'none' }}
                                        >
                                            <Send className="w-4 h-4" />
                                            Send Order via {orderMethod === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                                        </button>
                                        <p className="text-center text-gray-400 text-xs mt-3">Your order goes directly to the seller</p>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
