import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Search, MessageSquare, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { BroadcastDialog } from './BroadcastDialog'

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

            <Card>
                <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Customer Directory</CardTitle>
                            <CardDescription>A list of all customers who have ordered from you.</CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input placeholder="Search customers..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Total Orders</th>
                                    <th className="px-6 py-4">Total Spent</th>
                                    <th className="px-6 py-4">Last Order</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {customers.length > 0 ? (
                                    customers.map((c, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 text-gray-500">{c.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    {c.totalOrders}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                ₦{c.totalSpent.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(c.lastOrderDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                                                    Request Review
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No customers found yet. Your AI Assistant needs to close some sales!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
