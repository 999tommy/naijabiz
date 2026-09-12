type Message = { role: 'user' | 'assistant' | 'system'; content: string; sentAt?: string; timestamp?: string }

const LAGOS_TIME_ZONE = 'Africa/Lagos'

function formatLagosDateTime(date: Date) {
    return new Intl.DateTimeFormat('en-NG', {
        timeZone: LAGOS_TIME_ZONE,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date)
}

function formatMessageTime(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return formatLagosDateTime(date)
}

export function buildAssistantContext(now = new Date()) {
    return `CURRENT CONTEXT:
- Current date and time in Africa/Lagos: ${formatLagosDateTime(now)}.
- Treat words like today, tomorrow, tonight, this morning, and next week relative to the current Africa/Lagos date and time.
- Use the previous messages as active memory. Do not ask for details the customer already gave unless something is unclear or contradictory.
- If a customer changes a detail, use the newest confirmed detail and politely acknowledge the update.
- For appointments, never say a booking is confirmed until the customer has confirmed the exact date and time.`
}

export function normalizeMessagesForAi(messages: Message[]): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
    return messages.map(message => {
        const sentAt = message.sentAt ? formatMessageTime(message.sentAt) : message.timestamp
        return {
            role: message.role,
            content: sentAt ? `[Message sent: ${sentAt}]\n${message.content}` : message.content,
        }
    })
}
