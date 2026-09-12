type CatalogItem = {
    name: string
    price: number | string
    is_active?: boolean | null
    in_stock?: boolean | null
    item_type?: 'product' | 'service' | null
}

type SummaryItem = {
    name: string
    price: number
    quantity: number
}

export type OrderSummary = {
    items: SummaryItem[]
    customer_name?: string
    delivery_address?: string
    customer_contact?: string
    total: number
    type: 'product' | 'service'
    preferred_date?: string
    preferred_time?: string
}

const keyFor = (value: string) => value.trim().toLocaleLowerCase('en-NG').replace(/\s+/g, ' ')

type ParsedOrderSummary = {
    value: unknown
    start: number
    end: number
}

/** Finds a whole JSON order tag, including nested item objects and quoted braces. */
export function extractOrderSummary(text: string): ParsedOrderSummary | null {
    const start = text.indexOf('[ORDER_SUMMARY:')
    if (start === -1) return null

    const jsonStart = text.indexOf('{', start)
    if (jsonStart === -1) return null

    let depth = 0
    let inString = false
    let escaped = false

    for (let index = jsonStart; index < text.length; index += 1) {
        const character = text[index]
        if (inString) {
            if (escaped) escaped = false
            else if (character === '\\') escaped = true
            else if (character === '"') inString = false
            continue
        }

        if (character === '"') inString = true
        else if (character === '{') depth += 1
        else if (character === '}') {
            depth -= 1
            if (depth === 0) {
                const closingBracket = text.indexOf(']', index)
                if (closingBracket === -1) return null
                try {
                    return { value: JSON.parse(text.slice(jsonStart, index + 1)), start, end: closingBracket + 1 }
                } catch {
                    return null
                }
            }
        }
    }

    return null
}

export function stripOrderSummaries(text: string) {
    let remaining = text
    let tag = extractOrderSummary(remaining)
    while (tag) {
        remaining = `${remaining.slice(0, tag.start)}${remaining.slice(tag.end)}`
        tag = extractOrderSummary(remaining)
    }
    return remaining.trim()
}

/**
 * Retain a model-created checkout card only when every listed item and price is
 * present in the live catalog. This stops a persuasive reply from becoming an
 * accidental promise the owner never made.
 */
export function keepVerifiedOrderSummary(reply: string, catalog: CatalogItem[]) {
    const cleanReply = stripOrderSummaries(reply)
    const tag = extractOrderSummary(reply)
    if (!tag) return cleanReply

    try {
        const candidate = tag.value as Partial<OrderSummary>
        if (!Array.isArray(candidate.items) || !['product', 'service'].includes(candidate.type || '')) return cleanReply

        const activeCatalog = catalog.filter(item => item.is_active !== false)
        const verifiedItems: SummaryItem[] = []

        for (const item of candidate.items) {
            if (!item || typeof item.name !== 'string' || !Number.isFinite(Number(item.price))) return cleanReply
            const quantity = Number(item.quantity)
            if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return cleanReply

            const catalogItem = activeCatalog.find(entry => keyFor(entry.name) === keyFor(item.name))
            const expectedType = candidate.type === 'service' ? 'service' : 'product'
            const catalogType = catalogItem?.item_type === 'service' ? 'service' : 'product'
            if (!catalogItem || catalogType !== expectedType || (expectedType === 'product' && catalogItem.in_stock === false)) return cleanReply

            const price = Number(catalogItem.price)
            if (Number(item.price) !== price) return cleanReply
            verifiedItems.push({ name: catalogItem.name, price, quantity })
        }

        if (verifiedItems.length === 0) return cleanReply
        const total = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        if (Number(candidate.total) !== total) return cleanReply

        const verified: OrderSummary = {
            items: verifiedItems,
            total,
            type: candidate.type as 'product' | 'service',
        }

        if (typeof candidate.customer_name === 'string') verified.customer_name = candidate.customer_name.slice(0, 120)
        if (typeof candidate.delivery_address === 'string') verified.delivery_address = candidate.delivery_address.slice(0, 280)
        if (typeof candidate.customer_contact === 'string') verified.customer_contact = candidate.customer_contact.slice(0, 50)
        if (typeof candidate.preferred_date === 'string') verified.preferred_date = candidate.preferred_date.slice(0, 10)
        if (typeof candidate.preferred_time === 'string') verified.preferred_time = candidate.preferred_time.slice(0, 5)

        return `${cleanReply}\n\n[ORDER_SUMMARY: ${JSON.stringify(verified)}]`
    } catch {
        return cleanReply
    }
}
