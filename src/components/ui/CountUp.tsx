'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface CountUpProps {
    value: number
    suffix?: string
    duration?: number
    className?: string
}

export function CountUp({ value, suffix = '', duration = 1.6, className }: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: '-40px' })
    const [display, setDisplay] = useState(0)

    useEffect(() => {
        if (!inView) return
        let raf = 0
        const start = performance.now()
        const tick = (now: number) => {
            const progress = Math.min((now - start) / (duration * 1000), 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const next = Math.round(eased * value)
            setDisplay(next)
            if (progress < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
    }, [inView, value, duration])

    return (
        <span ref={ref} className={className}>
            {display.toLocaleString()}
            {suffix}
        </span>
    )
}