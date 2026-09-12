export type CustomerMessage = {
    role: 'user' | 'assistant'
    content: string
}

const MAX_MESSAGES = 24
const MAX_MESSAGE_LENGTH = 2_000
const SENT_METADATA_PATTERN = /^\s*\[Message sent:[^\]]+\]\s*/gim

function stripOrderSummaries(text: string) {
    let remaining = text
    const marker = '[ORDER_SUMMARY:'
    let start = remaining.indexOf(marker)

    while (start !== -1) {
        const jsonStart = remaining.indexOf('{', start)
        if (jsonStart === -1) break
        let depth = 0
        let inString = false
        let escaped = false
        let end = -1

        for (let index = jsonStart; index < remaining.length; index += 1) {
            const character = remaining[index]
            if (inString) {
                if (escaped) escaped = false
                else if (character === '\\') escaped = true
                else if (character === '"') inString = false
                continue
            }
            if (character === '"') inString = true
            else if (character === '{') depth += 1
            else if (character === '}' && --depth === 0) {
                const bracket = remaining.indexOf(']', index)
                end = bracket === -1 ? index + 1 : bracket + 1
                break
            }
        }

        if (end === -1) break
        remaining = `${remaining.slice(0, start)}${remaining.slice(end)}`
        start = remaining.indexOf(marker)
    }

    return remaining
}

/**
 * The website sends chat history back with every request. Keep it customer-only,
 * bounded, and free of UI/system metadata before it reaches the model.
 */
export function normalizeCustomerConversation(value: unknown): CustomerMessage[] {
    if (!Array.isArray(value)) return []

    return value
        .filter((message): message is Record<string, unknown> => Boolean(message) && typeof message === 'object')
        .filter(message => message.role === 'user' || message.role === 'assistant')
        .map(message => ({
            role: message.role as CustomerMessage['role'],
            content: stripOrderSummaries(
                String(message.content || '')
                    .replace(/\u0000/g, '')
                    .replace(SENT_METADATA_PATTERN, '')
            ).trim().slice(0, MAX_MESSAGE_LENGTH),
        }))
        .filter(message => message.content.length > 0)
        .slice(-MAX_MESSAGES)
}

export function cleanCustomerReply(reply: string) {
    return String(reply || '')
        .replace(SENT_METADATA_PATTERN, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}
