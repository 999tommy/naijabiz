'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  MessageCircle,
} from 'lucide-react'

// ── Feature Sections ──────────────────────────────────────────────────────────
const freeFeatures = [
  {
    icon: Globe2,
    section: 'Your Qriblo Page',
    color: '#7c5cbf',
    items: [
      'Standard business link (qriblo.com/yourbrand)',
      'Logo, description, and category',
      'Location display',
      'Listed in the Qriblo public directory',
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
    section: 'Brand Subdomain & Presence',
    color: '#7c5cbf',
    items: [
      'Personal brand subdomain (yourbrand.qriblo.com)',
      'Everything in Free',
      'Full themed brand storefront (color themes per category)',
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
      'Virtual assistant on your page and WhatsApp',
      '500 assistant messages per month',
      'Answers product and pricing questions automatically',
      'Understands current date, time, and recent chat context',
      'Handles booking and appointment management',
      'Captures orders and sends them to WhatsApp',
      'Customizable welcome message',
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
    q: 'Do I get my own personal brand subdomain?',
    a: 'Pro accounts use a subdomain such as yourbrand.qriblo.com. Free accounts use a Qriblo link such as qriblo.com/yourbrand.',
  },
  {
    q: 'What counts as a "catalog item"?',
    a: 'A product or service you list on your Qriblo page, with its name, details, and price.',
  },
  {
    q: 'How does the Virtual Assistant work?',
    a: 'Message Qriblo on WhatsApp at +234 704 702 7012 to discover businesses, shop, place orders, or request appointments. Pro virtual assistants answer questions and collect request details; the business confirms availability, payment, and next steps. Pro includes 500 assistant messages per month; Free includes none.',
  },
  {
    q: 'What does "Pro Verified" mean?',
    a: 'Pro pages display the Pro Verified badge.',
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
    q: 'Can I accept payments through Qriblo?',
    a: 'Qriblo is WhatsApp-first today. Customers contact you to order or book, then you handle payment in your own way such as transfer, cash, or POS. In-platform customer payments are not live yet.',
  },
]

const billingOptions: Array<{
  cycle: 'monthly' | 'quarterly' | 'biannual' | 'yearly'
  label: string
  cadence: string
  save?: string
}> = [
  { cycle: 'monthly', label: 'Monthly', cadence: 'Pay as you go' },
  { cycle: 'quarterly', label: 'Quarterly', cadence: 'Every 3 months', save: 'Save 7%' },
  { cycle: 'biannual', label: 'Biannual', cadence: 'Every 6 months', save: 'Save 10%' },
  { cycle: 'yearly', label: 'Yearly', cadence: 'Best value', save: 'Save 33%' },
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
  const [proOpen, setProOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const updateNav = () => setNavScrolled(window.scrollY > 8)
    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
    return () => window.removeEventListener('scroll', updateNav)
  }, [])

  const getPrice = () => {
    switch (billingCycle) {
      case 'quarterly': return { amount: '₦6,975', period: 'every 3 months', monthly: '₦2,325 per month', save: 'Save 7%' }
      case 'biannual': return { amount: '₦13,500', period: 'every 6 months', monthly: '₦2,250 per month', save: 'Save 10%' }
      case 'yearly': return { amount: '₦20,000', period: 'per year', monthly: 'about ₦1,667 per month', save: 'Save 33%' }
      default: return { amount: '₦2,500', period: 'per month', monthly: 'Billed monthly', save: null }
    }
  }
  const currentPrice = getPrice()
  const freeHighlights = ['Your Qriblo page and business details', 'Up to 5 products or services', 'WhatsApp order or booking links', '0 virtual assistant messages per month', 'Listing in the Qriblo directory']
  const proHighlights = ['500 virtual assistant messages per month', 'Assistant on your page and WhatsApp', 'Answers questions about your products and prices', 'Collects order and booking details', 'Unlimited products and services', 'Your own Qriblo subdomain', 'Pro Verified badge and visitor analytics']

  return (
    <div className="qr-pricing">
      <header className={"qr-pricing-nav" + (navScrolled ? " is-scrolled" : "")}>
        <nav className="qr-pricing-nav-inner" aria-label="Main navigation">
          <Link href="/" className="qr-pricing-logo" aria-label="Qriblo home"><Image src="/logo.png" alt="Qriblo" width={160} height={54} priority /></Link>
          <div className="qr-pricing-nav-links"><Link href="/#platform">Platform</Link><Link href="/directory">Discover</Link><Link href="/pricing" aria-current="page">Pricing</Link><Link href="/agents">Agents</Link></div>
          <div className="qr-pricing-nav-actions"><a className="qr-pricing-whatsapp" href="https://wa.me/2347047027012" target="_blank" rel="noopener noreferrer"><MessageCircle size={14}/>WhatsApp</a><Link href="/login">Log in</Link><Link className="qr-pricing-nav-cta" href="/signup">Create a professional site <ArrowRight size={15}/></Link></div>
          <a className="qr-pricing-mobile-whatsapp" href="https://wa.me/2347047027012" aria-label="Chat with Qriblo on WhatsApp" target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/></a>
          <Link className="qr-pricing-mobile-cta" href="/signup">Create a professional site <ArrowRight size={14}/></Link>
        </nav>
      </header>

      <main>
        <section className="qr-pricing-hero">
          <div className="qr-pricing-hero-orbit" aria-hidden="true" />
          <div className="qr-pricing-hero-inner">
            <p className="qr-pricing-eyebrow qr-pricing-eyebrow-light"><span/> PRICING</p>
            <h1>One Qriblo page for customers.<br/><em>A virtual assistant to help.</em></h1>
            <p>Show your products or services in one place customers can browse. Your virtual assistant can answer questions and collect details for an order or booking request.</p>
            <a className="qr-pricing-hero-link" href="#plans">See plans <ArrowRight size={15}/></a>
          </div>
        </section>

        <section className="qr-pricing-capabilities">
          <div className="qr-pricing-section-head"><p className="qr-pricing-eyebrow"><span/> MORE THAN A PLAN</p><h2>One place for your business<br/><em>and your customers.</em></h2><p>Bring the details customers need together, then give them a clear way to ask, browse, and take the next step.</p></div>
          <div className="qr-pricing-capability-grid">
            <article><Globe2/><h3>Your Qriblo page</h3><p>Share your business details, location, and one link customers can open.</p></article>
            <article><ShoppingBag/><h3>Products and services</h3><p>Show what you offer with names, descriptions, images, and prices.</p></article>
            <article className="qr-pricing-capability-feature"><Bot/><h3>Virtual assistant</h3><p>Answer customer questions and collect details for orders or booking requests.</p></article>
            <article><BarChart2/><h3>Discovery and trust</h3><p>Help customers find businesses, and show reviews, verification, and visitor information.</p></article>
          </div>
        </section>

        <section id="plans" className="qr-pricing-plans">
          <div className="qr-pricing-section-head">
            <p className="qr-pricing-eyebrow"><span/> PLANS FOR YOUR BUSINESS</p>
            <h2>Choose how you want<br/><em>to show up.</em></h2>
            <p>Start with the essentials on Free, or choose Pro for a virtual assistant with 500 messages each month.</p>
          </div>
          <div className="qr-pricing-billing" aria-label="Billing frequency">
            {billingOptions.map(option => {
              const active = billingCycle === option.cycle
              return <button key={option.cycle} type="button" onClick={() => setBillingCycle(option.cycle)} aria-pressed={active} className={active ? 'active' : ''}>
                <strong>{option.label}</strong><span>{option.save || option.cadence}</span>
              </button>
            })}
          </div>

          <div className="qr-pricing-card-grid">
            <article className="qr-plan-card qr-plan-card-free">
              <div className="qr-plan-card-top"><span className="qr-plan-kicker">A clear place to begin</span><h3>Free</h3><p>Set up your Qriblo page and let customers browse what you offer.</p></div>
              <div className="qr-plan-price"><strong>₦0</strong><span>forever</span></div>
              <Link href="/signup" className="qr-plan-button qr-plan-button-light">Create a professional site <ArrowRight size={15}/></Link>
              <ul>{freeHighlights.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>
              <FeatureAccordion sections={freeFeatures} accentColor="#8f3c17" />
            </article>

            <article className="qr-plan-card qr-plan-card-pro">
              <span className="qr-plan-popular"><Star size={12} fill="currentColor"/> MORE ROOM TO GROW</span>
              <div className="qr-plan-card-top"><span className="qr-plan-kicker">More tools for daily selling</span><h3>Pro <VerifiedBadge size="sm" /></h3><p>Add room for your full catalog and a virtual assistant to answer customer questions.</p></div>
              <div className="qr-plan-price"><strong>{currentPrice.amount}</strong><span>{currentPrice.period} · {currentPrice.save || 'cancel anytime'}</span><small>{currentPrice.monthly}</small></div>
              <Link href={`/signup?plan=pro&billing=${billingCycle}`} className="qr-plan-button qr-plan-button-accent">Choose Pro <ArrowRight size={15}/></Link>
              <ul>{proHighlights.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul>
              <button className="qr-plan-feature-toggle" type="button" onClick={() => setProOpen(!proOpen)} aria-expanded={proOpen}>{proOpen ? 'Hide full feature list' : 'See full feature list'}<ChevronDown className={proOpen ? 'rotate' : ''}/></button>
              {proOpen && <div className="qr-pricing-full-features">{proFeatures.map(({icon: Icon,section,items}) => <div key={section}><h4><Icon/>{section}</h4><ul>{items.map(item => <li key={item}><CheckCircle2/>{item}</li>)}</ul></div>)}</div>}
            </article>
          </div>

          <div className="qr-pricing-assistant">
            <div className="qr-pricing-assistant-icon"><MessageCircle/></div>
            <div><p className="qr-pricing-eyebrow qr-pricing-eyebrow-light"><span/> YOUR VIRTUAL ASSISTANT</p><h3>Help for shoppers.<br/>Support for sellers.</h3><p>Message Qriblo on WhatsApp to discover businesses, shop products, place an order, or request an appointment. Pro virtual assistants answer questions and collect order or booking details; the business confirms availability and next steps. Free includes no assistant messages; Pro includes 500 each month.</p><a href="https://wa.me/2347047027012">Chat with Qriblo on WhatsApp <ArrowRight size={15}/></a></div>
            <div className="qr-pricing-assistant-note"><Bot/><span>On your page<br/>and WhatsApp</span></div>
          </div>

          <section className="qr-pricing-faq">
            <div className="qr-pricing-section-head"><p className="qr-pricing-eyebrow"><span/> GOOD TO KNOW</p><h2>Common<br/><em>questions.</em></h2></div>
            <div className="qr-pricing-faq-list">{faqs.map(faq => <FaqItem key={faq.q} {...faq} />)}</div>
          </section>

          <section className="qr-pricing-bottom-cta"><p className="qr-pricing-eyebrow qr-pricing-eyebrow-light"><span/> YOUR NEXT CUSTOMER IS OUT THERE</p><h2>Give your business<br/><em>a place to grow.</em></h2><p>Create a professional site and give customers one clear place to find what you offer.</p><Link href="/signup" className="qr-plan-button qr-plan-button-accent">Create a professional site <ArrowRight size={15}/></Link></section>
        </section>
      </main>
      <footer className="qr-pricing-footer"><Link href="/" className="qr-pricing-logo"><Image src="/logo.png" alt="Qriblo" width={150} height={50}/></Link><div><Link href="/directory">Discover</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><a href="mailto:qriblovirtual@gmail.com">Support: qriblovirtual@gmail.com</a></div><span>© {new Date().getFullYear()} Qriblo · Lagos, Nigeria</span></footer>
    </div>
  )
}
