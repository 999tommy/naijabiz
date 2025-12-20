import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent shadow-lg" />
                <p className="text-sm font-medium text-orange-600 animate-pulse">
                    Loading NaijaBiz...
                </p>
            </div>
        </div>
    )
}
