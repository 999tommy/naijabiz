import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    className?: string
}

export function VerifiedBadge({ size = 'md', showText = true, className }: VerifiedBadgeProps) {
    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    }

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    }

    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1 border border-green-200',
                className
            )}
        >
            <CheckCircle2 className={cn(iconSizes[size], 'text-green-600 fill-green-100')} />
            {showText && (
                <span className={cn('font-semibold', textSizes[size])}>Verified</span>
            )}
        </div>
    )
}
