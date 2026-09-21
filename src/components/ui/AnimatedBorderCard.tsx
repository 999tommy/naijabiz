'use client'

import type { ReactNode } from 'react'
import { BorderBeam, type BorderBeamSize } from 'border-beam'

interface AnimatedBorderCardProps {
    children: ReactNode
    className?: string
    colorVariant?: 'colorful' | 'mono' | 'ocean' | 'sunset'
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
    const beamSize: BorderBeamSize = size <= 90 ? 'sm' : 'md'
    return (
        <div className={className}>
            {children}
            <BorderBeam
                size={beamSize}
                colorVariant={colorVariant}
                theme={theme}
                duration={duration}
                strength={strength}
                borderRadius={borderRadius}
            >{null}</BorderBeam>
        </div>
    )
}