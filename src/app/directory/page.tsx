import { createClient } from '@/lib/supabase/server'
import { SearchDirectory } from '@/components/SearchDirectory'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getInitialBusinesses() {
    const supabase = await createClient()
    const { data } = await supabase
        .from('users')
        .select('*, category:categories(*)')
        .not('business_name', 'is', null)
        .order('is_verified', { ascending: false })
        .order('plan', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50)

    return data || []
}

export default async function DirectoryPage() {
    const businesses = await getInitialBusinesses()

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
                            <span className="font-bold text-gray-900">NaijaBiz</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="outline" size="sm">Sign In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Business Directory
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Discover verified Nigerian businesses. All verified sellers have been checked for authenticity.
                    </p>
                </div>

                <SearchDirectory
                    initialBusinesses={businesses}
                    showFilters={true}
                />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 mt-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm text-gray-500">
                        © {new Date().getFullYear()} NaijaBiz. Made with ❤️ in Nigeria.
                    </p>
                </div>
            </footer>
        </div>
    )
}
