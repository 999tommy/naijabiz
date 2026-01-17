import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import { AiSettingsForm } from './AiSettingsForm'

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

    return (
        <DashboardLayout user={user}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">AI Sales Assistant</h1>
                    <p className="text-gray-500">Train your automated receptionist to answer customer questions.</p>
                </div>
                <AiSettingsForm user={user} />
            </div>
        </DashboardLayout>
    )
}
