import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import SettingsClient from './SettingsClient'
import { checkAndDowngradeUser } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const [{ data: user }, { data: categories }] = await Promise.all([
        supabase.from('users').select('*, category:categories(*)').eq('id', authUser.id).single(),
        supabase.from('categories').select('*').order('name')
    ])

    if (!user) {
        redirect('/signup?step=business')
    }

    const checkedUser = await checkAndDowngradeUser(user)

    return (
        <DashboardLayout user={checkedUser}>
            <SettingsClient user={checkedUser} initialCategories={categories || []} />
        </DashboardLayout>
    )
}
