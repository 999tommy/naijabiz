'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, BadgeCheck, BarChart3, Bot, CalendarDays, Check, ChevronRight, Globe2, MessageCircle, Package, ShieldCheck, ShoppingBag, Star, X } from 'lucide-react'
import { MasterChatWidget } from '@/components/MasterChatWidget'

const problems = [
  ['The unanswered question', 'A customer asks about price, availability or delivery while you are busy.', '01'],
  ['The missing context', 'Your offer, prices and policies are spread across chats, posts and notes.', '02'],
  ['The lost next step', 'A customer is ready to order or book, but no one captures the details.', '03'],
  ['The trust gap', 'New customers need the right details before they feel ready to order.', '04'],
]
const steps = [
  ['Create your brand page', 'with a personal domain Give your brand a home with its details, products or services, and prices.', '01'],
  ['Give your VA the context', 'Add your offer, prices, delivery details, and booking or payment notes.', '02'],
  ['Put your VA to work', 'It answers customer questions on your page and WhatsApp.', '03'],
  ['Capture the next step', 'Your VA gathers order or booking details and sends the request to WhatsApp.', '04'],
]
const proof = [
  ['Product brands', 'Let customers explore a menu, collection or catalog, then send an order request through WhatsApp.', '/tolas-kitchen', 'View a product brand'],
  ['Service brands', 'Show your services and help customers send a booking request with the right details.', '/musafix-electricals', 'View a service brand'],
  ['Brands that do both', 'Bring products and services into one experience, with one link to share.', '/signup?business=hybrid-business', 'Create a page for both'],
]
const trustItems = [[BadgeCheck, 'Verified badge'], [Star, 'Customer reviews'], [Globe2, 'Brand link'], [Package, 'Products'], [CalendarDays, 'Booking requests'], [BarChart3, 'Visitor count']]

