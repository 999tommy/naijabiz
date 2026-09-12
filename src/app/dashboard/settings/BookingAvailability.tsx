'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import { DEFAULT_BOOKING_HOURS, normalizeBookingHours, type BookingHours } from '@/lib/bookings'
import type { User } from '@/lib/types'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export function BookingAvailability({ user }: { user: User }) {
    const [hours, setHours] = useState<BookingHours>(normalizeBookingHours(user.booking_hours || DEFAULT_BOOKING_HOURS))
    const [duration, setDuration] = useState(user.booking_slot_minutes || 60)
    const [saved, setSaved] = useState(false)
    const supabase = createClient()

    const updateDay = (day: string, key: 'enabled' | 'start' | 'end', value: string | boolean) => setHours(current => ({ ...current, [day]: { ...current[day], [key]: value } }))
    const save = async () => {
        const { error } = await supabase.from('users').update({ booking_hours: hours, booking_slot_minutes: duration }).eq('id', user.id)
        if (!error) { setSaved(true); window.setTimeout(() => setSaved(false), 2500) }
    }

    return <details className="group mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Booking Availability</h2>
                <p className="text-sm text-gray-500">Customers can only select open slots. Times use Africa/Lagos time.</p>
            </div>
            <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t border-gray-100 p-6">
            {days.map(day => <div key={day} className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr] sm:items-center gap-2 sm:gap-3 text-sm">
                <label className="flex w-28 items-center gap-2 capitalize"><input type="checkbox" checked={hours[day].enabled} onChange={event => updateDay(day, 'enabled', event.target.checked)} />{day}</label>
                <input type="time" disabled={!hours[day].enabled} value={hours[day].start} onChange={event => updateDay(day, 'start', event.target.value)} className="rounded-lg border px-3 py-2" />
                <input type="time" disabled={!hours[day].enabled} value={hours[day].end} onChange={event => updateDay(day, 'end', event.target.value)} className="rounded-lg border px-3 py-2" />
            </div>)}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3"><label className="text-sm font-medium">Appointment length</label><select value={duration} onChange={event => setDuration(Number(event.target.value))} className="rounded-lg border px-3 py-2 text-sm"><option value={30}>30 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>2 hours</option></select></div>
            <Button type="button" onClick={save}>{saved ? 'Saved' : 'Save availability'}</Button>
        </div>
    </details>
}
