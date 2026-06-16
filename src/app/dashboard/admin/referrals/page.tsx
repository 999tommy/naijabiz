import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Banknote, CheckCircle, ExternalLink } from 'lucide-react'
import { revalidatePath } from 'next/cache'

async function markAsPaid(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    
    if (!userId) return

    const supabase = await createServiceClient()
    
    // Admin check
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser?.email !== 'tommmy@gmail.com') {
        throw new Error('Unauthorized')
    }

    // Record the payout in referral_payouts
    const { error } = await supabase.from('referral_payouts').insert({
        user_id: userId,
        amount: 3000,
        paid_by: authUser.id,
        status: 'paid'
    })

    if (error) {
        console.error('Error marking as paid:', error)
        throw new Error('Failed to record payout')
    }

    revalidatePath('/dashboard/admin/referrals')
}

export default async function AdminReferralsPage() {
    const supabase = await createServiceClient()
    
    // Authenticate and verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'tommmy@gmail.com') {
        redirect('/dashboard')
    }

    // Fetch users who have joined the referral program
    const { data: participants } = await supabase
        .from('users')
        .select('*')
        .eq('has_joined_referral', true)

    if (!participants) {
        return <div className="p-8">No referral participants found.</div>
    }

    // Enrich with their referral stats
    const enrichedParticipants = await Promise.all(
        participants.map(async (p) => {
            if (!p.business_slug) return { ...p, eligiblePending: 0, totalPaying: 0, paidRounds: 0 }

            const { count: payingCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('referred_by', p.business_slug)
                .eq('plan', 'pro')

            const { count: payoutRounds } = await supabase
                .from('referral_payouts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', p.id)

            const totalPaying = payingCount || 0
            const paidRounds = payoutRounds || 0
            const eligiblePending = Math.floor((totalPaying - (paidRounds * 5)) / 5)

            return {
                ...p,
                totalPaying,
                paidRounds,
                eligiblePending
            }
        })
    )

    // Sort by those who have pending payouts first
    enrichedParticipants.sort((a, b) => b.eligiblePending - a.eligiblePending)

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Referral Payouts Admin</h1>
                <p className="text-gray-500 mt-2">Manage and pay out users who have referred 5 or more paying businesses.</p>
            </div>

            <div className="grid gap-6">
                {enrichedParticipants.map(p => (
                    <Card key={p.id} className={p.eligiblePending > 0 ? "border-green-500 bg-green-50/50" : ""}>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {p.business_name || 'Unnamed Business'}
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">{p.email} • {p.whatsapp_number}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">{p.totalPaying}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Paying</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-6 justify-between mt-4">
                                <div className="space-y-4 flex-1">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                            <Banknote className="w-4 h-4 text-gray-500" />
                                            Bank Details
                                        </h3>
                                        {p.referral_payment_details ? (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-gray-500">Bank Name</div>
                                                <div className="font-medium">{p.referral_payment_details.bankName}</div>
                                                <div className="text-gray-500">Account No</div>
                                                <div className="font-medium font-mono">{p.referral_payment_details.accountNumber}</div>
                                                <div className="text-gray-500">Account Name</div>
                                                <div className="font-medium">{p.referral_payment_details.accountName}</div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No details provided yet.</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end justify-center space-y-4">
                                    <div className="text-right space-y-1">
                                        <div className="text-sm font-medium text-gray-700">Rounds Paid: {p.paidRounds} (₦{p.paidRounds * 3000})</div>
                                        <div className="text-sm font-medium text-green-700">Pending Eligible Payouts: {p.eligiblePending}</div>
                                    </div>

                                    {p.eligiblePending > 0 && p.referral_payment_details ? (
                                        <form action={markAsPaid}>
                                            <input type="hidden" name="userId" value={p.id} />
                                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Mark 1 Round as Paid (₦3,000)
                                            </Button>
                                        </form>
                                    ) : (
                                        <Button disabled variant="outline" className="opacity-50">
                                            No Pending Payouts
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
