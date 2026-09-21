import { BrandThinkingOrb } from '@/components/ui/BrandThinkingOrb'

export default function Loading() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
                <BrandThinkingOrb state="working" size={64} />
                <p className="text-sm font-medium text-orange-600 animate-pulse">
                    Loading your referral dashboard...
                </p>
            </div>
        </div>
    )
}