function BrandIllustration({ kind }: { kind: number }) {
  return <div className={`qr-illustration qr-illustration-${kind}`} aria-hidden="true">
    <div className="qr-illustration-orbit" />
    {kind === 0 ? <><div className="qr-ill-window"><span className="qr-ill-top" /><span className="qr-ill-product" /><span className="qr-ill-product" /><span className="qr-ill-product" /></div><div className="qr-ill-bubble"><ShoppingBag /><span>Browse products</span></div></> : kind === 1 ? <><div className="qr-ill-calendar"><span>BOOK A SERVICE</span><b>Choose a time</b><div>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <i className={i === 3 ? 'active' : ''} key={i}>{d}</i>)}</div><button>Send request <ArrowRight /></button></div><div className="qr-ill-bubble"><CalendarDays /><span>Booking request</span></div></> : <><div className="qr-ill-hybrid-card qr-ill-hybrid-back"><Package /><span>Products</span></div><div className="qr-ill-hybrid-card qr-ill-hybrid-front"><MessageCircle /><span>Services</span><b>One Qriblo page</b></div><div className="qr-ill-plus">+</div></>}
  </div>
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)

  useEffect(() => {
    const updateNav = () => {
      const platform = document.getElementById('platform')
      const nav = document.querySelector('.qr-home .qr-nav')
      if (!platform || !nav) return
      setNavScrolled(platform.getBoundingClientRect().top <= nav.getBoundingClientRect().height)
    }
    updateNav()
    window.addEventListener('scroll', updateNav, { passive: true })
    window.addEventListener('resize', updateNav)
    return () => {
      window.removeEventListener('scroll', updateNav)
      window.removeEventListener('resize', updateNav)
    }
  }, [])

  return <main className="qr-home">
    <header className={"qr-nav" + (navScrolled ? " is-scrolled" : "")}>
      <nav className="qr-nav-inner">
        <Link href="/" aria-label="Qriblo home" className="qr-wordmark"><Image src="/logo.png" alt="Qriblo" width={150} height={50} priority /></Link>
        <div className="qr-nav-links"><Link href="#platform">Platform</Link><Link href="/directory">Discover</Link><Link href="/pricing">Pricing</Link><Link href="/agents">Agents</Link></div>
        <div className="qr-nav-actions"><Link href="https://wa.me/2347047207012" target="_blank" rel="noopener noreferrer" className="qr-nav-whatsapp"><MessageCircle size={14} />Chat on WhatsApp</Link><Link href="/login" className="qr-login">Log in</Link><Link href="/signup" className="qr-nav-cta">Create your brand page <ArrowRight size={14} /></Link></div>
        <button className="qr-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}</button>
      </nav>
      {menuOpen && <div className="qr-mobile-menu">{[['Your brand page', '#platform'], ['How it works', '#how-it-works'], ['Discover brands', '/directory'], ['Pricing', '/pricing'], ['Agents', '/agents'], ['Log in', '/login']].map(([label, href]) => <Link href={href} key={label} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={15} /></Link>)}<Link className="qr-mobile-whatsapp" href="https://wa.me/2347047207012" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}><MessageCircle size={15} />Chat with Qriblo on WhatsApp</Link><Link className="qr-mobile-menu-cta" href="/signup" onClick={() => setMenuOpen(false)}>Create your brand page <ArrowRight size={15} /></Link></div>}
    </header>

    <section className="qr-hero">
      <div className="qr-hero-orbit" aria-hidden="true" /><div className="qr-hero-lines" aria-hidden="true" />
      <div className="qr-hero-inner">
        <h1>Your brand deserves a VA.<br /><em>Qriblo puts it to work.</em></h1>
        <p className="qr-hero-copy">Qriblo gives your brand a professional website and a virtual assistant to answer customer questions and capture order or booking requests on your qriblo site and on WhatsApp.</p>
        <div className="qr-hero-buttons"><Link href="/signup" className="qr-pill qr-pill-accent">Create a professional site <ArrowRight size={15} /></Link><div className="qr-hero-secondary"><Link href="#how-it-works" className="qr-pill qr-pill-outline">See how it works <ArrowDown size={14} /></Link><a href="https://wa.me/2347047207012" target="_blank" rel="noopener noreferrer" className="qr-pill qr-pill-whatsapp"><MessageCircle size={15} />Chat with Qriblo</a></div></div>
        <div className="qr-hero-scroll"><span />SCROLL TO EXPLORE</div>
      </div>
    </section>

    <section className="qr-proof-strip"><div className="qr-proof-inner"><span className="qr-proof-label">A VA BUILT AROUND YOUR BRAND</span>{[[Globe2, 'Brand page'], [Package, 'Brand knowledge'], [Bot, 'Virtual assistant'], [ShoppingBag, 'Orders & bookings']].map(([Icon, label]) => <div className="qr-proof-item" key={label as string}><Icon size={16} /><span>{label as string}</span></div>)}</div></section>

    <section className="qr-assistant qr-section-peach"><div className="qr-assistant-inner"><div className="qr-assistant-copy qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> YOUR BRAND’S VA</p><h2>A VA that knows what your brand offers.</h2><p>After creating a Professional Site for your Brand Give your VA useful context: products, prices, services, delivery details, booking policies and payment notes. It answers customer questions and captures order or booking requests; you confirm availability, payment and next steps.</p><div className="qr-assistant-points">{['Answers questions using brand details', 'Collects order details', 'Helps with bookings'].map(s => <span key={s}><Check size={14} />{s}</span>)}</div><div className="qr-trust-grid">{trustItems.map(([Icon, label]) => <div key={label as string}><Icon size={18} /><span>{label as string}</span><Check size={13} className="qr-trust-check" /></div>)}</div><a className="qr-assistant-whatsapp" href="https://wa.me/2347047207012" target="_blank" rel="noopener noreferrer">Chat with Qriblo on WhatsApp <ArrowRight size={14} /></a></div><div className="qr-chat-demo qr-reveal"><div className="qr-chat-head"><span className="qr-chat-avatar"><Bot size={19} /></span><span><b>Tola&apos;s assistant</b><small>Virtual assistant</small></span><span className="qr-chat-more">•••</span></div><div className="qr-chat-date">SAMPLE CHAT</div><div className="qr-chat-msg qr-user-msg">How much is the jollof with turkey?</div><div className="qr-chat-msg qr-bot-msg">It’s ₦4,500. Would you like to place an order?</div><div className="qr-chat-msg qr-user-msg">Yes, please.</div><div className="qr-order-status"><span><MessageCircle size={13} /></span><span><b>Order request captured</b><small>Tola confirms availability and next steps</small></span></div><div className="qr-chat-input">Message <span>➤</span></div></div></div></section>

    <section id="platform" className="qr-platform qr-section-light">
      <div className="qr-platform-inner">
        <div className="qr-section-intro qr-reveal"><p className="qr-eyebrow"><span /> YOUR PAGE AND ASSISTANT, IN ONE PLACE</p><h2> Give your VA the context<br /><em>to help customers well.</em></h2><p>Your page brings your brand details, products or services, prices, and contact options together. Your VA can use that information to answer questions and guide customers to their next step.</p></div>
        <div className="qr-platform-demo qr-reveal">
          <div className="qr-demo-top"><span className="qr-demo-label">A Qriblo page</span><span className="qr-demo-url"><ShieldCheck size={13} /> tolas-kitchen.qriblo.com</span></div>
          <div className="qr-demo-brand"><div className="qr-brand-avatar">T</div><div className="qr-brand-title"><h3>Tola&apos;s Kitchen <BadgeCheck size={15} /></h3><p>Home-cooked favourites · Lekki, Lagos</p></div></div>
          <div className="qr-demo-tabs"><span>Popular</span><span>Menu</span><span>About</span><span>Reviews</span></div>
          <div className="qr-menu-products">{[['Party jollof + turkey', '₦4,500', '/jollof.png'], ['Egusi soup + swallow', '₦4,000', '/egusi.jpg'], ['Fried rice + chicken', '₦4,500', '/fried-rice.jpg']].map(([name, price, img]) => <div className="qr-food-row" key={name}><Image src={img} alt="" width={68} height={60} /><span><b>{name}</b><small>{price}</small></span><ChevronRight size={15} /></div>)}</div>
          <Link href="/tolas-kitchen" className="qr-demo-order">Order on WhatsApp <MessageCircle size={15} /></Link>
          <div className="qr-demo-details">Products <i /> Services <i /> Reviews <i /> WhatsApp</div>
        </div>
      </div>
      <div className="qr-platform-stats">{[['One', 'Qriblo page for your brand'], ['Products', 'and services to show'], ['One link', 'ready to share']].map(([num, label]) => <div key={num}><b>{num}</b><span>{label}</span></div>)}</div>
    </section>

    <section id="problem" className="qr-problem qr-section-dark">
      <div className="qr-narrow-intro qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> WHY YOUR BRAND NEEDS A VA</p><h2>Your customers have questions. Your brand deserves a ready answer.</h2><p>Your VA can respond to questions with the details you provide, then capture what a customer wants to order or book.</p></div>
      <div className="qr-stack-wrap">{problems.map(([title, copy, no], i) => <article className={`qr-stack-card qr-stack-${i + 1}`} key={title}><span className="qr-stack-no">{no} <i /></span><span className="qr-stack-mark">{i === 0 ? <MessageCircle /> : i === 1 ? <Package /> : i === 2 ? <ShoppingBag /> : <ShieldCheck />}</span><h3>{title}</h3><p>{copy}</p><div className="qr-mini-ui">{i === 0 ? '“How much is this?”' : i === 1 ? 'Products · prices · details' : i === 2 ? 'Order request received' : 'Verified · reviews · location'}</div></article>)}</div>
      <p className="qr-problem-end">Your VA helps move a customer from <em>question</em> to <em>request.</em></p>
    </section>

    <section id="how-it-works" className="qr-how qr-section-peach">
      <div className="qr-narrow-intro qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> HOW IT WORKS</p><h2>From brand knowledge to customer action.</h2><p>Set up your page, give your VA the right context, and let it handle customer questions and requests.</p></div>
      <div className="qr-how-stack">{steps.map(([title, copy, no], i) => <article className={`qr-how-card qr-how-${i + 1}`} key={title}><span className="qr-step-no">{no}</span><div><h3>{title}</h3><p>{copy}</p></div><div className="qr-step-visual">{i === 0 ? <span className="qr-brand-preview"><b>Q</b><small>Your brand<br />starts here.</small></span> : i === 1 ? <span className="qr-share-preview"><Globe2 /><b>Your brand<br />on Qriblo</b></span> : i === 2 ? <span className="qr-catalog-preview"><ShoppingBag /><b>Answer customer questions</b></span> : <span className="qr-chat-preview"><MessageCircle /><b>Order or booking request</b></span>}</div><span className="qr-step-corner">Q / {no}</span></article>)}</div>
      <Link href="/signup" className="qr-pill qr-pill-accent qr-how-cta">Create your brand page <ArrowRight size={15} /></Link>
    </section>

    <section className="qr-testimonials qr-section-light"><div className="qr-testimonial-intro qr-reveal"><p className="qr-eyebrow"><span /> A VIRTUAL ASSISTANT FOR YOUR BRAND</p><h2>Give your VA<br /><em>a useful job to do.</em></h2><p>Answer questions with your brand knowledge, capture what customers need, and pass requests to WhatsApp for you to confirm.</p></div><div className="qr-quote-grid"><article className="qr-quote-card"><ShoppingBag className="qr-proof-card-icon" /><h3>Give it the facts</h3><p>Add your products or services, prices, delivery details and booking or payment notes.</p></article><article className="qr-quote-card qr-quote-feature"><MessageCircle className="qr-proof-card-icon" /><h3>Let your VA answer</h3><p>It can answer questions about your products and prices on your page and WhatsApp.</p></article><article className="qr-quote-card"><ArrowRight className="qr-proof-card-icon" /><h3>Capture a request</h3><p>Your VA gathers order or booking details and sends the request to WhatsApp for you to confirm.</p></article></div></section>

    <section className="qr-brand-types qr-section-light"><div className="qr-brand-head qr-reveal"><p className="qr-eyebrow"><span /> FOR WHAT YOU DO</p><h2>Whatever your brand,<br /><em>there is room for it here.</em></h2><p>Products, services or a little of both: make the page fit the way you work.</p></div><div className="qr-brand-rows">{proof.map(([title, copy, href, cta], i) => <article className={`qr-brand-row qr-brand-row-${i + 1}`} key={title}><div className="qr-brand-image"><BrandIllustration kind={i} /><span>0{i + 1} / 03</span></div><div className="qr-brand-copy"><p className="qr-eyebrow"><span /> {title.toUpperCase()}</p><h3>{title}</h3><p>{copy}</p><Link href={href}>{cta} <ArrowRight size={15} /></Link></div></article>)}</div><p className="qr-hybrid-note">Products and services together, with one VA to help.</p></section>



    <section className="qr-discovery qr-section-dark"><div className="qr-discovery-inner"><div className="qr-directory-art"><div className="qr-directory-top"><span>Qriblo / Discover</span><span>✳ Lagos</span></div><div className="qr-directory-search"><span>Find a brand, product or service</span><span>⌕</span></div><div className="qr-directory-cats"><span>All</span><span>Food</span><span>Beauty</span><span>Services</span></div>{[['Tola’s Kitchen', 'Food · Lekki', '/jollof.png'], ['MusaFix Electricals', 'Home services · Ikeja', '/asun.jfif']].map(([name, detail, img]) => <div className="qr-directory-card" key={name}><Image src={img} alt="" width={54} height={48} /><span><b>{name}</b><small>{detail}</small></span><BadgeCheck size={14} /></div>)}</div><div className="qr-discovery-copy qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> FIND YOUR NEXT CUSTOMER</p><h2>Help customers find your brand<br /><em>and meet its VA.</em></h2><p>Share your Qriblo page in your bio, WhatsApp status or flyers. Customers can also discover brands in the Qriblo directory and start a conversation with the right context.</p><Link href="/directory" className="qr-pill qr-pill-outline">Discover brands <ArrowRight size={15} /></Link></div></div></section>

    <section className="qr-final-cta"><div className="qr-final-glow" /><div className="qr-final-content qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> YOUR NEXT CUSTOMER IS OUT THERE</p><h2>Give your brand<br /><em>a place to grow.</em></h2><p>Create your brand page, add the knowledge your VA needs, and give customers a clear place to get answers and send a request.</p><Link href="/signup" className="qr-pill qr-pill-accent">Create your brand page <ArrowRight size={15} /></Link></div></section>

    <footer className="qr-footer"><div className="qr-footer-main"><div className="qr-footer-brand"><Link href="/" aria-label="Qriblo home" className="qr-wordmark"><Image src="/logo.png" alt="Qriblo" width={150} height={50} /></Link><p>Your brand’s next teammate.<br />Qriblo brings it to life.</p></div><div className="qr-footer-col"><b>EXPLORE</b><Link href="/directory">Discover brands</Link><Link href="/pricing">Pricing</Link><Link href="#platform">Platform</Link></div><div className="qr-footer-col"><b>FOR BRANDS</b><Link href="/signup">Create your brand page</Link><Link href="/tolas-kitchen">Product demo</Link><Link href="/musafix-electricals">Service demo</Link></div><div className="qr-footer-col"><b>COMPANY</b><Link href="/agents">Agent programme</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></div><div className="qr-footer-bottom"><span>© {new Date().getFullYear()} Qriblo</span><a href="mailto:qriblovirtual@gmail.com">Support: qriblovirtual@gmail.com</a><span>Made for brands bringing us closer.</span><span>LAGOS, NIGERIA</span></div></footer>
    <MasterChatWidget />
  </main>
}

