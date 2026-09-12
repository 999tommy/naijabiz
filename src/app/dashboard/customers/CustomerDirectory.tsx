'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

type Customer = { name: string; phone: string; totalOrders: number; totalSpent: number; lastOrderDate: string }

export function CustomerDirectory({ customers }: { customers: Customer[] }) {
    const [query, setQuery] = useState('')
    const filtered = useMemo(() => {
        const value = query.trim().toLowerCase()
        return value ? customers.filter(customer => `${customer.name} ${customer.phone}`.toLowerCase().includes(value)) : customers
    }, [customers, query])

    return <Card>
        <CardHeader className="border-b border-gray-100 pb-4"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><CardTitle>Customer Directory</CardTitle><CardDescription>A list of all customers who have ordered from you.</CardDescription></div><div className="relative w-full sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search customers..." className="pl-9" /></div></div></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-gray-50 font-medium text-gray-500"><tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Total Orders</th><th className="px-6 py-4">Total Spent</th><th className="px-6 py-4">Last Order</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.length ? filtered.map(customer => <tr key={customer.phone} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td><td className="px-6 py-4 text-gray-500">{customer.phone}</td><td className="px-6 py-4"><span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">{customer.totalOrders}</span></td><td className="px-6 py-4 font-medium text-gray-900">₦{customer.totalSpent.toLocaleString()}</td><td className="px-6 py-4 text-gray-500">{new Date(customer.lastOrderDate).toLocaleDateString()}</td><td className="space-x-2 px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-gray-500">Request Review</Button><Button variant="ghost" size="sm" className="text-orange-600">View Details</Button></td></tr>) : <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No customers match your search.</td></tr>}</tbody></table></div></CardContent>
    </Card>
}
