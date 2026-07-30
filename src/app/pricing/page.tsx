'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Globe2,
  ShoppingBag,
  Bot,
  Star,
  BarChart2,
  Zap,
  Lock,
  MessageCircle,
  Shield,
} from 'lucide-react'

// ── Feature Sections ──────────────────────────────────────────────────────────
const freeFeatures = [
  {
    icon: Globe2,
    section: 'Your Brand Page',
    color: '#7c5cbf',
    items: [
      'Your own branded business link (naijabiz.org/yourbrand)',
      'Logo, description, and category',
      'Location display',
      'Listed in the NaijaBiz public directory',
      'Automated SEO (search engine visible)',
    ],
  },
  {
    icon: ShoppingBag,
    section: 'Catalog',
    color: '#2e7d52',
    items: [
      'Up to 5 catalog items (products or services)',
      'Product images, names, and pricing',
      'WhatsApp order or booking link on each item',
      'Basic service listing for bookings',
    ],
  },
  {
    icon: MessageCircle,
    section: 'Contact & Links',
    color: '#2d4fb5',
    items: [
      'WhatsApp contact button',
      'Instagram and TikTok profile links',
      'Phone number display',
    ],
  },
]

const proFeatures = [
  {
    icon: Globe2,
    section: 'Full Brand Website',
    color: '#7c5cbf',
    items: [
      'Everything in Free',
      'Full themed brand website (color themes per category)',
      'Custom hero header with background',
      'Priority placement in directory',
      'Pro Verified trust badge on your page',
    ],
  },
  {
    icon: ShoppingBag,
    section: 'Unlimited Catalog',
    color: '#2e7d52',
    items: [
      'Unlimited products and services',
      'Shoppable Reels-style view (mobile-first)',
      'Product grid and list views',
      'WhatsApp order capture on every item',
      'Priority booking display for service brands',
    ],
  },
  {
    icon: Bot,
    section: 'Virtual Assistant',
    color: '#b45309',
    items: [
      '24/7 Virtual Assistant on your page',
      'Answers product and pricing questions automatically',
      'Handles booking and appointment management',
      'AI booking assistant collects preferred date, time, and notes',
      'Captures orders and sends them to WhatsApp',
      'Customizable welcome message',
      'Catalogue-aware responses',
    ],
  },
  {
    icon: Star,
    section: 'Trust & Reviews',
    color: '#a83060',
    items: [
      'Customer reviews and star ratings displayed',
      'Community upvote system',
      'Pro Verified badge (upgrade = verified)',
      'Brand credibility signals for new visitors',
    ],
  },
  {
    icon: BarChart2,
    section: 'Analytics',
    color: '#2d4fb5',
    items: [
      'Page view counter',
      'Visitor analytics dashboard',
      'WhatsApp lead notifications',
    ],
  },
]

