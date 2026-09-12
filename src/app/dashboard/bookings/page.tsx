import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import { BookingsClient } from './BookingsClient'
import { checkAndDowngradeUser } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')
    const [{ data: user }, { data: bookings }] = await Promise.all([
        supabase.from('users').select('*, category:categories(*)').eq('id', authUser.id).single(),
        supabase.from('bookings').select('*').eq('business_id', authUser.id).order('booking_date', { ascending: true }).order('booking_time', { ascending: true }),
    ])
    if (!user) redirect('/signup?step=business')
    return <DashboardLayout user={await checkAndDowngradeUser(user)}><BookingsClient initialBookings={bookings || []} /></DashboardLayout>
}
