import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, TrendingUp, Calendar, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getAnalytics(userId: string) {
    const supabase = await createClient()

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
        { count: totalViews },
        { count: weekViews },
        { count: monthViews },
        { data: recentViews }
    ] = await Promise.all([
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('business_id', userId),
        supabase.from('page_views').select('*', { count: 'exact', head: true })
            .eq('business_id', userId)
            .gte('created_at', weekAgo.toISOString()),
        supabase.from('page_views').select('*', { count: 'exact', head: true })
            .eq('business_id', userId)
            .gte('created_at', monthAgo.toISOString()),
        supabase.from('page_views').select('*')
            .eq('business_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)
    ])

    return {
        total: totalViews || 0,
        week: weekViews || 0,
        month: monthViews || 0,
        recent: recentViews || []
    }
}

export default async function AnalyticsPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const { data: user } = await supabase
        .from('users')
        .select('*, category:categories(*)')
        .eq('id', authUser.id)
        .single()

    if (!user) {
        redirect('/signup?step=business')
    }

    // Redirect free users
    if (user.plan !== 'pro') {
        redirect('/dashboard/settings#upgrade')
    }

    const analytics = await getAnalytics(authUser.id)

    return (
        <DashboardLayout user={user}>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500">See who&apos;s viewing your business page</p>
                </div>

                {/* Stats cards */}
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Views</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.total}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">This Week</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.week}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">This Month</p>
                                    <p className="text-3xl font-bold text-gray-900">{analytics.month}</p>
                                </div>
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent views */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Recent Visitors
                        </CardTitle>
                        <CardDescription>
                            People who visited your business page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analytics.recent.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Eye className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p>No page views yet</p>
                                <p className="text-sm mt-1">Share your business link to get visitors</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics.recent.map((view) => (
                                    <div
                                        key={view.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Visitor
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {view.referrer ? `From: ${new URL(view.referrer).hostname}` : 'Direct visit'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">
                                                {new Date(view.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(view.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
