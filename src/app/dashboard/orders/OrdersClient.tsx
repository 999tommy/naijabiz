'use client'

import { useState } from 'react'
import { MessageCircle, PackageCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type SellerOrder = { id: string; customer_name: string; customer_contact: string; items: Array<{ name: string; price: number; quantity: number }>; total_amount: number; order_method: string; status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; created_at: string }

export function OrdersClient({ initialOrders }: { initialOrders: SellerOrder[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [busyId, setBusyId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const updateStatus = async (order: SellerOrder, status: SellerOrder['status']) => {
        setBusyId(order.id); setError('')
        try {
            const response = await fetch('/api/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: order.id, status }) })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Could not update order')
            setOrders(current => current.map(item => item.id === order.id ? { ...item, status } : item))
        } catch (e) { setError(e instanceof Error ? e.message : 'Could not update order') }
        finally { setBusyId(null) }
    }
    const whatsappHref = (order: SellerOrder) => {
        if (!order.customer_contact || order.customer_contact.startsWith('Via ')) return null
        const phone = order.customer_contact.replace(/\D/g, '').replace(/^0/, '234')
        return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hello ${order.customer_name}, I’m following up on your Qriblo order.`)}` : null
    }
    return <div className="mx-auto max-w-6xl">
        <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="text-gray-500">Review requests and follow up with customers on WhatsApp.</p></div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {!orders.length ? <div className="rounded-2xl border bg-white p-12 text-center text-gray-500"><PackageCheck className="mx-auto mb-3 h-10 w-10 text-gray-300"/><p>No orders have come in yet.</p></div> :
            <div className="space-y-4">{orders.map(order => {
                const chat = whatsappHref(order)
                return <article key={order.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-gray-900">{order.customer_name}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === 'pending' ? 'bg-amber-100 text-amber-800' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{order.status}</span></div><p className="mt-1 text-xs text-gray-500">{new Date(order.created_at).toLocaleString()} · via {order.order_method}</p><p className="text-sm text-gray-600">{order.customer_contact}</p></div>
                        <p className="text-lg font-extrabold text-orange-700">₦{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                    <ul className="my-4 divide-y rounded-xl bg-gray-50 px-3">{(order.items || []).map((item, i) => <li key={`${item.name}-${i}`} className="flex justify-between gap-3 py-2 text-sm"><span>{item.quantity || 1} × {item.name}</span><span className="font-medium">₦{(Number(item.price) * Number(item.quantity || 1)).toLocaleString()}</span></li>)}</ul>
                    <div className="flex flex-wrap gap-2">
                        {chat && <a href={chat} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-800"><MessageCircle className="h-4 w-4"/>Message customer</a>}
                        {order.status === 'pending' && <button disabled={busyId === order.id} onClick={() => updateStatus(order, 'confirmed')} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{busyId === order.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4"/>}Confirm order</button>}
                        {order.status === 'confirmed' && <button disabled={busyId === order.id} onClick={() => updateStatus(order, 'completed')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"><CheckCircle2 className="h-4 w-4"/>Mark complete</button>}
                        {['pending', 'confirmed'].includes(order.status) && <button disabled={busyId === order.id} onClick={() => updateStatus(order, 'cancelled')} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"><XCircle className="h-4 w-4"/>Cancel</button>}
                    </div>
                </article>
            })}</div>}
    </div>
}