'use client'

import type { ReactNode } from 'react'
import { BorderBeam } from 'border-beam'

interface AnimatedBorderCardProps {
    children: ReactNode
    className?: string
    colorVariant?: 'grow' | 'sunset' | 'ghost' | 'cool' | 'ocean' | 'coral' | 'forest'
    theme?: 'dark' | 'light'
    size?: number
    duration?: number
    strength?: number
    borderRadius?: number
}

export function AnimatedBorderCard({
    children,
    className = 'relative rounded-3xl',
    colorVariant = 'sunset',
    theme = 'light',
    size = 120,
    duration = 6,
    strength = 0.65,
    borderRadius = 24,
}: AnimatedBorderCardProps) {
    return (
        <div className={className}>
            {children}
            <BorderBeam
                size={size}
                colorVariant={colorVariant}
                theme={theme}
                duration={duration}
                strength={strength}
                borderRadius={borderRadius}
            />
        </div>
    )
}