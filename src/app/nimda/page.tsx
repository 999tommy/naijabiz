import { createServiceClient } from '@/lib/supabase/server'
import { getNimdaSession } from '@/lib/nimda/auth'
import LoginForm from './LoginForm'
import { NimdaDashboard } from './NimdaDashboard'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Qriblo Admin', robots: { index: false, follow: false, noarchive: true } }

export default async function NimdaPage() {
    const session = await getNimdaSession()
    if (!session) return <NimdaLogin />
    const db = await createServiceClient()
    const since7 = new Date(Date.now() - 7 * 86400000).toISOString()
    const since14 = new Date(Date.now() - 14 * 86400000).toISOString()
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString()
    const next7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

    const [users, pros, newUsers, products, views7, viewsPrior7, views30, pendingOrders, bookings, verifications, feedback, transactions, events, recentMerchants, recentFeedback, pendingOrdersList, pendingVerificationsList, upcomingBookingsList, referralParticipants, referredBusinesses, referralPayouts, marketingViews, auditLog] = await Promise.all([
        db.from('users').select('id', { count: 'exact', head: true }),
        db.from('users').select('id', { count: 'exact', head: true }).eq('plan', 'pro'),
        db.from('users').select('id', { count: 'exact', head: true }).gte('created_at', since7),
        db.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        db.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since7),
        db.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since14).lt('created_at', since7),
        db.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', since30),
        db.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('bookings').select('id', { count: 'exact', head: true }).gte('booking_date', new Date().toISOString().slice(0,10)).lt('booking_date', next7).in('status', ['confirmed','rescheduled']),
        db.from('users').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        db.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        db.from('paystack_transactions').select('id, reference, status, event, user_id, customer_email, created_at, payload, plan_code, users!paystack_transactions_user_id_fkey(business_name,business_slug)').gte('created_at', since30).order('created_at', { ascending: false }).limit(500),
        db.from('assistant_events').select('id', { count: 'exact', head: true }).gte('created_at', since30),
        db.from('users').select('id,business_name,business_slug,email,plan,created_at,verification_status').order('created_at', { ascending: false }).limit(8),
        db.from('feedback').select('id,type,message,status,created_at').eq('status','pending').order('created_at',{ascending:false}).limit(5),
        db.from('orders').select('id,customer_name,customer_contact,total_amount,status,created_at,user_id,users!orders_user_id_fkey(business_name,business_slug,whatsapp_number)').eq('status','pending').order('created_at',{ascending:false}).limit(6),
        db.from('users').select('id,business_name,email,created_at,verification_document_url').eq('verification_status','pending').order('created_at',{ascending:false}).limit(5),
        db.from('bookings').select('id,service_name,customer_name,customer_phone,booking_date,booking_time,status,business_id,users!bookings_business_id_fkey(business_name,business_slug,whatsapp_number)').gte('booking_date',new Date().toISOString().slice(0,10)).lt('booking_date',next7).in('status',['confirmed','rescheduled']).order('booking_date',{ascending:true}).limit(6),
        db.from('users').select('id,business_name,business_slug,email,whatsapp_number,created_at,referral_count,referral_payment_details',{count:'exact'}).eq('has_joined_referral',true).order('created_at',{ascending:false}).limit(1000),
        db.from('users').select('id,referred_by,plan,created_at').not('referred_by','is',null).limit(10000),
        db.from('referral_payouts').select('id,user_id,amount,status,paid_by,created_at,paid_at').order('created_at',{ascending:false}).limit(1000),
        db.from('page_views').select('created_at,referrer').gte('created_at',since30).order('created_at',{ascending:false}).limit(10000),
        db.from('nimda_admin_audit').select('id,admin_email,action,subject_id,created_at').order('created_at',{ascending:false}).limit(8),
    ])
    const databaseHasErrors = [users,pros,newUsers,products,views7,viewsPrior7,views30,pendingOrders,bookings,verifications,feedback,transactions,events,recentMerchants,recentFeedback,pendingOrdersList,pendingVerificationsList,upcomingBookingsList,referralParticipants,referredBusinesses,referralPayouts,marketingViews,auditLog].some(query => !!query.error)
    const transactionRows = transactions.data || []
    const successfulTransactions = transactionRows.filter((tx: any) => tx.status === 'success')
    const paystackTransactions = transactionRows.map((tx: any) => {
        const eventData = tx.payload?.data || {}
        const rawAmount = Number(eventData.amount ?? eventData.paid_amount ?? tx.payload?.amount ?? 0)
        const currency = String(eventData.currency || tx.payload?.currency || 'NGN').toUpperCase()
        const amountMajor = Number.isFinite(rawAmount) ? rawAmount / 100 : 0
        return {
            id: tx.id,
            reference: tx.reference,
            status: tx.status,
            event: tx.event || tx.payload?.event || 'Paystack event',
            email: tx.customer_email || eventData.customer?.email || 'Customer email unavailable',
            businessName: tx.users?.business_name || '',
            businessSlug: tx.users?.business_slug || '',
            planCode: tx.plan_code || eventData.plan?.plan_code || eventData.subscription?.plan?.plan_code || '',
            createdAt: tx.created_at,
            currency,
            amountMajor,
        }
    })
    const revenueNaira = successfulTransactions.reduce((sum: number, tx: any) => {
        const eventData = tx.payload?.data || {}
        const currency = String(eventData.currency || tx.payload?.currency || 'NGN').toUpperCase()
        const rawAmount = Number(eventData.amount ?? eventData.paid_amount ?? tx.payload?.amount ?? 0)
        return sum + (currency === 'NGN' && Number.isFinite(rawAmount) ? rawAmount / 100 : 0)
    }, 0)
    const referralAccounts = referredBusinesses.data || []
    const payoutRows = referralPayouts.data || []
    const referralParticipantRows = (referralParticipants.data || []).map((participant: any) => {
        const referred = referralAccounts.filter((account: any) => account.referred_by === participant.id)
        const paying = referred.filter((account: any) => account.plan === 'pro').length
        const participantPayouts = payoutRows.filter((payout: any) => payout.user_id === participant.id)
        const paidCount = participantPayouts.filter((payout: any) => payout.status === 'paid').length
        const paidNaira = participantPayouts.filter((payout: any) => payout.status === 'paid').reduce((total: number, payout: any) => total + Number(payout.amount || 0), 0)
        const reservedRounds = participantPayouts.length
        return {
            ...participant,
            referralTotal: referred.length,
            payingReferrals: paying,
            payoutRounds: participantPayouts.length,
            paidPayoutCount: paidCount,
            paidNaira,
            pendingEligible: Math.max(0, Math.floor((paying - reservedRounds * 5) / 5)),
            lastPayoutAt: participantPayouts[0]?.paid_at || participantPayouts[0]?.created_at || null,
        }
    }).sort((a: any, b: any) => b.pendingEligible - a.pendingEligible || b.payingReferrals - a.payingReferrals)
    const referralSummary = {
        members: referralParticipants.count || referralParticipantRows.length,
        referredBusinesses: referralAccounts.length,
        proBusinesses: referralAccounts.filter((account: any) => account.plan === 'pro').length,
        paidNaira: payoutRows.filter((payout: any) => payout.status === 'paid').reduce((total: number, payout: any) => total + Number(payout.amount || 0), 0),
        eligiblePayoutRounds: referralParticipantRows.reduce((total: number, participant: any) => total + participant.pendingEligible, 0),
    }
    const visitByDay = new Map<string, number>()
    const sourceCounts = new Map<string, number>()
    for (const view of marketingViews.data || []) {
        const dayKey = new Date(view.created_at).toISOString().slice(0, 10)
        visitByDay.set(dayKey, (visitByDay.get(dayKey) || 0) + 1)
        let source = 'Direct / unknown'
        if (view.referrer) { try { source = new URL(view.referrer).hostname.replace(/^www\./, '') || source } catch { source = 'Other' } }
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1)
    }
    const marketingTrend = Array.from({length:14}, (_,i) => {
        const day = new Date(Date.now() - (13-i)*86400000)
        const key = day.toISOString().slice(0,10)
        return { label: day.toLocaleDateString('en-NG',{weekday:'short'}), count: visitByDay.get(key) || 0 }
    })
    const marketingSources = [...sourceCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([source,count])=>({source,count}))
    const maxSource = Math.max(1,...marketingSources.map(item=>item.count))
    const paidCount = successfulTransactions.length
    const failedPayments = transactionRows.filter((tx: any) => tx.status === 'failed').length

    return <NimdaDashboard data={{
        adminEmail: session.email, databaseHasErrors, recentAdminActions: auditLog.data || [],
        metrics: {
            businesses: users.count || 0, proBusinesses: pros.count || 0, newBusinesses7d: newUsers.count || 0,
            activeProducts: products.count || 0, views7d: views7.count || 0,
            viewsPrior7d: viewsPrior7.count || 0, views30d: views30.count || 0,
            pendingOrders: pendingOrders.count || 0, bookings7d: bookings.count || 0,
            pendingVerifications: verifications.count || 0, pendingFeedback: feedback.count || 0,
            assistantEvents30d: events.count || 0, paidCount, revenueNaira, failedPayments, marketingTrend, marketingSources, maxSource,
        },
        recentMerchants: recentMerchants.data || [], recentFeedback: recentFeedback.data || [],
        pendingOrders: pendingOrdersList.data || [], pendingVerifications: pendingVerificationsList.data || [], upcomingBookings: upcomingBookingsList.data || [],
        referralParticipants: referralParticipantRows, referralSummary, referralPayouts: payoutRows.slice(0, 20), paystackTransactions,
    }}/>
}

function NimdaLogin() { return <LoginForm /> }
