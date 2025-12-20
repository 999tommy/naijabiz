'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    Settings,
    BarChart2,
    LogOut,
    ExternalLink,
    Menu,
    X,
    Crown
} from 'lucide-react'
import type { User } from '@/lib/types'
import { FeedbackModal } from './FeedbackModal'

interface DashboardLayoutProps {
    children: React.ReactNode
    user: User
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/dashboard/products', icon: Package },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
        {
            name: 'Analytics',
            href: '/dashboard/analytics',
            icon: BarChart2,
            proOnly: true
        },
    ]

    const isPro = user.plan === 'pro'

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
                            <span className="font-bold text-gray-900">NaijaBiz</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Business info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            {user.logo_url ? (
                                <Image
                                    src={user.logo_url}
                                    alt={user.business_name || ''}
                                    width={40}
                                    height={40}
                                    className="rounded-lg object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                    {user.business_name?.[0]?.toUpperCase() || 'B'}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{user.business_name || 'Your Business'}</p>
                                <div className="flex items-center gap-1">
                                    {isPro ? (
                                        <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            Pro
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-500">Free Plan</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.business_slug && (
                            <Link
                                href={`/${user.business_slug}`}
                                target="_blank"
                                className="mt-3 flex items-center gap-2 text-sm text-orange-600 hover:underline"
                            >
                                View your page
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            const isLocked = item.proOnly && !isPro

                            return (
                                <Link
                                    key={item.name}
                                    href={isLocked ? '/dashboard/settings#upgrade' : item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-orange-100 text-orange-700"
                                            : "text-gray-600 hover:bg-gray-100",
                                        isLocked && "opacity-60"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.name}
                                    {isLocked && (
                                        <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
                                            PRO
                                        </span>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Upgrade banner (for free users) */}
                    {!isPro && (
                        <div className="p-4 border-t border-gray-200">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                                <p className="font-semibold mb-1">Upgrade to Pro</p>
                                <p className="text-xs text-orange-100 mb-3">
                                    Get verified badge, unlimited products & more!
                                </p>
                                <Link
                                    href="/dashboard/settings#upgrade"
                                    className="block text-center bg-white text-orange-600 rounded-lg px-4 py-2 text-sm font-medium hover:bg-orange-50 transition-colors"
                                >
                                    Upgrade Now - ₦1000/mo
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Feedback Button */}
                    <div className="p-4 border-t border-gray-200">
                        <FeedbackModal />
                    </div>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center px-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
