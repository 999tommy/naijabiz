import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getAvailableSlots, isValidBookingDate, normalizeBookingHours } from '@/lib/bookings'

async function notifyWhatsApp(phone: string | null | undefined, message: string) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const normalized = (phone || '').replace(/\D/g, '')
    if (!token || !phoneId || !normalized) return
    try {
        await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to: normalized, type: 'text', text: { preview_url: false, body: message } }),
        })
    } catch (error) {
        console.error('[Booking WhatsApp notification]', error)
    }
}

export async function GET(req: Request) {
    const url = new URL(req.url)
    const businessId = url.searchParams.get('business_id')
    const date = url.searchParams.get('date') || ''
    if (!businessId || !isValidBookingDate(date)) return NextResponse.json({ error: 'Invalid booking date' }, { status: 400 })
    const supabase = await createServiceClient()
    const [{ data: business }, { data: booked }] = await Promise.all([
        supabase.from('users').select('booking_hours, booking_slot_minutes').eq('id', businessId).single(),
        supabase.from('bookings').select('booking_time').eq('business_id', businessId).eq('booking_date', date).in('status', ['confirmed', 'rescheduled']),
    ])
    if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    return NextResponse.json({ slots: getAvailableSlots(date, normalizeBookingHours(business.booking_hours), business.booking_slot_minutes || 60, (booked || []).map(item => item.booking_time)) })
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { business_id, service_id, service_name, customer_name, customer_phone, booking_date, booking_time, notes } = body
        if (!business_id || !service_name || !customer_name || !customer_phone || !booking_date || !booking_time || !isValidBookingDate(booking_date)) return NextResponse.json({ error: 'Name, phone, service, date, and time are required' }, { status: 400 })
        const supabase = await createServiceClient()
        const { data: business } = await supabase.from('users').select('business_name, whatsapp_number, booking_hours, booking_slot_minutes').eq('id', business_id).single()
        if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
        const { data: booked } = await supabase.from('bookings').select('booking_time').eq('business_id', business_id).eq('booking_date', booking_date).in('status', ['confirmed', 'rescheduled'])
        const slots = getAvailableSlots(booking_date, normalizeBookingHours(business.booking_hours), business.booking_slot_minutes || 60, (booked || []).map(item => item.booking_time))
        if (!slots.includes(booking_time.slice(0, 5))) return NextResponse.json({ error: 'That time is no longer available' }, { status: 409 })
        const { data: booking, error } = await supabase.from('bookings').insert({ business_id, service_id: service_id || null, service_name, customer_name, customer_phone, booking_date, booking_time, notes: notes || null, status: 'confirmed' }).select().single()
        if (error) return NextResponse.json({ error: error.code === '23505' ? 'That time is no longer available' : 'Failed to create booking' }, { status: error.code === '23505' ? 409 : 500 })
        const bookingSummary = `New confirmed booking for ${service_name} on ${booking_date} at ${booking_time.slice(0, 5)}. Customer: ${customer_name}, ${customer_phone}.${notes ? ` Notes: ${notes}` : ''}`
        const customerSummary = `Your booking with ${business.business_name || 'the business'} is confirmed for ${booking_date} at ${booking_time.slice(0, 5)}. Service: ${service_name}.`
        await Promise.all([notifyWhatsApp(business.whatsapp_number, bookingSummary), notifyWhatsApp(customer_phone, customerSummary)])
        return NextResponse.json({ booking })
    } catch { return NextResponse.json({ error: 'Invalid booking request' }, { status: 400 }) }
}

export async function PATCH(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, status, booking_date, booking_time } = await req.json()
    if (!id || !['confirmed', 'rescheduled', 'cancelled', 'completed'].includes(status)) return NextResponse.json({ error: 'Invalid booking update' }, { status: 400 })
    const update: Record<string, string> = { status, updated_at: new Date().toISOString() }
    if (status === 'rescheduled') {
        if (!booking_date || !booking_time || !isValidBookingDate(booking_date)) return NextResponse.json({ error: 'A new date and time are required' }, { status: 400 })
        update.booking_date = booking_date
        update.booking_time = booking_time
    }
    const { data, error } = await supabase.from('bookings').update(update).eq('id', id).eq('business_id', user.id).select().single()
    if (error) return NextResponse.json({ error: 'Could not update booking' }, { status: 500 })
    return NextResponse.json({ booking: data })
}
