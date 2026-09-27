'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Bot, CheckCircle2, Globe2, ShoppingBag, Star, ShieldCheck, X, Users, BarChart2, Wrench, BadgePercent, MessageCircle, Zap } from 'lucide-react'
import BorderBeam from 'border-beam'
import GradientText from '@/components/ui/GradientText'
import { MasterChatWidget } from '@/components/MasterChatWidget'

const navLinks = [
  { href: '/directory', label: 'Discover brands' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/agents', label: 'Agents' },
]

const demoLinks: Array<[string, string, string, string, LucideIcon, string]> = [
  ['Product demo', "Tola's Kitchen", 'Food menu, reviews, WhatsApp ordering', '/tolas-kitchen', ShoppingBag, '#E8A87C'],
  ['Service demo', 'MusaFix Electricals', 'Repair services, appointments, quote requests', '/musafix-electricals', Wrench, '#9bd4bd'],
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const beforeItems = [
    'Waking up to "How much?" messages you missed',
    'Typing prices and sending pictures manually every day',
    'Customers leaving because you replied late',
    'Looking like just another username on Instagram',
    'Mixing up orders and booking dates',
  ]

  const afterItems = [
    'Your virtual assistant replies to customers 24/7 on WhatsApp',
    'Customers browse your beautiful, live catalog instantly',
    'Orders and bookings are closed automatically while you sleep',
    'Your own professional brand page (yourbrand.qriblo.com)',
    'Verified customer reviews that build instant trust',
  ]

  const businessTypes = [
    {
      icon: ShoppingBag,
      title: 'For product brands',
      example: "Tola's Kitchen",
      description: 'Restaurants, fashion vendors, beauty sellers, gadget shops, and food brands can show products, prices, reviews, and WhatsApp order actions from one link.',
      href: '/tolas-kitchen',
      cta: 'View product demo',
      color: '#c36f4d',
      proof: 'Menu, reviews, order CTA',
    },
    {
      icon: Wrench,
      title: 'For service brands',
      example: 'MusaFix Electricals',
      description: 'Artisans, salons, photographers, consultants, repairers, and coaches can list services, collect preferred date/time, and turn interest into booking enquiries.',
      href: '/musafix-electricals',
      cta: 'View service demo',
      color: '#2f6f58',
      proof: 'Services, booking form, reviews',
    },
    {
      icon: Users,
      title: 'For hybrid brands',
      example: 'Products + bookings',
      description: 'Businesses that sell products and offer services can keep both in one catalog, so customers do not need separate links for shopping and booking.',
      href: '/signup?brand=hybrid-brand',
      cta: 'Create a hybrid page',
      color: '#7c5cbf',
      proof: 'One link for both intents',
    },
  ]

  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#1E1410] overflow-x-hidden font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-3 pt-3">
        <div className="max-w-6xl mx-auto h-14 px-4 rounded-2xl flex items-center justify-between border border-white/80 bg-white/80 backdrop-blur shadow-[0_4px_24px_rgba(70,35,25,.08)]">
          <Link href="/" className="flex items-center gap-2 font-black text-[#1E1410]">
            <Image src="/smal-logo.png" alt="Qriblo" width={26} height={26} />
            <GradientText className="font-black text-[15px] tracking-[-0.02em]">Qriblo</GradientText>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#6B5850]">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-[#B84D34] transition-colors">{link.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/login" className="hidden sm:inline-flex px-3 py-2 text-xs sm:text-sm font-bold text-[#6B5850] hover:text-[#1E1410] transition-colors">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-[#B84D34] text-white px-3 py-2 text-xs sm:text-sm font-bold hover:bg-[#9A3F2A] transition-colors">
              Claim your link
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              className="md:hidden w-10 h-10 rounded-xl border border-[#eadfd8] bg-white text-[#1E1410] inline-flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <span aria-hidden="true" className="flex h-4 w-5 flex-col justify-between py-0.5">
                  <span className="h-0.5 w-full rounded-full bg-current" />
                  <span className="h-0.5 w-full rounded-full bg-current" />
                </span>
              )}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl border border-[#eadfd8] bg-white p-3 shadow-[0_18px_40px_rgba(70,35,25,.12)]">
            <p className="px-3 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[#B84D34]">Catalog</p>
            <div className="grid gap-1">
              {[
                ...navLinks,
                { href: '/tolas-kitchen', label: "Product Brand demo" },
                { href: '/musafix-electricals', label: 'Service Brand demo' },
                { href: '/login', label: 'Log in' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#1E1410] hover:bg-[#FDF8F3]"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4 text-[#B84D34]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>

        {/* HERO SECTION - HIGH CONVERTING LEFT-ALIGNED HERO */}
        <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-12 sm:pb-16 overflow-hidden">
          {/* High performance CSS ambient background lighting - zero lag */}
          <div className="absolute top-0 left-0 -translate-x-12 w-96 h-96 rounded-full bg-[#fde1d6] blur-3xl opacity-70 pointer-events-none -z-10" />
          <div className="absolute top-12 right-0 translate-x-12 w-[420px] h-[420px] rounded-full bg-[#fdecd5] blur-3xl opacity-60 pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(#eadfd8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_70%,transparent_100%)] opacity-35 pointer-events-none -z-10" />

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: PUNCHY COPY, CALL TO ACTION & TRUST */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Pill badge with live status beacon */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f8ebe5] border border-[#f0d5ca] px-3.5 py-1.5 text-xs font-bold text-[#9d4430] mb-5 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
                </span>
                <span>Stop losing sales in the DMs</span>
                <span className="text-[#d89785]">•</span>
                <span className="text-[#6B5850] font-semibold hidden sm:inline">24/7 WhatsApp AI Assistant</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-black tracking-[-0.035em] leading-[1.08] text-[#1E1410] mb-5">
                Your live catalog and a 24/7 virtual assistant.
                <span className="block mt-1 sm:mt-2 text-[#B84D34] font-serif italic font-bold">
                  In one powerful brand link.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg leading-relaxed text-[#6B5850] mb-7 max-w-xl">
                Stop typing prices and sending pictures manually every day. Give customers one clean link to browse what you sell, while your virtual assistant answers questions, takes orders, and closes sales on WhatsApp 24/7.
              </p>

              {/* Brand Link Claim Form */}
              <form action="/signup" method="GET" className="w-full max-w-lg p-2 rounded-2xl bg-white border border-[#eadfd8] shadow-[0_14px_32px_rgba(70,35,25,.08)] flex flex-col sm:flex-row gap-2 mb-3.5 focus-within:border-[#B84D34] focus-within:ring-2 focus-within:ring-[#B84D34]/15 transition-all">
                <div className="flex items-center flex-1 px-3 py-2 sm:py-1">
                  <span className="text-xs sm:text-sm font-semibold text-[#a8968e] select-none">qriblo.com/</span>
                  <input
                    required
                    name="brand"
                    placeholder="yourbrand"
                    className="w-full bg-transparent font-bold outline-none text-sm sm:text-base text-[#1E1410] placeholder-[#c4aea6] ml-1"
                  />
                </div>
                <button type="submit" className="shrink-0 rounded-xl px-5 py-3 bg-[#B84D34] text-white font-bold text-sm hover:bg-[#9A3F2A] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm">
                  Create your link <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Shopper & Customer Virtual Assistant Button */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <a
                  href="https://wa.me/2347047207012?text=Hi!%20I%20want%20to%20see%20how%20the%20Qriblo%20Virtual%20Assistant%20works%20for%20my%20business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl border border-[#eadfd8] bg-white/90 hover:bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#1E1410] shadow-[0_4px_14px_rgba(70,35,25,.05)] hover:shadow-[0_6px_20px_rgba(70,35,25,.10)] hover:border-[#25D366]/40 transition-all group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span>Chat with Virtual Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#B84D34] group-hover:translate-x-0.5 transition-transform" />
                </a>
                <span className="text-[11px] sm:text-xs text-[#8a766e]">Test the assistant on WhatsApp</span>
              </div>

              {/* Trust Indicators */}
              <div className="pt-5 border-t border-[#eadfd8]/80 w-full grid grid-cols-2 sm:flex sm:flex-wrap gap-y-2.5 gap-x-5 text-xs font-semibold text-[#6B5850]">
                <span className="flex items-center gap-1.5"><Globe2 className="w-3.5 h-3.5 text-[#7c5cbf]" /> Custom brand subdomain</span>
                <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-[#B84D34]" /> 24/7 WhatsApp AI</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#2e7d52]" /> No card required</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d52]" /> Ready in 3 mins</span>
              </div>
            </div>

            {/* RIGHT COLUMN: HIGH-IMPACT PRODUCT SHOWCASE (WHAT CUSTOMERS EXPERIENCE) */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Floating Badge 1 - Top Left */}
                <div className="absolute -top-4 -left-2 sm:-left-5 z-20 rounded-2xl bg-white/95 backdrop-blur border border-[#eadfd8] py-2 px-3 sm:px-4 shadow-[0_12px_28px_rgba(70,35,25,.12)] flex items-center gap-2.5 animate-soft-float">
                  <div className="w-7 h-7 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366]">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.1em] text-[#806b63]">Instant AI response</p>
                    <p className="text-xs font-black text-[#1E1410]">Replied in 1.1s at 11:32 PM</p>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Right */}
                <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 rounded-2xl bg-[#1E1410] text-white py-2.5 px-3.5 sm:px-4 shadow-[0_16px_36px_rgba(0,0,0,.25)] flex items-center gap-3 animate-soft-float [animation-delay:1500ms]">
                  <div className="w-8 h-8 rounded-xl bg-[#2e7d52] flex items-center justify-center text-white font-black text-xs">
                    ₦
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/50">Order captured</p>
                    <p className="text-xs font-black text-[#62ba82]">₦18,500 while asleep</p>
                  </div>
                </div>

                {/* Main Showcase Device Container */}
                <div className="rounded-[2rem] bg-white border border-[#eadfd8] p-4 sm:p-5 shadow-[0_24px_50px_rgba(70,35,25,.10)] overflow-hidden relative">
                  {/* Mockup Top Browser Bar */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#f0e6e0]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#efc9b8]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f5d8a0]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#b9e2cb]" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FDF8F3] border border-[#eadfd8] text-[11px] font-bold text-[#6B5850]">
                      <ShieldCheck className="w-3 h-3 text-[#2e7d52]" />
                      <span>tolaskitchen.qriblo.com</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#2e7d52]">Live</span>
                    </div>
                  </div>

                  {/* Brand Mini Header */}
                  <div className="rounded-xl bg-[#FDF8F3] p-3 border border-[#f0e6e0] flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#B84D34] text-white font-black flex items-center justify-center text-sm shadow-xs">
                        T
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-xs text-[#1E1410]">Tola&apos;s Kitchen</p>
                          <span className="px-1.5 py-0.5 rounded-full bg-[#25D366]/15 text-[#25D366] text-[9px] font-black">Verified</span>
                        </div>
                        <p className="text-[10px] text-[#806b63]">Lekki Phase 1 • 24/7 WhatsApp ordering</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-[#B84D34]">4.9 ★</span>
                  </div>

                  {/* WhatsApp AI Chat Simulation */}
                  <div className="rounded-2xl bg-[#0b141a] text-white p-3.5 space-y-2.5 text-xs shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-black font-black text-[10px]">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#25D366] border border-[#0b141a]" />
                        </div>
                        <div>
                          <p className="font-bold text-[11px] text-white leading-tight">Qriblo Virtual Assistant</p>
                          <p className="text-[9px] text-[#25D366] leading-none">Online • replies instantly</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-white/40">WhatsApp</span>
                    </div>

                    {/* Customer message */}
                    <div className="flex flex-col items-end">
                      <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005c4b] text-white/95 px-3 py-2 text-[11px] leading-relaxed">
                        <p>Hello! Is the Party Jollof & Turkey still available tonight for delivery to Lekki?</p>
                        <span className="block text-right text-[8px] text-white/60 mt-1">11:32 PM</span>
                      </div>
                    </div>

                    {/* Bot message */}
                    <div className="flex flex-col items-start">
                      <div className="max-w-[92%] rounded-2xl rounded-tl-xs bg-[#202c33] text-white/95 px-3 py-2 text-[11px] leading-relaxed border border-white/5">
                        <p>Yes, available right now! 🔥</p>
                        <p className="mt-1 text-white/80">₦4,500 + ₦1,200 express delivery (arrives in ~30 mins). Click below to complete your order:</p>
                        <div className="mt-2 p-2 rounded-xl bg-white/10 flex items-center justify-between gap-2 border border-white/10">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#c36f4d] flex items-center justify-center">
                              <ShoppingBag className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-[10px]">Party Jollof + Turkey</p>
                              <p className="text-[9px] text-[#25D366] font-bold">₦4,500</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 rounded-lg bg-[#25D366] text-black font-black text-[9px]">
                            Order now
                          </span>
                        </div>
                        <span className="block text-right text-[8px] text-white/40 mt-1">11:32 PM ✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['yourbrand', '.qriblo.com', 'Every business gets their own personal brand page for a clean, standout presence.'],
              ['24/7', 'Virtual Assistant', 'Learns your business context, handles appointments, and captures order requests while you sleep.'],
              ['100%', 'WhatsApp First', 'Turn visitors into direct chats — bookings, menu orders, and inquiries land straight in WhatsApp.'],
            ].map(([value, label, text]) => (
              <div key={label} className="rounded-2xl bg-white border border-[#eadfd8] p-5 shadow-[0_10px_28px_rgba(70,35,25,.05)] micro-lift">
                <p className="text-3xl font-black text-[#B84D34]">{value}</p>
                <p className="text-sm font-black text-[#1E1410] mt-1">{label}</p>
                <p className="text-xs text-[#6B5850] leading-relaxed mt-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MOCKUP PREVIEW */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-[2rem] p-5 sm:p-8 bg-[#211816] text-white shadow-[0_28px_70px_rgba(50,24,18,.24)] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#B84D34]/25 to-transparent pointer-events-none" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#E8A87C] mb-3">Live demo links</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
                  See how real brand links feel before you create yours.
                </h2>
                <p className="text-white/65 leading-relaxed mb-6">
                  Product sellers get shoppable menus. Service brands get booking-ready pages. Both get trust signals, WhatsApp actions, and a context-aware Virtual Assistant.
                </p>
                <div className="grid gap-3">
                  {demoLinks.map(([type, name, text, href, Icon, color]) => (
                    <BorderBeam key={name} size="sm" colorVariant="sunset" theme="dark" duration={2.4} strength={0.7}>
                      <Link href={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.1] transition-colors micro-lift">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[.14em] text-white/40">{type}</p>
                            <p className="font-black text-white">{name}</p>
                            <p className="text-xs text-white/50">{text}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                      </Link>
                    </BorderBeam>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-[1.6rem] bg-[#FDF8F3] p-4 text-[#1E1410] rotate-[-1.5deg] shadow-2xl animate-soft-float">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#B84D34] flex items-center justify-center text-white font-black">T</div>
                      <div>
                        <p className="font-black text-sm">Tola&apos;s Kitchen</p>
                        <p className="text-xs text-[#806b63]">Verified food brand</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#2e7d52]">4.7 ★</span>
                  </div>
                  <div className="space-y-3">
                    {[['Party Jollof + Chicken', '₦3,500', '#c36f4d'], ['Egusi Soup + Swallow', '₦4,000', '#d9b995'], ['Fried Rice + Turkey', '₦4,500', '#6f9e6f']].map(([name, price, bg]) => (
                      <div key={name} className="flex items-center gap-3 rounded-2xl bg-white border border-[#eadfd8] p-2">
                        <div className="w-12 h-12 rounded-xl" style={{ background: bg }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black truncate">{name}</p>
                          <p className="text-xs text-[#B84D34] font-black">{price}</p>
                        </div>
                        <ShoppingBag className="w-4 h-4 text-[#B84D34]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] bg-[#f5fffa] p-4 text-[#15382b] rotate-[1.5deg] shadow-2xl mt-6 sm:mt-12 animate-soft-float [animation-delay:900ms]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2f6f58] flex items-center justify-center text-white font-black">M</div>
                      <div>
                        <p className="font-black text-sm">MusaFix Electricals</p>
                        <p className="text-xs text-[#587468]">Verified service artisan</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#2e7d52]">Book</span>
                  </div>
                  <div className="space-y-3">
                    {[['Home wiring inspection', '₦12,000', 'Today'], ['Inverter installation', 'From ₦35,000', 'Quote'], ['Emergency fault repair', '₦18,000', '2 hrs']].map(([name, price, meta]) => (
                      <div key={name} className="rounded-2xl bg-white border border-[#cfe9dc] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-black">{name}</p>
                            <p className="text-xs text-[#587468]">{meta}</p>
                          </div>
                          <span className="text-[11px] font-black text-[#2f6f58]">{price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* AGENT CTA */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center rounded-3xl bg-white border border-[#eadfd8] p-6 sm:p-8 shadow-[0_14px_35px_rgba(70,35,25,.06)] micro-lift">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f9f0ee] flex items-center justify-center shrink-0">
                <BadgePercent className="w-6 h-6 text-[#B84D34]" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#B84D34] mb-2">Earn with Qriblo</p>
                <h2 className="text-2xl font-black mb-2">Know business owners? Join the Agent Program.</h2>
                <p className="text-sm text-[#6B5850] leading-relaxed">
                  Refer vendors and service brands, earn a 15% first-month commission when they upgrade, and track active clients from your agent dashboard.
                </p>
              </div>
            </div>
            <Link href="/agents" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E1410] text-white px-5 py-3 text-sm font-bold hover:bg-[#3a2925] transition-colors">
              Become an agent <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* BEFORE VS AFTER */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#B84D34] mb-3">The difference</p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              From scattered to sorted.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#f9f0ee] border border-[#e8d5cf] micro-lift">
              <p className="text-xs font-bold uppercase tracking-widest text-[#B84D34] mb-5">Without Qriblo</p>
              <ul className="space-y-4">
                {beforeItems.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#f5cdc3] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-[#B84D34]" />
                    </span>
                    <span className="text-sm text-[#6B5850] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#1E1410] text-white micro-lift">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E8A87C] mb-5">With Qriblo</p>
              <ul className="space-y-4">
                {afterItems.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#62ba82]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#62ba82]" />
                    </span>
                    <span className="text-sm text-white/80 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FEATURE BENTO */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#B84D34] mb-3">What you get</p>
            <h2 className="text-3xl sm:text-4xl font-black">More than a storefront. A complete home for your brand.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Identity */}
            <div className="rounded-3xl p-6 bg-[#f0e8ff] border border-[#ddd0f5] col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-[#7c5cbf] flex items-center justify-center mb-5">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Personal Subdomain & Link</h3>
              <p className="text-sm text-[#5a4870] leading-relaxed">
                Give your business its own digital home (<span className="font-bold">yourbrand.qriblo.com</span>), complete with your logo, story, catalog, and socials.
              </p>
            </div>

            {/* Card 2 — Catalog */}
            <div className="rounded-3xl p-6 bg-[#e8f5ee] border border-[#c8e8d5]">
              <div className="w-10 h-10 rounded-2xl bg-[#2e7d52] flex items-center justify-center mb-5">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Made to sell</h3>
              <p className="text-sm text-[#2e5040] leading-relaxed">
                Products, services, and prices live together. Customers browse and order via WhatsApp in seconds.
              </p>
            </div>

            {/* Card 3 — Virtual Assistant */}
            <div className="rounded-3xl p-6 bg-[#fff3e0] border border-[#ffe0b0]">
              <div className="w-10 h-10 rounded-2xl bg-[#b45309] flex items-center justify-center mb-5">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Always on assistant</h3>
              <p className="text-sm text-[#6b3d0c] leading-relaxed">
                Your virtual assistant lives on your page and answers with your catalog, business rules, current time, and chat history in mind.
              </p>
            </div>

            {/* Card 4 — Trust */}
            <div className="rounded-3xl p-6 bg-[#fce8f0] border border-[#f5c6da]">
              <div className="w-10 h-10 rounded-2xl bg-[#a83060] flex items-center justify-center mb-5">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Build real trust</h3>
              <p className="text-sm text-[#6b1f3e] leading-relaxed">
                Customer reviews, upvotes, and a Verified badge signal to every visitor that you&apos;re a serious brand.
              </p>
            </div>

            {/* Card 5 — Analytics */}
            <div className="rounded-3xl p-6 bg-[#e8f0ff] border border-[#c5d5f5] sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-[#2d4fb5] flex items-center justify-center mb-5">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Know your audience</h3>
              <p className="text-sm text-[#1e3570] leading-relaxed">
                See how many people view your catalog. Understand what&apos;s working and grow with real data, not guesswork.
              </p>
            </div>
          </div>
        </section>

        {/* BUSINESS TYPE COMPARISON */}
        <section className="max-w-5xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#B84D34] mb-3">For products, services, and hybrid brands</p>
            <h2 className="text-3xl sm:text-4xl font-black">One trusted link, shaped around what you sell.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {businessTypes.map(({ icon: Icon, title, example, description, href, cta, color, proof }) => (
              <div key={title} className="rounded-3xl bg-white border border-[#eadfd8] p-6 flex flex-col micro-lift">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#B84D34] mb-2">{proof}</p>
                <h3 className="text-xl font-black mb-1">{title}</h3>
                <p className="text-sm font-bold text-[#6B5850] mb-3">{example}</p>
                <p className="text-sm text-[#6B5850] leading-relaxed flex-1">{description}</p>
                <Link href={href} className="mt-6 inline-flex items-center justify-between rounded-xl border border-[#eadfd8] px-4 py-3 text-sm font-bold text-[#1E1410] hover:bg-[#FDF8F3]">
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#B84D34] mb-3">Simple setup</p>
            <h2 className="text-3xl sm:text-4xl font-black">Up and running in minutes.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              ['01', 'Make it yours', 'Add your name, logo, description, products or services. Takes 5 minutes.'],
              ['02', 'Share your brand link', 'Put qriblo.com/yourbrand (or your personal yourbrand.qriblo.com on Pro) in your bio, status, and flyers.'],
              ['03', 'Turn visits into orders', 'Customers browse, book, or chat with your virtual assistant, and confirmed requests land in WhatsApp.'],
            ].map(([num, title, text]) => (
              <div key={num} className="flex flex-col">
                <span className="text-6xl font-black text-[#dec8be] leading-none mb-4">{num}</span>
                <h3 className="font-black text-xl mb-2">{title}</h3>
                <p className="text-sm text-[#6B5850] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#B84D34] mb-3">Trusted by creators</p>
            <h2 className="text-3xl sm:text-4xl font-black">Don&apos;t just take our word for it.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I used to spend 3 hours a day just sending pictures and prices on WhatsApp. Now, customers just go to my link and order directly. It's a lifesaver.",
                name: "Aisha T.",
                business: "Fashion Brand",
                bg: "#f9f0ee"
              },
              {
                quote: "The virtual assistant is actually crazy. I woke up to 4 confirmed booking requests because the assistant answered all their questions while I was asleep.",
                name: "David O.",
                business: "Photography Studio",
                bg: "#e8f5ee"
              },
              {
                quote: "Moving to Qriblo was the best decision. Having my own themed brand page makes my skincare brand look so much more expensive and trustworthy.",
                name: "Chioma B.",
                business: "Beauty Store",
                bg: "#f0e8ff"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-3xl border border-[#eadfd8] flex flex-col micro-lift" style={{ backgroundColor: t.bg }}>
                <div className="flex gap-1 mb-4 text-[#B84D34]">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium leading-relaxed text-[#1E1410] flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-sm text-[#1E1410]">{t.name}</p>
                  <p className="text-xs text-[#6B5850]">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <div className="rounded-[2rem] bg-[#B84D34] text-white p-8 sm:p-14 text-center relative overflow-hidden animate-gentle-scale">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Ready?</p>
              <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
                Your next customer should meet your brand, not a confusing list of links.
              </h2>
              <p className="mt-4 max-w-lg mx-auto text-white/70 mb-8 leading-relaxed">
                Claim your brand link and stop losing sales in the DMs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white text-[#B84D34] px-6 py-3.5 font-bold hover:bg-[#FDF8F3] transition-colors w-full sm:w-auto justify-center">
                  Create your free link <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#eadfd8] py-8 text-center text-sm text-[#806b63]">
        <div className="flex justify-center gap-5 mb-3 flex-wrap">
          <Link href="/directory" className="hover:text-[#B84D34] transition-colors">Directory</Link>
          <Link href="/pricing" className="hover:text-[#B84D34] transition-colors">Pricing</Link>
          <Link href="/terms" className="hover:text-[#B84D34] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#B84D34] transition-colors">Privacy</Link>
        </div>
        © {new Date().getFullYear()} Qriblo
      </footer>
      <MasterChatWidget />
    </div>
  )
}
