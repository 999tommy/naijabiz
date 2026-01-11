'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { getCategoryIcon } from '@/lib/category-icons'
import type { Category } from '@/lib/types'

interface CategorySelectProps {
    value: string
    onChange: (value: string) => void
    categories: Category[]
    placeholder?: string
    className?: string
}

export function CategorySelect({ value, onChange, categories, placeholder = 'Select...', className }: CategorySelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedCategory = categories.find(c => c.id === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full h-11 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-gray-300 transition-colors"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="flex items-center gap-2 truncate">
                    {selectedCategory ? (
                        <>
                            <span className="text-gray-500">{getCategoryIcon(selectedCategory.name)}</span>
                            <span className="text-gray-900">{selectedCategory.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-500">{placeholder}</span>
                    )}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                                onChange(category.id)
                                setIsOpen(false)
                            }}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-gray-500">{getCategoryIcon(category.name)}</span>
                                <span className="text-gray-900">{category.name}</span>
                            </span>
                            {value === category.id && (
                                <Check className="w-4 h-4 text-orange-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
