import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/DashboardLayout'
import ProductsClient from './ProductsClient'

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
        redirect('/login')
    }

    const [{ data: user }, { data: products }] = await Promise.all([
        supabase.from('users').select('*, category:categories(*)').eq('id', authUser.id).single(),
        supabase.from('products').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
    ])

    if (!user) {
        redirect('/signup?step=business')
    }

    return (
        <DashboardLayout user={user}>
            <ProductsClient user={user} initialProducts={products || []} />
        </DashboardLayout>
    )
}
