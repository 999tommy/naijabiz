import { BrandThinkingOrb } from '@/components/ui/BrandThinkingOrb'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <BrandThinkingOrb state="working" size={64} />
                <p className="text-sm font-medium text-orange-600 animate-pulse">
                    Loading Qriblo...
                </p>
            </div>
        </div>
    )
}