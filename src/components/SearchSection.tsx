'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SearchSection() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        const encodedQuery = encodeURIComponent(query.trim())
        router.push(`/search?q=${encodedQuery}`)
    }

    const handleTagClick = (tagQuery: string) => {
        router.push(`/search?q=${encodeURIComponent(tagQuery)}`)
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-4 mt-8 mb-16 relative z-20">
            <div className="bg-white p-4 rounded-2xl shadow-xl shadow-orange-100/50 border border-orange-100">
                <div className="text-center mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-2">
                        <span className="w-8 h-px bg-gray-200"></span>
                        Start Exploring
                        <span className="w-8 h-px bg-gray-200"></span>
                    </h3>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="'Cakes in Lekki', 'Gagdets in Benin'"
                            className="w-full pl-12 pr-4 h-12 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200"
                    >
                        Search
                    </Button>
                </form>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 mr-1">Trending:</span>
                    {[
                        { label: '🍔 Food in Lagos', query: 'Food Lagos' },
                        { label: '💇‍♀️ Wigs in Abuja', query: 'Wigs Abuja' },
                        { label: '📱 Phones in Ikeja', query: 'Phones Ikeja' },
                        { label: '👗 Fashion in PH', query: 'Fashion Port Harcourt' },
                    ].map((tag) => (
                        <button
                            key={tag.label}
                            onClick={() => handleTagClick(tag.query)}
                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium rounded-full transition-colors border border-orange-100"
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
