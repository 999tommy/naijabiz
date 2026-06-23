'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Copy, Check, Share2, Wallet, Banknote } from 'lucide-react'
import { User } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface ReferralCardProps {
    user: User
    referralStats: {
        payingReferredCount: number
        payoutRounds: number
    }
}

export function ReferralCard({ user, referralStats }: ReferralCardProps) {
    const [copied, setCopied] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [isEditingBank, setIsEditingBank] = useState(false)
    const [bankName, setBankName] = useState(user.referral_payment_details?.bankName || '')
    const [accountNumber, setAccountNumber] = useState(user.referral_payment_details?.accountNumber || '')
    const [accountName, setAccountName] = useState(user.referral_payment_details?.accountName || '')
    const { toast } = useToast()

    useEffect(() => {
        setMounted(true)
    }, [])

    const referralLink = mounted ? `${window.location.origin}/signup?ref=${user.business_slug}` : `...`
    
    // Logic: calculate progress towards the NEXT 5
    const payingCount = referralStats.payingReferredCount
    const roundsPaid = referralStats.payoutRounds
    
    // We only process payouts for every 5 paying users.
    // If they have referred 7, and 1 round is paid, progress is 7 - (1 * 5) = 2.
    // If they refer 10, and 1 round is paid, progress is 10 - 5 = 5 (waiting for payment).
    const currentProgress = Math.max(0, payingCount - (roundsPaid * 5))
    const target = 5
    const percentage = Math.min((currentProgress / target) * 100, 100)

    const handleCopy = () => {
        if (!mounted) return
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join me on NaijaBiz',
                    text: 'Create a free business page on NaijaBiz!',
                    url: referralLink,
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            handleCopy()
        }
    }

    const handleJoinSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsJoining(true)

        try {
            const res = await fetch('/api/referral/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bankName, accountNumber, accountName })
            })

            if (res.ok) {
                toast({
                    title: 'Success!',
                    description: 'Your bank details have been saved.',
                })
                // Refresh the page to get the updated user state
                window.location.reload()
            } else {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save details')
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message,
            })
        } finally {
            setIsJoining(false)
        }
    }

    // Show the onboarding form if they haven't joined yet, OR if they are editing
    if (!user.has_joined_referral || isEditingBank) {
        return (
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wallet className="w-24 h-24 text-indigo-600" />
                </div>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                        <Banknote className="w-5 h-5 text-indigo-600" />
                        {isEditingBank ? 'Update Bank Details' : 'Join the NaijaBiz Cash Referral Program'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!isEditingBank && (
                        <p className="text-sm text-indigo-700 mb-6">
                            Make up to <span className="font-bold">₦60,000</span> referring businesses to NaijaBiz! 
                            When a business subscribes to Pro through your link, you get a commission. 
                            Refer 5 paying businesses and you'll receive ₦3,000 sent directly to your bank account within an hour.
                        </p>
                    )}
                    
                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-indigo-900">Bank Name</label>
                            <Input required value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Opay, Kuda, GTBank" className="bg-white/70" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-indigo-900">Account Number</label>
                            <Input required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="10-digit account number" className="bg-white/70" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-indigo-900">Account Name</label>
                            <Input required value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account holder name" className="bg-white/70" />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={isJoining} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">
                                {isJoining ? 'Saving...' : 'Save Bank Details'}
                            </Button>
                            {isEditingBank && (
                                <Button type="button" variant="outline" onClick={() => setIsEditingBank(false)}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gift className="w-24 h-24 text-indigo-600" />
            </div>

            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-indigo-900">
                        <Gift className="w-5 h-5 text-indigo-600" />
                        Cash Referral Program
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBank(true)} className="text-indigo-600 h-8 px-2 text-xs">
                        Edit Bank Details
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-indigo-700">
                        Make up to <span className="font-bold">₦60,000</span> referring businesses! 
                        For every <span className="font-bold">{target} paying businesses</span> you refer, you earn ₦3,000 paid to your bank account within an hour.
                    </p>

                    {/* Progress */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-indigo-900">
                            <span>Your Progress</span>
                            <span>{currentProgress} / {target} Paying Users</span>
                        </div>
                        <div className="h-3 w-full bg-indigo-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        {currentProgress >= target && (
                            <p className="text-xs text-green-600 font-bold mt-1">
                                Goal reached! You will receive your payout soon.
                            </p>
                        )}
                    </div>

                    {/* Link */}
                    <div className="flex gap-2">
                        <div className="flex-1 min-w-0 bg-white border border-indigo-200 rounded-lg px-3 py-2 text-sm text-gray-600 truncate font-mono">
                            {user.business_slug ? referralLink : '...'}
                        </div>
                        <Button size="icon" variant="outline" onClick={handleCopy} className="shrink-0 border-indigo-200 hover:bg-indigo-50 text-indigo-700">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
