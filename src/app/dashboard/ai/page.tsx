import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AiSettingsForm } from './AiSettingsForm'
import { checkAndDowngradeUser } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function AiDashboardPage() {
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
        redirect('/login')
    }

    const checkedUser = await checkAndDowngradeUser(user)

    return (
        <DashboardLayout user={checkedUser}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Virtual Assistant</h1>
                    <p className="text-gray-500">Train your automated receptionist to answer product questions, service inquiries, orders, and booking requests.</p>
                </div>
                <AiSettingsForm user={checkedUser} />
            </div>
        </DashboardLayout>
    )
}
