'use client'

import type { CSSProperties, ReactNode } from 'react'
import BorderBeam from 'border-beam'

interface AnimatedBorderCardProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
    colorVariant?: 'colorful' | 'mono' | 'ocean' | 'sunset'
    theme?: 'dark' | 'light'
    duration?: number
    strength?: number
    borderRadius?: number
}

export function AnimatedBorderCard({
    children,
    className = 'relative rounded-3xl',
    style,
    colorVariant = 'sunset',
    theme = 'light',
    duration = 6,
    strength = 0.65,
    borderRadius = 24,
}: AnimatedBorderCardProps) {
    return (
        <BorderBeam
            colorVariant={colorVariant}
            theme={theme}
            duration={duration}
            strength={strength}
            borderRadius={borderRadius}
            className={className}
            style={style}
        >
            {children}
        </BorderBeam>
    )
}