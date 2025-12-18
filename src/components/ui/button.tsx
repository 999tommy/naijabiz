'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive'
    size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    {
                        'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25': variant === 'default',
                        'border-2 border-orange-500 bg-transparent text-orange-600 hover:bg-orange-50': variant === 'outline',
                        'bg-transparent text-gray-700 hover:bg-gray-100': variant === 'ghost',
                        'text-orange-600 underline-offset-4 hover:underline': variant === 'link',
                        'bg-red-500 text-white hover:bg-red-600': variant === 'destructive',
                    },
                    {
                        'h-11 px-6 py-2': size === 'default',
                        'h-9 px-4 text-xs': size === 'sm',
                        'h-12 px-8 text-base': size === 'lg',
                        'h-10 w-10': size === 'icon',
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button }
