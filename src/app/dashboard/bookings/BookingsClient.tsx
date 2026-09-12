'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/lib/types'

export function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
    const [bookings, setBookings] = useState(initialBookings)
    const [editing, setEditing] = useState<string | null>(null)
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')

    const updateBooking = async (booking: Booking, status: Booking['status']) => {
        const response = await fetch('/api/bookings', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: booking.id, status, booking_date: newDate, booking_time: newTime }),
        })
        if (!response.ok) return
        const { booking: updated } = await response.json()
        setBookings(current => current.map(item => item.id === updated.id ? updated : item))
        setEditing(null)
    }

    return <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Bookings</h1><p className="text-gray-500">Manage confirmed appointments and service availability.</p></div>
        <div className="space-y-3">
            {bookings.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">No bookings yet.</div> : bookings.map(booking => (
                <div key={booking.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="font-bold text-gray-900">{booking.service_name}</p>
                            <p className="text-sm text-gray-600">{booking.customer_name} · {booking.customer_phone}</p>
                            <p className="text-sm font-semibold text-orange-600">{booking.booking_date} at {booking.booking_time.slice(0, 5)}</p>
                            {booking.notes && <p className="mt-1 text-sm text-gray-500">{booking.notes}</p>}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold capitalize text-green-700">{booking.status}</span>
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && <>
                                <Button size="sm" variant="outline" onClick={() => updateBooking(booking, 'completed')}>Mark completed</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditing(booking.id)}>Reschedule</Button>
                                <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateBooking(booking, 'cancelled')}>Cancel</Button>
                            </>}
                        </div>
                    </div>
                    {editing === booking.id && <div className="mt-4 flex flex-col gap-2 border-t pt-4 sm:flex-row">
                        <input type="date" value={newDate} onChange={event => setNewDate(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
                        <input type="time" value={newTime} onChange={event => setNewTime(event.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
                        <Button size="sm" onClick={() => updateBooking(booking, 'rescheduled')} disabled={!newDate || !newTime}>Save new time</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Close</Button>
                    </div>}
                </div>
            ))}
        </div>
    </div>
}
