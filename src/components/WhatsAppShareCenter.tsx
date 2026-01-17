'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Copy, Share2, Trophy } from "lucide-react"
import { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface WhatsAppShareCenterProps {
    user: User
    rank?: number // Optional rank from leaderboard
}

export function WhatsAppShareCenter({ user, rank }: WhatsAppShareCenterProps) {
    const { toast } = useToast()

    const businessUrl = `https://naijabiz.org/${user.business_slug}`

    const templates = [
        {
            title: "Promote Your Page",
            text: `✨ Check out my business page on NaijaBiz!\n\nSee my products & prices here: ${businessUrl}\n\nMessage me to order! 📲`
        },
        {
            title: "Ask for Reviews",
            text: `👋 Hey! Thanks for being a loyal customer.\n\nPlease leave me a 5-star review on NaijaBiz, it helps me get Verified!\n\nReview here: ${businessUrl}/review`
        }
    ]

    // Dynamic Achievement Template
    if (rank && rank <= 10) {
        templates.unshift({
            title: "🔥 Share Your Rank",
            text: `🏆 I'm trending as #${rank} Business of the Day on NaijaBiz!\n\nCome support my business: ${businessUrl}`
        })
    }

    const handleShare = (text: string) => {
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied!",
            description: "Text copied to clipboard.",
        })
    }

    return (
        <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                    <Share2 className="w-5 h-5" />
                    Growth Center
                </CardTitle>
                <CardDescription>
                    Get more customers by sharing these templates on your WhatsApp Status.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {templates.map((template, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-1">
                                {template.title.includes('Rank') && <Trophy className="w-3 h-3 text-orange-500" />}
                                {template.title}
                            </h4>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(template.text)}>
                                    <Copy className="w-3 h-3 text-gray-400" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mb-3 font-mono whitespace-pre-wrap line-clamp-2">
                            {template.text}
                        </p>
                        <Button
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold h-8 flex items-center gap-2"
                            onClick={() => handleShare(template.text)}
                        >
                            <MessageCircle className="w-3 h-3" /> Share on WhatsApp
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
