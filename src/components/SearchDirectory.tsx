'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BusinessCard } from '@/components/BusinessCard'
import { Search, MapPin, Filter, X } from 'lucide-react'
import type { User, Category } from '@/lib/types'

interface SearchDirectoryProps {
    initialBusinesses?: (User & { category?: Category })[]
    showFilters?: boolean
    limit?: number
}

export function SearchDirectory({ initialBusinesses = [], showFilters = true, limit }: SearchDirectoryProps) {
    const [businesses, setBusinesses] = useState<(User & { category?: Category })[]>(initialBusinesses)
    const [categories, setCategories] = useState<Category[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedLocation, setSelectedLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const supabase = createClient()

    const locations = [
        'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano',
        'Enugu', 'Benin City', 'Kaduna', 'Onitsha', 'Owerri'
    ]

    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('*').order('name')
            if (data) setCategories(data)
        }
        fetchCategories()
    }, [supabase])

    useEffect(() => {
        async function fetchBusinesses() {
            setLoading(true)

            let query = supabase
                .from('users')
                .select('*, category:categories(*)')
                .not('business_name', 'is', null)
                .order('is_verified', { ascending: false })
                .order('plan', { ascending: false })
                .order('created_at', { ascending: false })

            if (searchQuery) {
                query = query.ilike('business_name', `%${searchQuery}%`)
            }

            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory)
            }

            if (selectedLocation) {
                query = query.ilike('location', `%${selectedLocation}%`)
            }

            if (limit) {
                query = query.limit(limit)
            }

            const { data } = await query

            if (data) {
                setBusinesses(data)
            }
            setLoading(false)
        }

        const debounce = setTimeout(fetchBusinesses, 300)
        return () => clearTimeout(debounce)
    }, [searchQuery, selectedCategory, selectedLocation, limit, supabase])

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('')
        setSelectedLocation('')
    }

    const hasFilters = searchQuery || selectedCategory || selectedLocation

    return (
        <div className="w-full">
            {/* Search Bar */}
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        type="text"
                        placeholder="Search businesses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {showFilters && (
                    <Button
                        variant="outline"
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="lg:hidden"
                    >
                        <Filter className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Filters */}
            {showFilters && (
                <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block mb-6`}>
                    <div className="flex flex-wrap gap-2">
                        {/* Category Filter */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 px-3 rounded-lg border-2 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Location Filter */}
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="h-10 pl-9 pr-3 rounded-lg border-2 border-gray-200 bg-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">All Locations</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasFilters && (
                            <Button variant="ghost" onClick={clearFilters} className="text-gray-500">
                                <X className="w-4 h-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading businesses...
                    </div>
                ) : businesses.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <p className="text-lg font-medium">No businesses found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    businesses.map((business, index) => (
                        <BusinessCard
                            key={business.id}
                            business={business}
                            rank={index + 1}
                            isNew={new Date(business.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
