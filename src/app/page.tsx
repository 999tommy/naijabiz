'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bot, CheckCircle2, Globe2, Menu, ShoppingBag, Star, CalendarCheck, ShieldCheck, X, Users, BarChart2, Wrench, BadgePercent, MessageCircle } from 'lucide-react'

const navLinks = [
  { href: '/directory', label: 'Discover brands' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/agents', label: 'Agents' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const beforeItems = [
    'Customers asking "what do you sell?" every day',
    'Sending prices manually in DMs and chats',
    'No way to show your reviews or build trust',
    'Your brand lives nowhere — just a username',
    'Missing orders while you sleep',
  ]

  const afterItems = [
    'Your full catalog is always live and browsable',
    'Customers order directly from your page',
    'Reviews and ratings build trust automatically',
    'A branded link that represents your identity',
    'Virtual Assistant handles enquiries 24/7',
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
    <div className="min-h-screen bg-[#fffaf5] text-[#2a1d1a] overflow-x-hidden font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 px-3 pt-3">
        <div className="max-w-5xl mx-auto h-14 px-4 rounded-2xl flex items-center justify-between border border-white/80 bg-white/80 backdrop-blur shadow-[0_4px_24px_rgba(70,35,25,.08)]">
          <Link href="/" className="flex items-center gap-2 font-black text-[#2a1d1a]">
            <Image src="/small-logo.png" alt="NaijaBiz" width={26} height={26} />
            NaijaBiz
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#725e57]">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="hover:text-[#a84b35] transition-colors">{link.label}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/login" className="hidden sm:inline-flex px-3 py-2 text-xs sm:text-sm font-bold text-[#725e57] hover:text-[#2a1d1a] transition-colors">Log in</Link>
            <Link href="/signup" className="rounded-xl bg-[#a84b35] text-white px-3 py-2 text-xs sm:text-sm font-bold hover:bg-[#8f3e2b] transition-colors">
              Claim your link
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(open => !open)}
              className="md:hidden w-10 h-10 rounded-xl border border-[#eadfd8] bg-white text-[#2a1d1a] inline-flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl border border-[#eadfd8] bg-white p-3 shadow-[0_18px_40px_rgba(70,35,25,.12)]">
            <p className="px-3 py-2 text-[11px] font-black uppercase tracking-[.16em] text-[#a84b35]">Catalog</p>
            <div className="grid gap-1">
              {[
                ...navLinks,
                { href: '/tolas-kitchen', label: "Tola's Kitchen demo" },
                { href: '/musafix-electricals', label: 'MusaFix service demo' },
                { href: '/login', label: 'Log in' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-bold text-[#2a1d1a] hover:bg-[#fffaf5]"
                >
                  {link.label}
                  <ArrowRight className="w-4 h-4 text-[#a84b35]" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>

        {/* HERO */}
        <section className="max-w-5xl mx-auto px-4 pt-14 pb-8 text-center relative">
          {/* Glow blobs */}
          <div className="absolute -z-0 w-80 h-80 rounded-full bg-[#efd1c6] blur-3xl opacity-50 top-8 left-1/2 -translate-x-1/2 pointer-events-none" />
          <div className="absolute -z-0 w-48 h-48 rounded-full bg-[#f5d8a0] blur-3xl opacity-40 top-20 right-10 pointer-events-none" />

          {/* Pill label */}
          <p className="relative inline-flex items-center gap-2 rounded-full bg-[#f5e5de] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-[#9d4430] mb-6">
            Get a free virtual assistant
          </p>

          {/* Headline */}
          <h1 className="relative text-[2.6rem] sm:text-6xl md:text-7xl font-black tracking-[-0.04em] leading-[1.0] mb-5">
            Growing your brand<br />
            <em className="font-serif font-bold not-italic text-[#a84b35]">has never been easier.</em>
          </h1>

          {/* Subtext */}
          <p className="relative mx-auto max-w-lg text-base sm:text-lg leading-relaxed text-[#725e57] mb-8">
            Claim one beautiful link where customers discover your story, browse your catalog,
            and book your services. A highly trained <span>virtual assistant</span> runs your business for you when you're asleep or busy.
          </p>

          {/* Slug input */}
          <form action="/signup" method="GET" className="relative mx-auto max-w-md p-2 rounded-2xl bg-white border border-[#eadfd8] shadow-[0_18px_40px_rgba(70,35,25,.10)] flex gap-2">
            <span className="hidden sm:flex pl-3 py-3 font-mono text-sm text-[#a98f84] items-center whitespace-nowrap">naijabiz.org/</span>
            <input
              required
              name="brand"
              placeholder="your-brand"
              className="min-w-0 flex-1 px-3 py-3 sm:px-2 bg-transparent font-bold outline-none text-sm placeholder-[#c4aea6]"
            />
            <button className="shrink-0 rounded-xl px-4 sm:px-5 py-3 bg-[#a84b35] text-white font-bold text-sm hover:bg-[#8f3e2b] transition-colors flex items-center gap-1">
              Claim <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Trust pills */}
          <div className="relative mt-5 flex justify-center gap-4 flex-wrap text-xs font-semibold text-[#725e57]">
            <span className="flex gap-1.5 items-center"><CheckCircle2 className="w-4 h-4 text-[#62ba82]" />Free to start</span>
            <span className="flex gap-1.5 items-center"><ShieldCheck className="w-4 h-4 text-[#62ba82]" />No card required</span>
            <span className="flex gap-1.5 items-center"><Bot className="w-4 h-4 text-[#a84b35]" />Virtual Assistant included on Pro</span>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['2', 'Inspectable demo pages', 'See a product brand and a service artisan before signing up.'],
              ['4.7★', 'Example review signal', 'Brand pages make ratings and customer proof visible.'],
              ['24/7', 'Virtual Assistant positioning', 'Pro pages can answer questions and capture intent after hours.'],
            ].map(([value, label, text]) => (
              <div key={label} className="rounded-2xl bg-white border border-[#eadfd8] p-5 shadow-[0_10px_28px_rgba(70,35,25,.05)]">
                <p className="text-3xl font-black text-[#a84b35]">{value}</p>
                <p className="text-sm font-black text-[#2a1d1a] mt-1">{label}</p>
                <p className="text-xs text-[#725e57] leading-relaxed mt-2">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MOCKUP PREVIEW */}
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-[2rem] p-5 sm:p-8 bg-[#211816] text-white shadow-[0_28px_70px_rgba(50,24,18,.24)] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#a84b35]/25 to-transparent pointer-events-none" />
            <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#e8b8aa] mb-3">Live demo links</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
                  See how real brand links feel before you create yours.
                </h2>
                <p className="text-white/65 leading-relaxed mb-6">
                  Product sellers get shoppable menus. Service brands get booking-ready pages. Both get trust signals, WhatsApp actions, and a Virtual Assistant.
                </p>
                <div className="grid gap-3">
                  {[
                    ['Product demo', "Tola's Kitchen", 'Food menu, reviews, WhatsApp ordering', '/tolas-kitchen', ShoppingBag, '#e8b8aa'],
                    ['Service demo', 'MusaFix Electricals', 'Repair services, appointments, quote requests', '/musafix-electricals', Wrench, '#9bd4bd'],
                  ].map(([type, name, text, href, Icon, color]: any) => (
                    <Link key={name} href={href} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 hover:bg-white/[0.1] transition-colors">
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
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-[1.6rem] bg-[#fffaf5] p-4 text-[#2a1d1a] rotate-[-1.5deg] shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#a84b35] flex items-center justify-center text-white font-black">T</div>
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
                          <p className="text-xs text-[#a84b35] font-black">{price}</p>
                        </div>
                        <ShoppingBag className="w-4 h-4 text-[#a84b35]" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.6rem] bg-[#f5fffa] p-4 text-[#15382b] rotate-[1.5deg] shadow-2xl mt-6 sm:mt-12">
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

        {/* BUSINESS TYPE COMPARISON */}
        <section className="max-w-5xl mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">For products, services, and hybrid brands</p>
            <h2 className="text-3xl sm:text-4xl font-black">One trusted link, shaped around what you sell.</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-4">
            {businessTypes.map(({ icon: Icon, title, example, description, href, cta, color, proof }) => (
              <div key={title} className="rounded-3xl bg-white border border-[#eadfd8] p-6 flex flex-col">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${color}22` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#a84b35] mb-2">{proof}</p>
                <h3 className="text-xl font-black mb-1">{title}</h3>
                <p className="text-sm font-bold text-[#725e57] mb-3">{example}</p>
                <p className="text-sm text-[#725e57] leading-relaxed flex-1">{description}</p>
                <Link href={href} className="mt-6 inline-flex items-center justify-between rounded-xl border border-[#eadfd8] px-4 py-3 text-sm font-bold text-[#2a1d1a] hover:bg-[#fffaf5]">
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* PAYMENT POSITIONING */}
        <section className="max-w-5xl mx-auto px-4 pb-14">
          <div className="rounded-3xl bg-[#f5fffa] border border-[#cfe9dc] p-6 sm:p-8 flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-[#2f6f58]" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#2f6f58] mb-2">Lightweight by design</p>
                <h2 className="text-2xl font-black mb-2">WhatsApp-first today. No heavy checkout setup.</h2>
                <p className="text-sm text-[#587468] leading-relaxed">
                  Customers browse, ask questions, order, or request appointments through WhatsApp. In-platform customer payments are not live yet, so NaijaBiz stays focused on speed, trust, AI, discovery, and referral-led growth.
                </p>
              </div>
            </div>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f6f58] text-white px-5 py-3 text-sm font-bold hover:bg-[#265946]">
              See plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* AGENT CTA */}
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center rounded-3xl bg-white border border-[#eadfd8] p-6 sm:p-8 shadow-[0_14px_35px_rgba(70,35,25,.06)]">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f9f0ee] flex items-center justify-center shrink-0">
                <BadgePercent className="w-6 h-6 text-[#a84b35]" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#a84b35] mb-2">Earn with NaijaBiz</p>
                <h2 className="text-2xl font-black mb-2">Know business owners? Join the Agent Program.</h2>
                <p className="text-sm text-[#725e57] leading-relaxed">
                  Refer vendors and service brands, earn a 15% first-month commission when they upgrade, and track active clients from your agent dashboard.
                </p>
              </div>
            </div>
            <Link href="/agents" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2a1d1a] text-white px-5 py-3 text-sm font-bold hover:bg-[#3a2925] transition-colors">
              Become an agent <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* BEFORE VS AFTER */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">The difference</p>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight">
              From scattered to sorted.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Before */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#f9f0ee] border border-[#e8d5cf]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-5">Without NaijaBiz</p>
              <ul className="space-y-4">
                {beforeItems.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#f5cdc3] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <X className="w-3 h-3 text-[#a84b35]" />
                    </span>
                    <span className="text-sm text-[#725e57] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#2a1d1a] text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-[#e8b8aa] mb-5">With NaijaBiz</p>
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
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">What you get</p>
            <h2 className="text-3xl sm:text-4xl font-black">More than a storefront. Easier than a website.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Identity */}
            <div className="rounded-3xl p-6 bg-[#f0e8ff] border border-[#ddd0f5] col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-[#7c5cbf] flex items-center justify-center mb-5">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Your identity online</h3>
              <p className="text-sm text-[#5a4870] leading-relaxed">
                A branded business page with your logo, story, socials, and everything customers want to see before they buy.
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
                Pro businesses get a Virtual Assistant that answers from your catalog, handles enquiries, and captures WhatsApp orders 24/7.
              </p>
            </div>

            {/* Card 4 — Trust */}
            <div className="rounded-3xl p-6 bg-[#fce8f0] border border-[#f5c6da]">
              <div className="w-10 h-10 rounded-2xl bg-[#a83060] flex items-center justify-center mb-5">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Build real trust</h3>
              <p className="text-sm text-[#6b1f3e] leading-relaxed">
                Customer reviews, upvotes, and a Pro Verified badge signal to every visitor that you&apos;re a serious brand.
              </p>
            </div>

            {/* Card 5 — Analytics */}
            <div className="rounded-3xl p-6 bg-[#e8f0ff] border border-[#c5d5f5] sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-[#2d4fb5] flex items-center justify-center mb-5">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black mb-2">Know your audience</h3>
              <p className="text-sm text-[#1e3570] leading-relaxed">
                See how many people view your page. Understand what&apos;s working and grow with real data, not guesswork.
              </p>
            </div>
          </div>
        </section>

        {/* WHO IT'S FOR */}
        <section className="bg-[#f2e7df] py-16">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">Built around your business</p>
            <h2 className="text-center text-3xl sm:text-4xl font-black mb-10">Whatever you sell, we have you covered.</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                [ShoppingBag, 'Product brands', 'Show your collection, make selection easy, and let customers order straight to WhatsApp.', '#c36f4d'],
                [CalendarCheck, 'Service brands', 'Present your services beautifully and turn interest into clear booking enquiries.', '#5c8a5e'],
                [Users, 'Hybrid brands', 'Sell products and offer services from the same brand page — no separate links needed.', '#7c5cbf'],
              ].map(([Icon, title, text, color]: any) => (
                <div key={title as string} className="rounded-3xl p-6 bg-[#fffaf5] border border-[#eadfd8]">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: color + '22' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <h3 className="font-black text-lg mb-2">{title as string}</h3>
                  <p className="text-sm text-[#725e57] leading-relaxed">{text as string}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">Simple setup</p>
            <h2 className="text-3xl sm:text-4xl font-black">Up and running in minutes.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              ['01', 'Make it yours', 'Add your name, logo, description, products or services. Takes 5 minutes.'],
              ['02', 'Share one link', 'Put naijabiz.org/yourbrand in your bio, status, or anywhere your customers find you.'],
              ['03', 'Turn visits into orders', 'Customers browse, book, or chat with your virtual assistant — you close the sale.'],
            ].map(([num, title, text]) => (
              <div key={num} className="flex flex-col">
                <span className="text-6xl font-black text-[#dec8be] leading-none mb-4">{num}</span>
                <h3 className="font-black text-xl mb-2">{title}</h3>
                <p className="text-sm text-[#725e57] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[.16em] font-bold text-[#a84b35] mb-3">Trusted by creators</p>
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
                quote: "Upgrading to Pro was the best decision. Having my own themed website makes my skincare brand look so much more expensive and trustworthy.",
                name: "Sarah M.",
                business: "Beauty Store",
                bg: "#f0e8ff"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-3xl border border-[#eadfd8] flex flex-col" style={{ backgroundColor: t.bg }}>
                <div className="flex gap-1 mb-4 text-[#a84b35]">
                  {[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-medium leading-relaxed text-[#2a1d1a] flex-1 mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-sm text-[#2a1d1a]">{t.name}</p>
                  <p className="text-xs text-[#725e57]">{t.business}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-5xl mx-auto px-4 pb-24">
          <div className="rounded-[2rem] bg-[#a84b35] text-white p-8 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 pointer-events-none transform -translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Ready?</p>
              <h2 className="text-3xl sm:text-5xl font-black leading-tight mb-4">
                Your next customer should meet your brand, not a confusing list of links.
              </h2>
              <p className="mt-4 max-w-lg mx-auto text-white/70 mb-8 leading-relaxed">
                Claim your brand link free, then grow into the complete Pro experience when you&apos;re ready.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white text-[#a84b35] px-6 py-3.5 font-bold hover:bg-[#fffaf5] transition-colors w-full sm:w-auto justify-center">
                  Claim your free link <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 text-white px-6 py-3.5 font-bold hover:bg-white/20 transition-colors w-full sm:w-auto justify-center">
                  See pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#eadfd8] py-8 text-center text-sm text-[#806b63]">
        <div className="flex justify-center gap-5 mb-3 flex-wrap">
          <Link href="/directory" className="hover:text-[#a84b35] transition-colors">Directory</Link>
          <Link href="/pricing" className="hover:text-[#a84b35] transition-colors">Pricing</Link>
          <Link href="/terms" className="hover:text-[#a84b35] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#a84b35] transition-colors">Privacy</Link>
        </div>
        © {new Date().getFullYear()} NaijaBiz
      </footer>
    </div>
  )
}
