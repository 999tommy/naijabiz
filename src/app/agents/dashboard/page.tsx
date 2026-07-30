import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Banknote, Copy, ExternalLink, Gift, TrendingUp, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ReferralCard } from '@/components/ReferralCard'

export const dynamic = 'force-dynamic'

export default async function AgentDashboardPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

    if (!user) {
        redirect('/signup?step=business')
    }

    const [{ data: referrals }, { data: payouts }] = await Promise.all([
        supabase
            .from('users')
            .select('id, business_name, business_slug, plan, created_at')
            .eq('referred_by', user.id)
            .order('created_at', { ascending: false }),
        supabase
            .from('referral_payouts')
            .select('amount, status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
    ])

    const referredBusinesses = referrals || []
    const activeClients = referredBusinesses.filter((client: any) => client.plan === 'pro').length
    const totalEarnings = (payouts || []).reduce((sum: number, payout: any) => sum + (Number(payout.amount) || 0), 0)
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://naijabiz.org'}/signup?ref=${user.business_slug || ''}`
    const payoutRounds = payouts?.length || 0

    return (
        <div className="min-h-screen bg-[#fffaf5] text-[#2a1d1a]">
            <header className="bg-white border-b border-[#eadfd8]">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-black">
                        <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
                        NaijaBiz Agents
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm" className="border-[#eadfd8]">
                                Business Dashboard
                            </Button>
                        </Link>
                        <Link href="/agents">
                            <Button size="sm" className="bg-[#a84b35] hover:bg-[#8f3e2b] text-white">
                                Program Page
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-2">Agent Dashboard</p>
                    <h1 className="text-3xl font-black tracking-tight">Welcome, {user.business_name || 'Agent'}</h1>
                    <p className="text-[#725e57] mt-2">Track referrals, active clients, payout progress, and your agent link.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Referrals</p>
                                <p className="text-3xl font-black">{referredBusinesses.length}</p>
                            </div>
                            <Users className="w-8 h-8 text-[#a84b35]" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Clients</p>
                                <p className="text-3xl font-black">{activeClients}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Paid Earnings</p>
                                <p className="text-3xl font-black">₦{totalEarnings.toLocaleString('en-NG')}</p>
                            </div>
                            <Banknote className="w-8 h-8 text-blue-600" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Bonus Rounds</p>
                                <p className="text-3xl font-black">{payoutRounds}</p>
                            </div>
                            <Gift className="w-8 h-8 text-purple-600" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
                    <div className="space-y-6">
                        <ReferralCard
                            user={user}
                            referralStats={{
                                payingReferredCount: activeClients,
                                payoutRounds,
                            }}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Your Agent Link</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <div className="flex-1 min-w-0 bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-700 truncate font-mono">
                                        {user.business_slug ? referralLink : 'Create a business slug to activate your link'}
                                    </div>
                                    <Link href={user.business_slug ? referralLink : '/dashboard/settings'} target={user.business_slug ? '_blank' : undefined}>
                                        <Button variant="outline" size="icon">
                                            {user.business_slug ? <ExternalLink className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Referred Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {referredBusinesses.length > 0 ? (
                                <div className="space-y-3">
                                    {referredBusinesses.map((client: any) => (
                                        <div key={client.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-4">
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{client.business_name || 'Unnamed business'}</p>
                                                <p className="text-xs text-gray-500">Joined {new Date(client.created_at).toLocaleDateString()}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${client.plan === 'pro' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {client.plan === 'pro' ? 'Active Pro' : 'Free'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border border-dashed rounded-2xl bg-gray-50">
                                    <p className="font-semibold text-gray-900">No referred clients yet.</p>
                                    <p className="text-sm text-gray-500 mt-1">Share your agent link to start tracking signups here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
