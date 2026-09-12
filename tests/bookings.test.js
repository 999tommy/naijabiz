const test = require('node:test')
const assert = require('node:assert/strict')

function slots(schedule, duration, booked = []) {
  if (!schedule.enabled) return []
  const toMinutes = value => { const [h, m] = value.split(':').map(Number); return h * 60 + m }
  const output = []
  const reserved = new Set(booked.map(value => value.slice(0, 5)))
  for (let current = toMinutes(schedule.start); current + duration <= toMinutes(schedule.end); current += duration) {
    const time = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`
    if (!reserved.has(time)) output.push(time)
  }
  return output
}

test('creates fixed-length slots and excludes booked times', () => {
  assert.deepEqual(slots({ enabled: true, start: '09:00', end: '12:00' }, 60, ['10:00:00']), ['09:00', '11:00'])
})

test('returns no slots for a closed day', () => {
  assert.deepEqual(slots({ enabled: false, start: '09:00', end: '17:00' }, 60), [])
})
