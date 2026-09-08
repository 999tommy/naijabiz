'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, Crown, ArrowRight, Globe } from 'lucide-react'

interface SubdomainLinkCardProps {
    businessSlug: string
    isPro: boolean
}

export function SubdomainLinkCard({ businessSlug, isPro }: SubdomainLinkCardProps) {
    const [copied, setCopied] = useState(false)

    const subdomainUrl = `${businessSlug}.qriblo.com`
    const regularUrl = `qriblo.com/${businessSlug}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(`https://${subdomainUrl}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            const el = document.createElement('textarea')
            el.value = `https://${subdomainUrl}`
            document.body.appendChild(el)
            el.select()
            document.execCommand('copy')
            document.body.removeChild(el)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (isPro) {
        return (
            <div className="rounded-2xl border border-[#B84D34]/20 bg-gradient-to-br from-[#FDF8F3] to-[#fdeee8] p-4 sm:p-5 mb-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#B84D34] flex items-center justify-center flex-shrink-0">
                            <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#B84D34]">Your Pro Link</p>
                            <p className="text-[11px] text-[#6B5850]">Your own branded subdomain — share this with customers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#B84D34] flex-shrink-0">
                        <Crown className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Pro</span>
                    </div>
                </div>

                <button
                    onClick={handleCopy}
                    className="w-full group flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border border-[#B84D34]/15 hover:border-[#B84D34]/40 hover:bg-[#fff8f6] transition-all duration-200 shadow-sm"
                    title="Click to copy your subdomain link"
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-[#4ade80] flex-shrink-0 animate-pulse" />
                        <span className="font-mono text-sm font-semibold text-[#1E1410] truncate">
                            {subdomainUrl}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-[#4ade80]" />
                                <span className="text-xs font-semibold text-[#4ade80]">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 text-[#6B5850] group-hover:text-[#B84D34] transition-colors" />
                                <span className="text-xs font-semibold text-[#6B5850] group-hover:text-[#B84D34] transition-colors hidden sm:inline">Copy link</span>
                            </>
                        )}
                    </div>
                </button>

                <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] text-[#6B5850]">
                        Also accessible at{' '}
                        <Link href={`/${businessSlug}`} className="text-[#B84D34] hover:underline font-medium" target="_blank">
                            qriblo.com/{businessSlug}
                        </Link>
                    </p>
                    <Link
                        href={`https://${subdomainUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#B84D34] hover:underline"
                    >
                        View page <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        )
    }

    // Free user — show regular link with upgrade nudge
    return (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5 mb-6">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Your Link</p>
                        <p className="text-[11px] text-gray-400">Share this with customers</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200">
                <span className="font-mono text-sm font-semibold text-gray-700 truncate flex-1">
                    qriblo.com/{businessSlug}
                </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-gray-400">
                    Upgrade to Pro to get{' '}
                    <span className="font-semibold text-[#B84D34]">{businessSlug}.qriblo.com</span>
                </p>
                <Link
                    href="/pricing"
                    className="flex items-center gap-1 text-[11px] font-bold text-[#B84D34] hover:underline"
                >
                    <Crown className="w-3 h-3" /> Upgrade
                </Link>
            </div>
        </div>
    )
}
