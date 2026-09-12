'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

    return <Card className="mt-6">
        <CardHeader><CardTitle>Booking availability</CardTitle><CardDescription>Customers can only select open slots in this schedule. Times use Africa/Lagos time.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
            {days.map(day => <div key={day} className="grid grid-cols-[auto_1fr_1fr] items-center gap-3 text-sm">
                <label className="flex w-28 items-center gap-2 capitalize"><input type="checkbox" checked={hours[day].enabled} onChange={event => updateDay(day, 'enabled', event.target.checked)} />{day}</label>
                <input type="time" disabled={!hours[day].enabled} value={hours[day].start} onChange={event => updateDay(day, 'start', event.target.value)} className="rounded-lg border px-3 py-2" />
                <input type="time" disabled={!hours[day].enabled} value={hours[day].end} onChange={event => updateDay(day, 'end', event.target.value)} className="rounded-lg border px-3 py-2" />
            </div>)}
            <div className="flex items-center gap-3 pt-3"><label className="text-sm font-medium">Appointment length</label><select value={duration} onChange={event => setDuration(Number(event.target.value))} className="rounded-lg border px-3 py-2 text-sm"><option value={30}>30 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>2 hours</option></select></div>
            <Button type="button" onClick={save}>{saved ? 'Saved' : 'Save availability'}</Button>
        </CardContent>
    </Card>
}