// ── Accordion Item ─────────────────────────────────────────────────────────────
function FeatureAccordion({
  sections,
  accentColor,
}: {
  sections: typeof freeFeatures
  accentColor: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold py-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-expanded={open}
      >
        <span>{open ? 'Hide features' : 'See all features'}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="mt-3 space-y-5 border-t border-gray-100 pt-5">
          {sections.map(({ icon: Icon, section, color, items }) => (
            <div key={section}>
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: color + '22' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{section}</p>
              </div>
              <ul className="space-y-1.5 pl-8">
                {items.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2
                      className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                      style={{ color: accentColor }}
                    />
                    <span className="text-sm text-gray-600 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  {
    q: 'What counts as a "catalog item"?',
    a: 'Anything you sell or offer — a product, a service package, a booking slot, a digital download. If it has a name and a price, it counts.',
  },
  {
    q: 'How does the Virtual Assistant work?',
    a: 'It\'s a chat widget on your brand page. When a customer asks a question, it responds using your catalog data, welcome message, and business instructions. Product orders and service booking requests are sent straight to your WhatsApp.',
  },
  {
    q: 'What does "Pro Verified" mean?',
    a: 'When you upgrade to Pro, you automatically get the green Verified badge on your page. It tells customers you\'re a serious, active brand — no extra steps needed.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel your Pro subscription anytime. Your account stays Pro until the end of your billing period, then reverts to Free. Your data is never deleted.',
  },
  {
    q: 'What happens to my products if I downgrade?',
    a: 'Products beyond your free plan limit will be hidden (not deleted). You can re-upgrade at any time to restore them instantly.',
  },
  {
    q: 'Can I accept payments through NaijaBiz?',
    a: 'NaijaBiz is WhatsApp-first today. Customers contact you to order or book, then you handle payment in your own way such as transfer, cash, or POS. In-platform customer payments are not live yet.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-start justify-between gap-4 p-5 font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 mt-1 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'biannual' | 'yearly'>('monthly')

  const getPrice = () => {
    switch(billingCycle) {
      case 'quarterly': return { amount: '₦6,975', period: '/ 3 mos', save: 'Save 7%' }
      case 'biannual': return { amount: '₦13,500', period: '/ 6 mos', save: 'Save 10%' }
      case 'yearly': return { amount: '₦20,000', period: '/ yr', save: 'Save 33%' }
      default: return { amount: '₦2,500', period: '/ mo', save: null }
    }
  }
  const currentPrice = getPrice()

  return (
    <div className="min-h-screen bg-[#fffaf5] text-[#2a1d1a]">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-[#eadfd8]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-[#2a1d1a]">
            <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
            NaijaBiz
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-[#eadfd8] text-[#725e57] hover:bg-[#f9f0ee]">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-[#a84b35] hover:bg-[#8f3e2b] text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">

        {/* Hero copy */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-4">Pricing</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            Simple, honest pricing.
          </h1>
          <p className="text-lg text-[#725e57] leading-relaxed">
            Start free. Upgrade when you&apos;re ready for the full brand experience.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2 bg-white rounded-2xl p-2 border border-[#eadfd8] shadow-sm max-w-xl mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-[#a84b35] text-white shadow-md' : 'text-[#725e57] hover:bg-[#f9f0ee]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex flex-col sm:flex-row items-center gap-1 ${billingCycle === 'quarterly' ? 'bg-[#a84b35] text-white shadow-md' : 'text-[#725e57] hover:bg-[#f9f0ee]'}`}
            >
              Quarterly <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'quarterly' ? 'bg-white/20 text-white' : 'bg-[#e8d5cf] text-[#a84b35]'}`}>-7%</span>
            </button>
            <button
              onClick={() => setBillingCycle('biannual')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex flex-col sm:flex-row items-center gap-1 ${billingCycle === 'biannual' ? 'bg-[#a84b35] text-white shadow-md' : 'text-[#725e57] hover:bg-[#f9f0ee]'}`}
            >
              Biannual <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'biannual' ? 'bg-white/20 text-white' : 'bg-[#e8d5cf] text-[#a84b35]'}`}>-10%</span>
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex flex-col sm:flex-row items-center gap-1 ${billingCycle === 'yearly' ? 'bg-[#a84b35] text-white shadow-md' : 'text-[#725e57] hover:bg-[#f9f0ee]'}`}
            >
              Yearly <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-[#e8d5cf] text-[#a84b35]'}`}>-33%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Free Plan */}
          <div className="rounded-3xl border border-[#eadfd8] p-7 bg-white flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Free</h2>
              <p className="text-sm text-gray-500">Your brand&apos;s first step online.</p>
            </div>

            <div className="mb-6">
              <div className="text-5xl font-black text-gray-900">₦0</div>
              <p className="text-sm text-gray-400 mt-1">Forever free</p>
            </div>

            <Link href="/signup" className="block mb-6">
              <Button variant="outline" className="w-full h-12 font-bold rounded-2xl border-[#eadfd8] hover:bg-[#f9f0ee] text-[#2a1d1a]" size="lg">
                Start for free
              </Button>
            </Link>

            {/* Top highlights */}
            <ul className="space-y-3 mb-5">
              {[
                'Your own branded business link',
                'Up to 5 catalog items',
                'WhatsApp ordering and booking enquiries',
                'Listed in the directory',
                'SEO-optimised page',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-[#62ba82] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Accordion */}
            <div className="mt-auto border-t border-gray-100 pt-4">
              <FeatureAccordion sections={freeFeatures} accentColor="#62ba82" />
            </div>
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border-2 border-[#a84b35] p-7 bg-[#2a1d1a] text-white flex flex-col relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#a84b35]/10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />

            {/* Badge */}
            <div className="absolute top-5 right-5 bg-[#a84b35] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-white" /> Most Popular
            </div>

            <div className="mb-6 relative">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-white">Pro</h2>
                <VerifiedBadge size="sm" />
              </div>
              <p className="text-sm text-white/60">The full brand experience, unlocked.</p>
            </div>

            <div className="mb-6 relative">
              <div className="text-5xl font-black text-white">
                {currentPrice.amount}
              </div>
              <p className="text-sm text-white/40 mt-1">
                {currentPrice.period} · {currentPrice.save ? currentPrice.save : 'cancel anytime'}
              </p>
            </div>

            <Link href={`/signup?plan=pro&billing=${billingCycle}`} className="block mb-6 relative">
              <Button
                className="w-full h-12 font-bold rounded-2xl bg-[#a84b35] hover:bg-[#8f3e2b] text-white border-0 shadow-lg shadow-[#a84b35]/30"
                size="lg"
              >
                Upgrade to Pro <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            {/* Top highlights */}
            <ul className="space-y-3 mb-5 relative">
              {[
                'Everything in Free',
                'Unlimited catalog items',
                'Full themed brand website',
                'Virtual Assistant for orders and bookings',
                'Customer reviews & ratings',
                'Pro Verified badge',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="w-4 h-4 text-[#e8b8aa] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Accordion */}
            <div className="mt-auto border-t border-white/10 pt-4 relative">
              <button
                id="pro-see-all"
                className="w-full flex items-center justify-between text-sm font-semibold py-2 text-white/60 hover:text-white transition-colors"
                onClick={() => {
                  const el = document.getElementById('pro-accordion')
                  if (el) el.classList.toggle('hidden')
                  const btn = document.getElementById('pro-see-all')
                  if (btn) {
                    const chevron = btn.querySelector('svg')
                    if (chevron) chevron.classList.toggle('rotate-180')
                    const span = btn.querySelector('span')
                    if (span) span.textContent = el?.classList.contains('hidden') ? 'See all features' : 'Hide features'
                  }
                }}
              >
                <span>See all features</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200" />
              </button>

              <div id="pro-accordion" className="hidden mt-3 space-y-5 border-t border-white/10 pt-5">
                {proFeatures.map(({ icon: Icon, section, color, items }) => (
                  <div key={section}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '33' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white/40">{section}</p>
                    </div>
                    <ul className="space-y-1.5 pl-8">
                      {items.map(item => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#e8b8aa]" />
                          <span className="text-sm text-white/70 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Highlight */}
        <div className="mt-12 max-w-4xl mx-auto rounded-3xl bg-[#f9f0ee] border border-[#e8d5cf] p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-2">The key difference</p>
          <h3 className="text-2xl font-black mb-6">Free gives you presence. Pro gives you power.</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-sm text-gray-500 mb-3">Free</p>
              <ul className="space-y-2">
                {['A page to show who you are', 'Up to 5 products or services', 'Basic WhatsApp order or booking enquiry'].map(i => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-sm text-[#a84b35] mb-3">Pro</p>
              <ul className="space-y-2">
                {['Priority service booking display', 'AI assistant collects order and appointment details', 'Reviews, analytics, and badge build trust automatically'].map(i => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800 font-medium"><CheckCircle2 className="w-4 h-4 text-[#a84b35] flex-shrink-0 mt-0.5" />{i}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-10">Common questions</h2>
          <div className="space-y-3">
            {faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-3xl bg-[#2a1d1a] text-white p-10 text-center max-w-3xl mx-auto">
          <h3 className="text-3xl font-black mb-3">Ready to own your space online?</h3>
          <p className="text-white/60 mb-8 leading-relaxed">
            Start free today. No credit card. No commitment. Upgrade when you&apos;re ready.
          </p>
          <Link href="/signup">
            <Button className="bg-[#a84b35] hover:bg-[#8f3e2b] text-white font-bold h-12 px-8 rounded-2xl shadow-lg">
              Claim your link — it&apos;s free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#eadfd8] py-8 text-center text-sm text-[#806b63] mt-16">
        <div className="flex justify-center gap-5 mb-3 flex-wrap">
          <Link href="/" className="hover:text-[#a84b35] transition-colors">Home</Link>
          <Link href="/directory" className="hover:text-[#a84b35] transition-colors">Directory</Link>
          <Link href="/terms" className="hover:text-[#a84b35] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#a84b35] transition-colors">Privacy</Link>
        </div>
        © {new Date().getFullYear()} NaijaBiz
      </footer>
    </div>
  )
}
