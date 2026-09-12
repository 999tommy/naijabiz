export type BookingDay = {
    enabled: boolean
    start: string
    end: string
}

export type BookingHours = Record<string, BookingDay>

export const DEFAULT_BOOKING_HOURS: BookingHours = {
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: true, start: '10:00', end: '15:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' },
}

export function normalizeBookingHours(value: unknown): BookingHours {
    const source = value && typeof value === 'object' ? value as Record<string, Partial<BookingDay>> : {}
    return Object.fromEntries(Object.entries(DEFAULT_BOOKING_HOURS).map(([day, fallback]) => {
        const item = source[day] || {}
        return [day, {
            enabled: item.enabled ?? fallback.enabled,
            start: item.start || fallback.start,
            end: item.end || fallback.end,
        }]
    }))
}

function minutes(value: string) {
    const [hours, mins] = value.split(':').map(Number)
    return hours * 60 + mins
}

function formatTime(totalMinutes: number) {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
    const mins = (totalMinutes % 60).toString().padStart(2, '0')
    return `${hours}:${mins}`
}

export function getAvailableSlots(date: string, hours: BookingHours, durationMinutes = 60, bookedTimes: string[] = []) {
    if (!date) return []
    const day = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const schedule = hours[day]
    if (!schedule?.enabled) return []

    const start = minutes(schedule.start)
    const end = minutes(schedule.end)
    const booked = new Set(bookedTimes.map(time => time.slice(0, 5)))
    const slots: string[] = []
    for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
        const slot = formatTime(current)
        if (!booked.has(slot)) slots.push(slot)
    }
    return slots
}

export function isValidBookingDate(date: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= new Date().toISOString().slice(0, 10)
}
