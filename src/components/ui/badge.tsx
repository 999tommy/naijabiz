import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'verified' | 'pro' | 'pending' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                {
                    'bg-gray-100 text-gray-800': variant === 'default',
                    'bg-green-100 text-green-700 border border-green-200': variant === 'verified',
                    'bg-orange-100 text-orange-700 border border-orange-200': variant === 'pro',
                    'bg-yellow-100 text-yellow-700 border border-yellow-200': variant === 'pending',
                    'border border-gray-300 text-gray-600 bg-transparent': variant === 'outline',
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }
