import Link from 'next/link'
import Image from 'next/image'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Lock,
  Search,
  MapPin,
  Smartphone,
  TrendingUp,
  Shield,
  Trophy,
  Flame,
  Clock,
  Plus,
  Star,
  ImagePlus
} from 'lucide-react'
import { UpvoteButton } from '@/components/UpvoteButton'
import { PricingSection } from '@/components/PricingSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch counts and rank businesses based on the new algorithm
  const serviceSupabase = await createServiceClient()

  // 1. Get all businesses with basic info
  const { data: allUsers } = await serviceSupabase
    .from('users')
    .select('id, business_name, business_slug, description, logo_url, upvotes, is_verified, plan, category:categories(icon)')

  // 2. Get reviews and views for aggregation
  const [
    { data: allReviews },
    { data: allViews }
  ] = await Promise.all([
    serviceSupabase.from('reviews').select('business_id, rating, created_at'),
    serviceSupabase.from('page_views').select('business_id, created_at')
  ])

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // 3. Process rankings
  const processedStats = (allUsers || []).map(user => {
    const userReviews = allReviews?.filter(r => r.business_id === user.id) || []
    const userViews = allViews?.filter(v => v.business_id === user.id) || []

    const recentReviews = userReviews.filter(r => new Date(r.created_at) > last24h)
    const recentViews = userViews.filter(v => new Date(v.created_at) > last24h)

    const avgRating = userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0

    // Business of the Day Algorithm (Focus on Daily Momentum)
    // High weight for recent activity
    const dailyScore =
      (recentReviews.length * 100) +
      (recentViews.length * 5) +
      ((user.upvotes || 0) * 0.5) +
      (user.plan === 'pro' ? 10 : 0) // Small boost for pro

    // Community Favorites Algorithm (Lifetime Impact)
    const lifetimeScore =
      ((user.upvotes || 0) * 20) +
      (userReviews.length * 50) +
      (avgRating * 100) +
      (userViews.length * 2) +
      (user.plan === 'pro' ? 200 : 0) // Larger boost for pro

    return {
      ...user,
      dailyScore,
      lifetimeScore,
      reviewCount: userReviews.length,
      viewCount: userViews.length
    }
  })

  const businessOfTheDay = [...processedStats]
    .sort((a, b) => b.dailyScore - a.dailyScore)
    .slice(0, 3)

  const topBusinesses = [...processedStats]
    .sort((a, b) => b.lifetimeScore - a.lifetimeScore)
    .slice(0, 5)

  const { count: verifiedCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  return (
    <div className="min-h-screen bg-[#faf8f3] font-sans text-[#4b587c]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/small-logo.png" alt="NaijaBiz" width={32} height={32} />
              <div className="flex items-center gap-1">
                <span className="font-bold text-xl text-gray-900 leading-none tracking-tight">NaijaBiz</span>
                <VerifiedBadge size="sm" showText={false} />
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/directory" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-500 hover:text-orange-600 font-medium">Directory</Button>
              </Link>
              <Link href="/pricing" className="hidden sm:block">
                <Button variant="ghost" className="text-gray-500 hover:text-orange-600 font-medium">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-8 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm border-gray-200 text-gray-600 hover:border-gray-300">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="h-8 px-2 text-xs sm:h-10 sm:px-4 sm:text-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md shadow-orange-100">
                  Get Verified
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
          Your business needs a <span className="text-orange-600">simple online page</span> that brings customers
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create a free business page with NaijaBiz you can share on WhatsApp and Instagram — so customers can message you, find you, and place orders easily.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-200 transform hover:-translate-y-1 transition-all">
              Create my free business page
            </Button>
          </Link>
          <Link href="/tolas-kitchen" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300">
              See example page
            </Button>
          </Link>
        </div>

        <p className="text-sm font-medium text-gray-400 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> No website needed</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-green-500" /> Works on WhatsApp</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span>Takes 2 minutes</span>
        </p>
      </section>

      {/* Leaderboards */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Business of the Day */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Business of the Day</h2>
                <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">New</span>
              </div>
              {businessOfTheDay && businessOfTheDay.length > 0 ? (
                <div className="space-y-4">
                  {businessOfTheDay.map((biz: any, i: number) => (
                    <div key={biz.id} className="group relative rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all overflow-hidden">
                      <div className="flex items-start gap-3 p-3 sm:p-4">
                        {/* Rank Badge + Logo */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 overflow-hidden relative">
                            {biz.logo_url ? (
                              <Image
                                src={biz.logo_url}
                                alt={biz.business_name || ''}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl bg-orange-100 text-orange-600 font-bold">
                                {(biz.business_name || 'B').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 bg-gray-900 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {i + 1}
                          </div>
                        </div>

                        {/* Business Info */}
                        <div className="flex-1 min-w-0 pr-12 sm:pr-16">
                          <Link href={`/${biz.business_slug}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-x-1 gap-y-1">
                              <span className="min-w-0 break-words">{biz.business_name}</span>
                              {biz.is_verified && <VerifiedBadge size="sm" showText={false} className="inline-flex align-middle" />}
                            </h3>
                            <p
                              className="text-xs sm:text-sm text-gray-500 leading-snug mt-0.5"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                              {biz.description || 'No description provided.'}
                            </p>
                          </Link>
                        </div>

                        {/* Upvote Button - Positioned absolutely */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                          <UpvoteButton userId={biz.id} initialUpvotes={biz.upvotes || 0} size="sm" className="h-8 px-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">No new businesses today. Be the first!</p>
                  <Link href="/signup">
                    <Button variant="link" className="text-orange-600">Create Page</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Overall Leaderboard */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">Community Favorites</h2>
              </div>
              {topBusinesses && topBusinesses.length > 0 ? (
                <div className="space-y-4">
                  {topBusinesses.map((biz: any, i: number) => (
                    <div key={biz.id} className="group relative rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all overflow-hidden">
                      <div className="flex items-start gap-3 p-3 sm:p-4">
                        {/* Rank Badge + Logo */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 overflow-hidden relative">
                            {biz.logo_url ? (
                              <Image
                                src={biz.logo_url}
                                alt={biz.business_name || ''}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl sm:text-2xl bg-orange-100 text-orange-600 font-bold">
                                {(biz.business_name || 'B').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center border-2 border-white ${i === 0 ? 'bg-yellow-400 text-yellow-900' :
                            i === 1 ? 'bg-gray-300 text-gray-800' :
                              i === 2 ? 'bg-orange-300 text-orange-900' :
                                'bg-gray-100 text-gray-500'
                            }`}>
                            {i + 1}
                          </div>
                        </div>

                        {/* Business Info */}
                        <div className="flex-1 min-w-0 pr-12 sm:pr-16">
                          <Link href={`/${biz.business_slug}`} className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-x-1 gap-y-1">
                              <span className="min-w-0 break-words">{biz.business_name}</span>
                              {biz.is_verified && <VerifiedBadge size="sm" showText={false} className="inline-flex align-middle" />}
                            </h3>
                            <p
                              className="text-xs sm:text-sm text-gray-500 leading-snug mt-0.5"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            >
                              {biz.description || 'No description provided.'}
                            </p>
                          </Link>
                        </div>

                        {/* Upvote Button - Positioned absolutely */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                          <UpvoteButton userId={biz.id} initialUpvotes={biz.upvotes || 0} size="sm" className="h-8 px-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">No businesses yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">How it works</h2>

          <div className="grid md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-100 -z-10"></div>

            <div className="bg-[#faf8f3] p-8 rounded-2xl border border-gray-100 relative group hover:border-orange-200 transition-colors">
              <div className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-2 border-gray-100 shadow-sm group-hover:border-orange-200 group-hover:text-orange-600 transition-all">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create your page</h3>
              <p className="text-gray-500">Enter your business name, location, photos, and what you sell. It's simple.</p>
            </div>

            <div className="bg-[#faf8f3] p-8 rounded-2xl border border-gray-100 relative group hover:border-orange-200 transition-colors">
              <div className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-2 border-gray-100 shadow-sm group-hover:border-orange-200 group-hover:text-orange-600 transition-all">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share your link</h3>
              <p className="text-gray-500">Put your NaijaBiz link on WhatsApp status, Instagram bio, or send it to customers.</p>
            </div>

            <div className="bg-[#faf8f3] p-8 rounded-2xl border border-gray-100 relative group hover:border-orange-200 transition-colors">
              <div className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-2 border-gray-100 shadow-sm group-hover:border-orange-200 group-hover:text-orange-600 transition-all">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get messages & orders</h3>
              <p className="text-gray-500">Customers click your link, see what you sell, and message you on WhatsApp to pay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Life Example */}
      {/* Real Life Example */}
      <section className="py-24 bg-gradient-to-b from-[#faf8f3] to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-600 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-700/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="text-white">
                <div className="inline-block bg-white/10 backdrop-blur rounded-full px-4 py-1 text-sm font-bold text-orange-50 mb-6 border border-white/20">
                  REAL LIFE SUCCESS STORY
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  "I stopped sending pictures manually on WhatsApp."
                </h2>
                <p className="text-orange-50 text-xl mb-10 leading-relaxed max-w-lg">
                  Madam Tola used to spend hours sending food photos to every customer. Now, she just sends her <span className="font-bold text-white border-b-2 border-white/40">naijabiz.org/tolaskitchen</span> link.
                </p>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">She looks more professional</h4>
                      <p className="text-orange-100/80">Customers trust her more simply because she has a proper business page.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">She saves 3 hours daily</h4>
                      <p className="text-orange-100/80">No more searching for photos in gallery. Everything is on her page.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20 shadow-inner">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">Sales increased by 40%</h4>
                      <p className="text-orange-100/80">Customers buy more when they can clearly see the Menu and prices.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10">
                  <Link href="/signup">
                    <Button size="lg" className="h-14 px-8 text-lg font-bold bg-white text-orange-600 hover:bg-orange-50 rounded-full shadow-xl">
                      Create your page like Tola
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative flex justify-center md:justify-end">
                {/* Visual Representation of Transformation */}
                <div className="relative">

                  {/* Phone Mockup */}
                  <div className="relative z-20 bg-white rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl w-[300px] h-[600px] overflow-hidden">
                    <div className="absolute top-0 w-full h-8 bg-gray-900 flex justify-center rounded-b-xl z-20">
                      <div className="w-16 h-4 bg-gray-800 rounded-b-lg"></div>
                    </div>

                    {/* Screen Content */}
                    <div className="h-full overflow-y-auto bg-gray-50 scrollbar-hide">
                      {/* Header */}
                      <div className="bg-white p-4 pb-2 border-b border-gray-100 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">T</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1">Tola's Kitchen <VerifiedBadge size="sm" showText={false} /></h3>
                            <p className="text-xs text-gray-500">Ikeja, Lagos</p>
                          </div>
                        </div>
                      </div>

                      {/* Cover Area */}
                      <div className="h-32 bg-orange-50 relative mb-4">
                        <div className="absolute inset-0 flex items-center justify-center text-orange-200">
                          <ImagePlus className="w-8 h-8 opacity-50" />
                        </div>
                      </div>

                      {/* Products */}
                      <div className="px-4 space-y-4 pb-20">
                        <div className="space-y-2">
                          <h4 className="font-bold text-gray-900 text-sm">Best Sellers</h4>

                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-1/2 bg-gray-100 rounded mb-2"></div>
                                <div className="flex items-center justify-between mt-1">
                                  <div className="h-3 w-16 bg-orange-100 rounded"></div>
                                  <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-0.5">
                                    <Plus className="w-3 h-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Floating WhatsApp Button */}
                      <div className="absolute bottom-4 left-4 right-4 z-20">
                        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg font-semibold h-12">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Order on WhatsApp
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements around phone */}
                  <div className="absolute -right-8 top-20 bg-white p-4 rounded-xl shadow-xl z-30 animate-pulse hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-bold text-gray-600">New Order</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₦4,500 - Jollof Rice</p>
                  </div>
                  <div className="absolute -left-8 bottom-40 bg-white p-4 rounded-xl shadow-xl z-30 hidden md:block">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-600">New Review</span>
                    </div>
                    <p className="text-sm italic text-gray-600">"Food was delicious!"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you get for free on NaijaBiz</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#faf8f3] p-6 rounded-xl border border-gray-100 flex items-start gap-4 hover:border-orange-200 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">A beautiful business page</h3>
                <p className="text-gray-500 text-sm">With your business name, photos, location, and logo.</p>
              </div>
            </div>
            <div className="bg-[#faf8f3] p-6 rounded-xl border border-gray-100 flex items-start gap-4 hover:border-orange-200 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">WhatsApp "Message Me" button</h3>
                <p className="text-gray-500 text-sm">Customers can chat with you in one click.</p>
              </div>
            </div>
            <div className="bg-[#faf8f3] p-6 rounded-xl border border-gray-100 flex items-start gap-4 hover:border-orange-200 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">A unique link (naijabiz.org/you)</h3>
                <p className="text-gray-500 text-sm">Easy to share anywhere on the internet.</p>
              </div>
            </div>
            <div className="bg-[#faf8f3] p-6 rounded-xl border border-gray-100 flex items-start gap-4 hover:border-orange-200 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">Appear in NaijaBiz search</h3>
                <p className="text-gray-500 text-sm">New customers can find you when searching your category.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />


      {/* Trust Section */}
      <section className="py-20 bg-white text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            NaijaBiz is built for Nigerian small businesses — barbers, salons, food vendors, repairers, and more.
          </h2>
          <p className="text-gray-500 text-lg mb-10">
            Join Thousands of businesses putting their business online the simple way.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#faf8f3] text-center border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to get more customers?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Create your free business page in 2 minutes.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-xl shadow-orange-200">
              Create my free business page
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-80">
          <Image src="/small-logo.png" alt="NaijaBiz" width={24} height={24} />
          <span className="font-bold text-gray-900">NaijaBiz</span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          © {new Date().getFullYear()} NaijaBiz. Made with ❤️ in Lagos. <br />
          <span className="mt-2 block">Powered by <a href="https://www.axist.cc" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 underline">Axist</a></span>
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-orange-600">Terms</Link>
          <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
          <Link href="/directory" className="hover:text-orange-600">Directory</Link>
        </div>
      </footer>
    </div>
  )
}
