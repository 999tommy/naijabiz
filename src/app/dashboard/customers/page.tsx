import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users } from 'lucide-react'

import { BroadcastDialog } from './BroadcastDialog'
import { CustomerDirectory } from './CustomerDirectory'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect('/login')
    }

    // Fetch orders to extract unique customers
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const customersMap = new Map()

    if (orders) {
        orders.forEach(order => {
            const phone = order.customer_contact
            if (!phone) return

            if (!customersMap.has(phone)) {
                customersMap.set(phone, {
                    name: order.customer_name || 'Unknown',
                    phone,
                    totalOrders: 0,
                    totalSpent: 0,
                    lastOrderDate: order.created_at,
                    orders: []
                })
            }

            const c = customersMap.get(phone)
            c.totalOrders += 1
            c.totalSpent += Number(order.total_amount || 0)
            c.orders.push(order)
        })
    }

    const customers = Array.from(customersMap.values())

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-600" />
                        Customers & CRM
                    </h1>
                    <p className="text-gray-500">Manage your customer relationships and view order history.</p>
                </div>
                <div className="flex gap-2">
                    <BroadcastDialog customers={customers} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Customers</p>
                            <h3 className="text-2xl font-bold text-gray-900">{customers.length}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <CustomerDirectory customers={customers} />
        </div>
    )
}
