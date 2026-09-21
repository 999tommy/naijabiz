'use client'

import type { CSSProperties } from 'react'
import { ThinkingOrb } from 'thinking-orbs'

/**
 * Brand-tinted ThinkingOrb.
 *
 * `thinking-orbs` deliberately ships a strict monochrome palette (light ink
 * on dark substrates, dark ink on light) so it can't render in colour. This
 * wrapper pins the orb to the light theme (dark ink) and remaps that ink ramp
 * onto Qriblo's burnt-orange brand colour via a CSS filter, preserving the
 * engine's shaded depth exactly.
 */
const ORANGE_INK_FILTER = 'sepia(99.7%) saturate(1000.9%) hue-rotate(315.5deg)'

interface BrandThinkingOrbProps {
    state?: 'working' | 'searching' | 'solving' | 'listening' | 'connecting' | 'weaving' | 'composing' | 'breathing' | 'shaping'
    size?: 64 | 20
    speed?: number
    tinted?: boolean
    className?: string
    style?: CSSProperties
    'aria-label'?: string
}

export function BrandThinkingOrb({
    state = 'working',
    size = 64,
    speed,
    tinted = true,
    className,
    style,
    'aria-label': ariaLabel,
}: BrandThinkingOrbProps) {
    return (
        <ThinkingOrb
            state={state}
            size={size}
            theme="light"
            speed={speed}
            className={className}
            style={{
                ...(tinted ? { filter: ORANGE_INK_FILTER } : {}),
                ...style,
            }}
            aria-label={ariaLabel}
        />
    )
}