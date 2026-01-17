import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface VerifiedBadgeProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    variant?: 'auto' | 'pro' | 'community' // Force variant if needed, mostly handled by props
    isVerified?: boolean // True means PRO Verified
    isCommunityVerified?: boolean // Logic passed from parent
}

export function VerifiedBadge({
    className,
    size = 'md',
    showText = true,
    isVerified = true, // Default to true for backward compat if purely used for Pro before
    isCommunityVerified = false
}: VerifiedBadgeProps) {

    // Size variants
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'
    const textSize = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'

    // If official verified (Pro)
    if (isVerified) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("inline-flex items-center gap-1", className)}>
                            <BadgeCheck className={cn(iconSize, "text-green-500 fill-green-50")} />
                            {showText && <span className={cn("font-semibold text-green-700", textSize)}>Verified</span>}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Official Verified Business (Pro)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    // If Community Verified (Free but trusted)
    if (isCommunityVerified) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("inline-flex items-center gap-1", className)}>
                            <ShieldCheck className={cn(iconSize, "text-yellow-500 fill-yellow-50")} />
                            {showText && <span className={cn("font-semibold text-yellow-600", textSize)}>Trusted</span>}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Community Trusted (Active & Reviewed)</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return null
}
