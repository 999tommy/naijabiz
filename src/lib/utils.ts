import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export function generateWhatsAppLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function generateInstagramLink(handle: string): string {
    const cleanHandle = handle.replace('@', '')
    return `https://instagram.com/${cleanHandle}`
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function validateNigerianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    // Nigerian phone numbers: 080, 081, 070, 090, 091 etc
    return /^(234|0)(70|80|81|90|91|71)\d{8}$/.test(cleanPhone)
}

export function formatNigerianPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) {
        return '234' + cleanPhone.slice(1)
    }
    return cleanPhone
}
