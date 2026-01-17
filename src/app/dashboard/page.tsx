import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { formatPrice } from '@/lib/utils'
import {
    Package,
    Eye,
    ShoppingCart,
    TrendingUp,
    Plus,
    AlertCircle,
    ArrowRight,
    Hand,
    Rocket,
    Lightbulb,
    Check
} from 'lucide-react'
import { OnboardingAssistant } from '@/components/OnboardingAssistant'
import { ReferralCard } from '@/components/ReferralCard'
import { WhatsAppShareCenter } from '@/components/WhatsAppShareCenter'
import { ShareRankCard } from '@/components/ShareRankCard'

export const dynamic = 'force-dynamic'

async function getDashboardData(userId: string) {
    const supabase = await createClient()

    const serviceSupabase = await createServiceClient()

    // Fetch basic stats
    const [
        { data: user },
        { count: productCount },
        { count: viewCount },
        { count: orderCount },
    ] = await Promise.all([
        supabase.from('users').select('*, category:categories(*)').eq('id', userId).single(),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('business_id', userId),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ])

    // Calculate Rank (Simplified for Dashboard performance)
    // In a real app, this should be a materialized view or cached value.
    // We will just fetch top 10 scores and see if user matches.
    const { data: allStats } = await serviceSupabase
        .from('users')
        .select('id, upvotes, plan')

    const { data: allReviews } = await serviceSupabase
        .from('reviews')
        .select('business_id, created_at')

    const { data: allPageViews } = await serviceSupabase
        .from('page_views')
        .select('business_id, created_at')

    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Compute Daily Scores
    const rankedUsers = (allStats || []).map((u: any) => {
        const recentReviews = allReviews?.filter((r: any) => r.business_id === u.id && new Date(r.created_at) > last24h).length || 0
        const recentViews = allPageViews?.filter((v: any) => v.business_id === u.id && new Date(v.created_at) > last24h).length || 0

        const dailyScore =
            (recentReviews * 100) +
            (recentViews * 5) +
            ((u.upvotes || 0) * 0.5) +
            (u.plan === 'pro' ? 10 : 0)

        return { id: u.id, score: dailyScore }
    }).sort((a: any, b: any) => b.score - a.score)

    const myRankIndex = rankedUsers.findIndex(u => u.id === userId)
    const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 0

    return {
        user,
        stats: {
            products: productCount || 0,
            views: viewCount || 0,
            orders: orderCount || 0
        },
        rank: myRank
    }
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const { user, stats, rank } = await getDashboardData(authUser.id)

    if (!user) {
        redirect('/signup?step=business')
    }

    const isPro = user.plan === 'pro'
    const productLimit = isPro ? '∞' : '3'
    const hasCompletedProfile = user.business_name && user.whatsapp_number && user.location

    return (
        <DashboardLayout user={user}>
            <div className="max-w-6xl mx-auto">
                {/* Welcome section */}
                <div className="mb-8">
                    <ShareRankCard user={user} rank={rank} />

                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mt-4">
                        Welcome back, {user.business_name || 'there'}! <Hand className="w-6 h-6 text-yellow-500" />
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here&apos;s what&apos;s happening with your business today.
                    </p>
                </div>

                <OnboardingAssistant user={user} productCount={stats.products} />



                {/* Stats cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Products</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.products} <span className="text-sm font-normal text-gray-400">/ {productLimit}</span>
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Page Views</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {isPro ? stats.views : '—'}
                                    </p>
                                    {!isPro && <p className="text-xs text-orange-600">Pro only</p>}
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    {user.is_verified && isPro ? (
                                        <VerifiedBadge size="sm" className="mt-1" />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-600">
                                            {user.verification_status === 'pending' ? 'Verification Pending' : 'Not Verified'}
                                        </p>
                                    )}
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Quick actions */}
                <div className="grid md:grid-cols-2 gap-6 pb-8">
                    <div className="min-w-0">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/dashboard/products" className="block">
                                    <Button variant="outline" className="w-full justify-between">
                                        <span className="flex items-center gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add a Product
                                        </span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                <Link href="/dashboard/settings" className="block">
                                    <Button variant="outline" className="w-full justify-between">
                                        <span className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Update Business Info
                                        </span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>

                                {user.business_slug && (
                                    <Link href={`/${user.business_slug}`} target="_blank" className="block">
                                        <Button variant="outline" className="w-full justify-between">
                                            <span className="flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                View Your Public Page
                                            </span>
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="min-w-0">
                        {/* Pro upsell or tips */}
                        {!isPro ? (
                            <div className="space-y-6">
                                <ReferralCard user={user} />

                                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Rocket className="w-5 h-5 text-orange-600" /> Upgrade to Pro
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                Green verified badge for trust
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                Unlimited product listings
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                Customer reviews & ratings
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                Featured in search results
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                View who visited your page
                                            </li>
                                        </ul>
                                        <Link href="/dashboard/settings#upgrade">
                                            <Button className="w-full">
                                                Upgrade Now
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <WhatsAppShareCenter user={user} rank={rank} />
                                <ReferralCard user={user} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
