import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { UpvoteButton } from '@/components/UpvoteButton'
import { SearchSection } from '@/components/SearchSection'
import { ArrowLeft, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const supabase = await createClient()

    let businesses: any[] = []

    if (query) {
        const { data } = await supabase
            .from('users')
            .select('id, business_name, business_slug, description, logo_url, upvotes, is_verified, plan, location')
            .or(`business_name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
            .order('is_verified', { ascending: false })
            .order('upvotes', { ascending: false, nullsFirst: false })
            .limit(50)

        businesses = data || []
    }

    return (
        <div className="min-h-screen bg-[#faf8f3]">
            {/* Navbar Minimal */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </Button>
                        </Link>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/small-logo.png" alt="NaijaBiz" width={28} height={28} />
                            <span className="font-bold text-lg text-gray-900 leading-none">NaijaBiz</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <SearchSection />

                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">
                        {query ? `Results for "${query}"` : 'Search NaijaBiz'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {businesses.length} businesses found
                    </p>
                </div>

                <div className="space-y-4">
                    {businesses.length > 0 ? (
                        businesses.map((biz) => (
                            <div key={biz.id} className="group relative rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all overflow-hidden">
                                <div className="flex items-start gap-3 p-3 sm:p-4">
                                    {/* Logo */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 overflow-hidden relative">
                                            {biz.logo_url ? (
                                                <Image
                                                    src={biz.logo_url}
                                                    alt={biz.business_name || ''}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl bg-orange-100 text-orange-600 font-bold">
                                                    {(biz.business_name || 'B').charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Business Info */}
                                    <div className="flex-1 min-w-0 pr-12">
                                        <Link href={`/${biz.business_slug}`} className="focus:outline-none block">
                                            <span className="absolute inset-0" aria-hidden="true" />
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight flex items-center gap-1">
                                                    {biz.business_name}
                                                    {biz.is_verified && <VerifiedBadge size="sm" showText={false} />}
                                                </h3>

                                                {biz.location && (
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {biz.location}
                                                    </p>
                                                )}

                                                <p
                                                    className="text-sm text-gray-500 leading-snug line-clamp-2"
                                                >
                                                    {biz.description || 'No description provided.'}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Upvote Button */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <UpvoteButton userId={biz.id} initialUpvotes={biz.upvotes || 0} size="sm" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        query && (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 mb-4">No businesses found matching "{query}".</p>
                                <Link href="/signup">
                                    <Button variant="outline">Are you a business? Create a page</Button>
                                </Link>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
