import Link from 'next/link'
import Image from 'next/image'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Search,
  Smartphone,
  TrendingUp,
  Shield,
  Trophy,
  Flame,
  Star,
  Globe,
  Bot,
  Banknote,
  Zap,
  Users,
  ImagePlus,
} from 'lucide-react'
import { UpvoteButton } from '@/components/UpvoteButton'
import { PricingSection } from '@/components/PricingSection'
import { SearchSection } from '@/components/SearchSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const serviceSupabase = await createServiceClient()

  const { data: allUsers } = await serviceSupabase
    .from('users')
    .select('id, business_name, business_slug, description, logo_url, upvotes, is_verified, plan, category:categories(icon)')

  const [
    { data: allReviews },
    { data: allViews }
  ] = await Promise.all([
    serviceSupabase.from('reviews').select('business_id, rating, created_at'),
    serviceSupabase.from('page_views').select('business_id, created_at')
  ])

  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const processedStats = (allUsers || []).map(user => {
    const userReviews = allReviews?.filter(r => r.business_id === user.id) || []
    const userViews = allViews?.filter(v => v.business_id === user.id) || []
    const recentReviews = userReviews.filter(r => new Date(r.created_at) > last24h)
    const recentViews = userViews.filter(v => new Date(v.created_at) > last24h)
    const avgRating = userReviews.length > 0
      ? userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length
      : 0
    const dailyScore =
      (recentReviews.length * 100) +
      (recentViews.length * 5) +
      ((user.upvotes || 0) * 0.5) +
      (user.plan === 'pro' ? 10 : 0)
    const lifetimeScore =
      ((user.upvotes || 0) * 20) +
      (userReviews.length * 50) +
      (avgRating * 100) +
      (userViews.length * 2) +
      (user.plan === 'pro' ? 200 : 0)
    return { ...user, dailyScore, lifetimeScore, reviewCount: userReviews.length, viewCount: userViews.length }
  })

  const businessOfTheDay = [...processedStats].sort((a, b) => b.dailyScore - a.dailyScore).slice(0, 3)
  const topBusinesses = [...processedStats].sort((a, b) => b.lifetimeScore - a.lifetimeScore).slice(0, 5)

  return (
    <div className="min-h-screen font-sans" style={{ background: '#f0eeea', color: '#1a1a1a' }}>

      {/* ── NAVBAR — floating glass pill like Timmo ── */}
      <nav className="sticky top-0 z-50 px-3 pt-4 sm:px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="flex justify-between items-center h-14 px-3 rounded-2xl sm:px-5"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: '0 2px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <Link href="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <Image src="/small-logo.png" alt="NaijaBiz" width={28} height={28} className="w-6 sm:w-7" style={{ height: 'auto' }} />
              <span className="truncate text-base font-bold text-gray-900 tracking-tight sm:text-lg">NaijaBiz</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { href: '/directory', label: 'Directory' },
                { href: '/pricing', label: 'Pricing' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-1.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              <Link href="/login">
                <button
                  className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-black/5 transition-all sm:px-4 sm:text-sm"
                >
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="whitespace-nowrap px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 sm:px-4 sm:text-sm"
                  style={{ background: '#da552f' }}
                >
                  <span className="sm:hidden">Start ↗</span>
                  <span className="hidden sm:inline">Get Started ↗</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── HERO — full-bleed Timmo-style ── */}
      <section className="pt-16 pb-12 px-4 text-center max-w-5xl mx-auto">

        {/* Social proof pill */}
        <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full" style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(12px)',
        }}>
          <div className="flex -space-x-1.5">
            {['🍳', '💇', '👗', '🔧'].map((emoji, i) => (
              <span
                key={i}
                className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs"
              >{emoji}</span>
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">Used by 1,000+ Nigerian brands</span>
        </div>

        {/* Timmo-style headline: bold sans + large italic serif mix */}
        <h1 className="mb-6 tracking-tight leading-[1.05]">
          <span
            className="block text-5xl font-black text-gray-900"
          >
            Your brand needs an
          </span>
          <span
            className="block font-light text-5xl font-black"
            style={{
              fontStyle: 'italic',
              color: '#da552f',
              fontFamily: 'Georgia, "Times New Roman", serif',
              letterSpacing: '-0.02em',
            }}
          >
            AI-powered website
          </span>
          <span className="block text-5xl font-black text-gray-900">
            that sells for you
          </span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create a free professional store for your brand. Now with an AI Assistant that replies to customers while you sleep.
        </p>

        {/* CTA Buttons — Timmo pill style */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link href="/signup">
            <button
              className="h-14 px-8 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-lg flex items-center gap-2"
              style={{ background: '#1a1a1a', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
            >
              Create My AI Brand Page ↗
            </button>
          </Link>
          <Link href="/tolas-kitchen">
            <button
              className="h-14 px-8 rounded-2xl text-base font-semibold text-gray-700 bg-white transition-all hover:bg-gray-50 hover:-translate-y-0.5 flex items-center gap-2"
              style={{ border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              See example page
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, text: 'Free forever' },
            { icon: <Bot className="w-3.5 h-3.5 text-orange-500" />, text: 'AI Auto-Replies' },
            { icon: <Banknote className="w-3.5 h-3.5 text-green-500" />, text: 'Earn ₦60k by referring' },
          ].map(({ icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {icon} {text}
            </span>
          ))}
        </div>

        <div className="mt-12">
          <SearchSection />
        </div>
      </section>

      {/* ── BENTO GRID — Features inspired by Timmo's widget showcase ── */}
      <section className="py-16 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto min-w-0">

          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              A business page that actually works
            </h2>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[160px]">

            {/* Large card — AI Assistant (spans 2 cols × 2 rows) */}
            <div
              className="col-span-2 row-span-2 rounded-3xl p-7 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #da552f 0%, #c44422 100%)',
                boxShadow: '0 12px 48px rgba(218,85,47,0.30)',
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                style={{ background: 'white', transform: 'translate(-30%, 30%)' }} />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-black text-2xl leading-tight mb-2">AI Sales Assistant</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Automatically replies to customers for you — even when you're busy or asleep.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Now Included</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">Pro</span>
              </div>
            </div>

            {/* Shoppable Reels */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <Smartphone className="w-6 h-6 text-orange-500" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Shoppable Reels</h3>
                <p className="text-gray-500 text-xs leading-relaxed">TikTok-style product view for your store</p>
              </div>
            </div>

            {/* Verified Badge */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <Shield className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Verified Badge</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Build instant trust with customers</p>
              </div>
            </div>

            {/* Unique Link — spans 2 cols */}
            <div
              className="col-span-2 rounded-3xl p-5 flex items-center gap-5"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Your unique link</h3>
                <p className="text-gray-400 text-xs font-mono">naijabiz.org/<span className="text-orange-500">yourbrand</span></p>
              </div>
            </div>

            {/* Analytics */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Analytics</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Track views and growth</p>
              </div>
            </div>

            {/* Reviews */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Customer Reviews</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Collect and display 5-star reviews</p>
              </div>
            </div>

            {/* WhatsApp Orders — spans 2 cols */}
            <div
              className="col-span-2 rounded-3xl p-5 flex items-center gap-5"
              style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                border: '1px solid #86efac',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">WhatsApp Orders</h3>
                <p className="text-gray-600 text-xs leading-relaxed">Customers order directly to your WhatsApp in one tap</p>
              </div>
            </div>

            {/* Search Discovery */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <Search className="w-6 h-6 text-purple-500" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Get Discovered</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Appear in NaijaBiz search</p>
              </div>
            </div>

            {/* Referral Earnings */}
            <div
              className="rounded-3xl p-5 flex flex-col justify-between"
              style={{
                backdropFilter: 'blur(16px) saturate(180%)',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              }}
            >
              <Banknote className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="font-black text-gray-900 text-base mb-1">Earn ₦60k</h3>
                <p className="text-gray-500 text-xs leading-relaxed">Refer brands and earn commissions</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LEADERBOARDS — live community section ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">Live Rankings</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">
              The NaijaBiz community
            </h2>
          </div>

          <div
            className="w-full max-w-full rounded-3xl p-4 md:p-10 overflow-hidden"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <div className="grid min-w-0 lg:grid-cols-2 gap-10">

              {/* Business of the Day */}
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2 mb-5">
                  <span className="text-xl flex-shrink-0">🔥</span>
                  <h3 className="min-w-0 text-lg font-black text-gray-900 truncate">Business of the Day</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">New</span>
                </div>
                {businessOfTheDay && businessOfTheDay.length > 0 ? (
                  <div className="space-y-3">
                    {businessOfTheDay.map((biz: any, i: number) => (
                      <div
                        key={biz.id}
                        className="group relative flex w-full max-w-full min-w-0 items-center gap-3 p-3 rounded-2xl transition-all overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden relative">
                            {biz.logo_url ? (
                              <Image src={biz.logo_url} alt={biz.business_name || ''} fill className="object-cover" sizes="44px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg bg-orange-100 text-orange-600 font-bold">
                                {(biz.business_name || 'B').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1 -left-1 w-5 h-5 bg-gray-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-16 overflow-hidden">
                          <Link href={`/${biz.business_slug}`} className="block">
                            <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                            <p className="flex min-w-0 items-center gap-1 text-sm font-bold text-gray-900">
                              <span className="min-w-0 truncate">{biz.business_name}</span>
                              {biz.is_verified && <VerifiedBadge size="sm" showText={false} className="flex-shrink-0" />}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{biz.description || 'No description'}</p>
                          </Link>
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                          <UpvoteButton userId={biz.id} initialUpvotes={biz.upvotes || 0} size="sm" className="h-8 px-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm mb-2">No new businesses today. Be first!</p>
                    <Link href="/signup" className="text-orange-600 text-sm font-semibold hover:underline">Create Page</Link>
                  </div>
                )}
              </div>

              {/* Community Favorites */}
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2 mb-5">
                  <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  <h3 className="min-w-0 text-lg font-black text-gray-900 truncate">Community Favorites</h3>
                </div>
                {topBusinesses && topBusinesses.length > 0 ? (
                  <div className="space-y-3">
                    {topBusinesses.map((biz: any, i: number) => (
                      <div
                        key={biz.id}
                        className="group relative flex w-full max-w-full min-w-0 items-center gap-3 p-3 rounded-2xl transition-all overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.6)',
                          border: '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden relative">
                            {biz.logo_url ? (
                              <Image src={biz.logo_url} alt={biz.business_name || ''} fill className="object-cover" sizes="44px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg bg-orange-100 text-orange-600 font-bold">
                                {(biz.business_name || 'B').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className={`absolute -top-1 -left-1 w-5 h-5 text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white ${i === 0 ? 'bg-yellow-400 text-yellow-900' : i === 1 ? 'bg-gray-300 text-gray-800' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}`}>
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-16 overflow-hidden">
                          <Link href={`/${biz.business_slug}`} className="block">
                            <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
                            <p className="flex min-w-0 items-center gap-1 text-sm font-bold text-gray-900">
                              <span className="min-w-0 truncate">{biz.business_name}</span>
                              {biz.is_verified && <VerifiedBadge size="sm" showText={false} className="flex-shrink-0" />}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{biz.description || 'No description'}</p>
                          </Link>
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                          <UpvoteButton userId={biz.id} initialUpvotes={biz.upvotes || 0} size="sm" className="h-8 px-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No businesses yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — numbered steps like Timmo ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-3">Simple process</p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Create your page', desc: 'Enter your business name, location, photos, and what you sell. It\'s simple.', icon: <ImagePlus className="w-5 h-5" /> },
              { step: '02', title: 'Share your link', desc: 'Put your NaijaBiz link on WhatsApp status, Instagram bio, or send it to customers.', icon: <Globe className="w-5 h-5" /> },
              { step: '03', title: 'Get messages & orders', desc: 'Customers click your link, see what you sell, and message you on WhatsApp to pay.', icon: <MessageCircle className="w-5 h-5" /> },
            ].map(({ step, title, desc, icon }) => (
              <div
                key={step}
                className="rounded-3xl p-7 relative group hover:-translate-y-1 transition-all duration-200"
                style={{
                  backdropFilter: 'blur(16px) saturate(180%)',
                  background: 'rgba(255,255,255,0.72)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
                }}
              >
                <div className="text-6xl font-black text-gray-100 absolute top-5 right-6 select-none">{step}</div>
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
                    {icon}
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REAL LIFE EXAMPLE — Timmo-style wide card ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
            }}
          >
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(218,85,47,0.3) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(218,85,47,0.15) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

            <div className="relative z-10 p-8 md:p-14">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Real life example</span>
              </div>

              <div className="md:grid md:grid-cols-2 md:gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    "I finally stopped sending pictures manually."
                  </h2>
                  <p className="text-white/60 text-base leading-relaxed mb-8">
                    Madam Tola used to spend hours sending food photos to every new customer. Now, she just sends her{' '}
                    <span className="text-orange-400 font-bold">NaijaBiz link</span>.
                  </p>
                  <Link href="/signup">
                    <button
                      className="h-12 px-7 rounded-2xl text-sm font-bold text-gray-900 bg-white hover:bg-gray-100 transition-all flex items-center gap-2"
                    >
                      Create your page like Tola <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>

                <div className="mt-8 md:mt-0 grid grid-cols-1 gap-3">
                  {[
                    { title: 'Full Menu', desc: 'Shoppers see full menu and prices instantly.', icon: '📋' },
                    { title: 'Saves Time', desc: 'No more searching gallery for photos to forward.', icon: '⏱️' },
                    { title: 'More Sales', desc: 'Easier for customers to choose and pay.', icon: '📈' },
                  ].map(({ title, desc, icon }) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="text-white font-bold text-sm">{title}</p>
                        <p className="text-white/50 text-xs">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <PricingSection />

      {/* ── TRUST SECTION ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div
            className="rounded-3xl p-10 md:p-16 text-center"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 max-w-2xl mx-auto leading-tight">
              NaijaBiz is built for Nigerian small businesses — barbers, salons, food vendors, repairers, and more.
            </h2>
            <p className="text-gray-500 text-lg mb-10">
              Join thousands of businesses putting their business online the simple way.
            </p>
            <Link href="/signup">
              <button
                className="h-13 px-8 py-3.5 rounded-2xl text-base font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: '#da552f', boxShadow: '0 8px 32px rgba(218,85,47,0.30)' }}
              >
                Create my free business page
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER — minimal Timmo style ── */}
      <footer className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-2">
              <Image src="/small-logo.png" alt="NaijaBiz" width={22} height={22} style={{ width: 22, height: 'auto' }} />
              <span className="font-bold text-gray-900">NaijaBiz</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 text-sm">© {new Date().getFullYear()} NaijaBiz. Made with ❤️ in Lagos.</span>
            </div>

            <div className="flex items-center gap-5 text-sm">
              {[
                { href: '/terms', label: 'Terms' },
                { href: '/privacy', label: 'Privacy' },
                { href: '/directory', label: 'Directory' },
                { href: '/pricing', label: 'Pricing' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-gray-400 hover:text-orange-600 transition-colors font-medium">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">
            Powered by <a href="https://www.axist.app" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 underline">Axist</a>
          </p>
        </div>
      </footer>

    </div>
  )
}
