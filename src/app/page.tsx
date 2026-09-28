'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowDown, ArrowRight, BadgeCheck, BarChart3, Bot, CalendarDays, Check, ChevronRight, Globe2, MessageCircle, Package, ShieldCheck, ShoppingBag, Sparkles, Star, X } from 'lucide-react'
import { MasterChatWidget } from '@/components/MasterChatWidget'

const problems = [
  ['The reply problem', 'A customer asks for a price while you are busy. The conversation goes quiet.', '01'],
  ['The scattered catalog', 'Products, prices and details live in different chats, posts and status updates.', '02'],
  ['The missed order', 'A customer is ready to buy, but there is no clear next step to take.', '03'],
  ['The trust gap', 'New customers need to know who you are before they feel ready to order.', '04'],
]
const steps = [
  ['Create your professional site', 'Add your story, products, services, prices and the details customers ask for.', '01'],
  ['Share your Qriblo link', 'Put one clear link in your bio, WhatsApp status, messages and flyers.', '02'],
  ['Let customers explore', 'People can browse your catalog, see reviews, ask questions and choose what to do.', '03'],
  ['Keep the conversation moving', 'Your assistant helps answer questions and capture order or booking requests.', '04'],
]
const capabilities = [
  [ShoppingBag, 'A home for your brand', 'Share who you are, what you do, and what makes your brand yours.'],
  [Package, 'Products and services', 'Present items with photos, prices and details. Support orders and booking enquiries.'],
  [Bot, 'An assistant that knows your brand', 'Answer common questions, understand your offerings and help customers take the next step.'],
  [Star, 'Trust that travels with you', 'Bring together reviews, verified details, brand location and customer actions.'],
]
const proof = [
  ['Product sellers', 'Let customers browse a menu, collection or catalog, then order through WhatsApp.', '/tolas-kitchen', 'View a product page'],
  ['Service brands', 'Show your services and help customers send a booking request with the right details.', '/musafix-electricals', 'View a service page'],
  ['Hybrid brands', 'Bring products and services into one experience, with one link to share.', '/signup?business=hybrid-business', 'Create a page for both'],
]
const trustItems = [[BadgeCheck, 'Verified brand'], [Star, 'Customer reviews'], [Globe2, 'Brand link'], [Package, 'Product catalog'], [CalendarDays, 'Booking requests'], [BarChart3, 'Visitor insights']]

function BrandIllustration({ kind }: { kind: number }) {
  return <div className={`qr-illustration qr-illustration-${kind}`} aria-hidden="true">
    <div className="qr-illustration-orbit" />
    {kind === 0 ? <><div className="qr-ill-window"><span className="qr-ill-top" /><span className="qr-ill-product" /><span className="qr-ill-product" /><span className="qr-ill-product" /></div><div className="qr-ill-bubble"><ShoppingBag /><span>Browse products</span></div></> : kind === 1 ? <><div className="qr-ill-calendar"><span>BOOK A SERVICE</span><b>Choose a time</b><div>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <i className={i === 3 ? 'active' : ''} key={i}>{d}</i>)}</div><button>Send request <ArrowRight /></button></div><div className="qr-ill-bubble"><CalendarDays /><span>Booking request</span></div></> : <><div className="qr-ill-hybrid-card qr-ill-hybrid-back"><Package /><span>Products</span></div><div className="qr-ill-hybrid-card qr-ill-hybrid-front"><MessageCircle /><span>Services</span><b>One Qriblo page</b></div><div className="qr-ill-plus">+</div></>}
  </div>
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return <main className="qr-home">
    <header className="qr-nav">
      <nav className="qr-nav-inner">
        <Link href="/" aria-label="Qriblo home" className="qr-wordmark"><Image src="/logo.png" alt="Qriblo" width={150} height={50} priority /></Link>
        <div className="qr-nav-links"><Link href="#platform">Platform</Link><Link href="/directory">Discover</Link><Link href="/pricing">Pricing</Link><Link href="/agents">Agents</Link></div>
        <div className="qr-nav-actions"><Link href="https://wa.me/2347047027012" target="_blank" rel="noopener noreferrer" className="qr-nav-whatsapp"><MessageCircle size={14} />Chat on WhatsApp</Link><Link href="/login" className="qr-login">Log in</Link><Link href="/signup" className="qr-nav-cta">Create a professional site <ArrowRight size={14} /></Link></div>
        <button className="qr-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? <X /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>}</button>
      </nav>
      {menuOpen && <div className="qr-mobile-menu">{[['Platform', '#platform'], ['How it works', '#how-it-works'], ['Discover brandes', '/directory'], ['Pricing', '/pricing'], ['Agents', '/agents'], ['Log in', '/login']].map(([label, href]) => <Link href={href} key={label} onClick={() => setMenuOpen(false)}>{label}<ArrowRight size={15} /></Link>)}<Link className="qr-mobile-whatsapp" href="https://wa.me/2347047027012" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}><MessageCircle size={15} />Chat with Qriblo on WhatsApp</Link><Link className="qr-mobile-menu-cta" href="/signup" onClick={() => setMenuOpen(false)}>Create a professional site <ArrowRight size={15} /></Link></div>}
    </header>

    <section className="qr-hero">
      <div className="qr-hero-orbit" aria-hidden="true" /><div className="qr-hero-lines" aria-hidden="true" />
      <div className="qr-hero-inner">
        <p className="qr-eyebrow qr-hero-eyebrow"><span /> YOUR brand, A LITTLE CLOSER</p>
        <h1>Your customers are looking.<br /><em>Qriblo brings them closer.</em></h1>
        <p className="qr-hero-copy">Give customers one place to browse your products or services. Qriblo provides a virtual assistant to answer their questions and collect the details for an order or booking request—on your Qriblo page or WhatsApp.</p>
        <div className="qr-hero-buttons"><Link href="/signup" className="qr-pill qr-pill-accent">Create a professional site <ArrowRight size={15} /></Link><div className="qr-hero-secondary"><Link href="#how-it-works" className="qr-pill qr-pill-outline">See how it works <ArrowDown size={14} /></Link><a href="https://wa.me/2347047027012" target="_blank" rel="noopener noreferrer" className="qr-pill qr-pill-whatsapp"><MessageCircle size={15} />Chat with Qriblo</a></div></div>
        <div className="qr-hero-scroll"><span />SCROLL TO EXPLORE</div>
      </div>
    </section>

    <section className="qr-proof-strip"><div className="qr-proof-inner"><span className="qr-proof-label">A CLOSER WAY TO DO brand</span>{[[ShoppingBag, 'Catalog'], [MessageCircle, 'WhatsApp'], [Bot, 'Assistant'], [Star, 'Reviews']].map(([Icon, label]) => <div className="qr-proof-item" key={label as string}><Icon size={16} /><span>{label as string}</span></div>)}</div></section>

    <section id="platform" className="qr-platform qr-section-light">
      <div className="qr-platform-inner">
        <div className="qr-section-intro qr-reveal"><p className="qr-eyebrow"><span /> A HOME FOR YOUR BRAND AND ASSISTANT</p><h2>Your brand has a lot to say.<br /><em>Put it all in one place.</em></h2><p>Qriblo helps customers discover your brand and brings them to your doorstep. Show your products or services, prices, and contact details on one page they can browse and share.</p></div>
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
      <div className="qr-narrow-intro qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> THE PROBLEM</p><h2>Your customers shouldn&apos;t have to work to buy from you.</h2><p>A good product can get lost between a post, a question and a late reply. Give every customer a clearer path to your brand.</p></div>
      <div className="qr-stack-wrap">{problems.map(([title, copy, no], i) => <article className={`qr-stack-card qr-stack-${i + 1}`} key={title}><span className="qr-stack-no">{no} <i /></span><span className="qr-stack-mark">{i === 0 ? <MessageCircle /> : i === 1 ? <Package /> : i === 2 ? <ShoppingBag /> : <ShieldCheck />}</span><h3>{title}</h3><p>{copy}</p><div className="qr-mini-ui">{i === 0 ? '“How much is this?”' : i === 1 ? 'Products · prices · details' : i === 2 ? 'Order request received' : 'Verified · reviews · location'}</div></article>)}</div>
      <p className="qr-problem-end">Your Qriblo page makes it easier to get from <em>looking</em> to <em>talking.</em></p>
    </section>

    <section id="how-it-works" className="qr-how qr-section-dark">
      <div className="qr-narrow-intro qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> HOW IT WORKS</p><h2>From first look to a real conversation.</h2><p>Qriblo keeps the important steps close, so your customers know what you offer and how to reach you.</p></div>
      <div className="qr-how-stack">{steps.map(([title, copy, no], i) => <article className={`qr-how-card qr-how-${i + 1}`} key={title}><span className="qr-step-no">{no}</span><div><h3>{title}</h3><p>{copy}</p></div><div className="qr-step-visual">{i === 0 ? <span className="qr-brand-preview"><b>Q</b><small>Your brand<br />starts here.</small></span> : i === 1 ? <span className="qr-share-preview"><Globe2 /><b>qriblo.com/<br />yourbrand</b></span> : i === 2 ? <span className="qr-catalog-preview"><ShoppingBag /><b>Browse the catalog</b></span> : <span className="qr-chat-preview"><MessageCircle /><b>What can I help you find?</b></span>}</div><span className="qr-step-corner">Q / {no}</span></article>)}</div>
      <Link href="/signup" className="qr-pill qr-pill-accent qr-how-cta">Create a professional site <ArrowRight size={15} /></Link>
    </section>

    <section className="qr-testimonials qr-section-light"><div className="qr-testimonial-intro qr-reveal"><p className="qr-eyebrow"><span /> BUILT FOR EVERYDAY SELLING</p><h2>Give each customer<br /><em>a clear next step.</em></h2><p>Help people see what you offer, get an answer, and decide how to reach you.</p></div><div className="qr-quote-grid"><article className="qr-quote-card"><ShoppingBag className="qr-proof-card-icon" /><h3>Let them browse</h3><p>Put your products or services, prices, and details in one shareable Qriblo page.</p></article><article className="qr-quote-card qr-quote-feature"><MessageCircle className="qr-proof-card-icon" /><h3>Help them get answers</h3><p>Your virtual assistant can answer questions using the brand details and catalog you provide.</p></article><article className="qr-quote-card"><ArrowRight className="qr-proof-card-icon" /><h3>Collect the next step</h3><p>Gather details for an order or booking request. The brand follows up to confirm.</p></article></div></section>

    <section className="qr-brand-types qr-section-light"><div className="qr-brand-head qr-reveal"><p className="qr-eyebrow"><span /> FOR WHAT YOU DO</p><h2>Whatever your brand,<br /><em>there is room for it here.</em></h2><p>Products, services or a little of both: make the page fit the way you work.</p></div><div className="qr-brand-rows">{proof.map(([title, copy, href, cta], i) => <article className={`qr-brand-row qr-brand-row-${i + 1}`} key={title}><div className="qr-brand-image"><BrandIllustration kind={i} /><span>0{i + 1} / 03</span></div><div className="qr-brand-copy"><p className="qr-eyebrow"><span /> {title.toUpperCase()}</p><h3>{title}</h3><p>{copy}</p><Link href={href}>{cta} <ArrowRight size={15} /></Link></div></article>)}</div><p className="qr-hybrid-note">And if you do both? <b>Qriblo does both.</b></p></section>

    <section className="qr-assistant qr-section-dark"><div className="qr-assistant-inner"><div className="qr-assistant-copy qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> A HELPFUL HAND, ANYTIME</p><h2>Help customers get answers.<br /><em>Collect the next step.</em></h2><p>Your virtual assistant can answer questions using the brand details and catalog you provide, then collect the details for an order or booking request. The brand confirms the request, payment, and delivery.</p><div className="qr-assistant-points">{['Answers product questions', 'Collects order details', 'Supports booking requests'].map(s => <span key={s}><Check size={14} />{s}</span>)}</div><a className="qr-assistant-whatsapp" href="https://wa.me/2347047027012" target="_blank" rel="noopener noreferrer">Chat with Qriblo on WhatsApp <ArrowRight size={14} /></a></div><div className="qr-chat-demo qr-reveal"><div className="qr-chat-head"><span className="qr-chat-avatar"><Bot size={19} /></span><span><b>Tola&apos;s assistant</b><small>Virtual assistant</small></span><span className="qr-chat-more">•••</span></div><div className="qr-chat-date">SAMPLE CHAT</div><div className="qr-chat-msg qr-user-msg">Can I ask about a product?</div><div className="qr-chat-msg qr-bot-msg">Of course. Which item are you interested in?</div><div className="qr-chat-msg qr-user-msg">The one I saw in the catalog.</div><div className="qr-order-status"><span><MessageCircle size={13} /></span><span><b>Questions and requests</b><small>The brand confirms the next steps</small></span></div><div className="qr-chat-input">Message <span>➤</span></div></div></div></section>

    <section className="qr-capabilities qr-section-light"><div className="qr-capabilities-intro qr-reveal"><p className="qr-eyebrow"><span /> MORE THAN A LINK</p><h2>Your brand,<br /><em>all in one place.</em></h2><p>Everything that helps a new customer meet your brand, understand what you offer and get in touch.</p></div><div className="qr-capability-grid">{capabilities.map(([Icon, title, copy], i) => <article className="qr-capability" key={title as string}><div className="qr-capability-num">0{i + 1}</div><Icon className="qr-capability-icon" /><h3>{title as string}</h3><p>{copy as string}</p><span className="qr-capability-line" /></article>)}</div></section>

    <section className="qr-trust qr-section-light"><div className="qr-trust-inner"><div className="qr-trust-copy qr-reveal"><p className="qr-eyebrow"><span /> TRUST, BUILT IN</p><h2>Look like a brand people can trust.</h2><p>Show the details that help customers feel comfortable choosing you, from reviews and location to your products and contact options.</p><Link href="/directory">Discover Qriblo brandes <ArrowRight size={15} /></Link></div><div className="qr-trust-grid">{trustItems.map(([Icon, label]) => <div key={label as string}><Icon size={18} /><span>{label as string}</span><Check size={13} className="qr-trust-check" /></div>)}</div></div></section>

    <section className="qr-discovery qr-section-dark"><div className="qr-discovery-inner"><div className="qr-directory-art"><div className="qr-directory-top"><span>Qriblo / Discover</span><span>✳ Lagos</span></div><div className="qr-directory-search"><span>Find a brand, product or service</span><span>⌕</span></div><div className="qr-directory-cats"><span>All</span><span>Food</span><span>Beauty</span><span>Services</span></div>{[['Tola’s Kitchen', 'Food · Lekki', '/jollof.png'], ['MusaFix Electricals', 'Home services · Ikeja', '/asun.jfif']].map(([name, detail, img]) => <div className="qr-directory-card" key={name}><Image src={img} alt="" width={54} height={48} /><span><b>{name}</b><small>{detail}</small></span><BadgeCheck size={14} /></div>)}</div><div className="qr-discovery-copy qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> FIND YOUR NEXT CUSTOMER</p><h2>Get discovered,<br /><em>not just shared.</em></h2><p>Your Qriblo page can live in your bio, WhatsApp status and flyers — and in the Qriblo brand network, where customers explore brands.</p><Link href="/directory" className="qr-pill qr-pill-outline">Explore brands <ArrowRight size={15} /></Link></div></div></section>

    <section className="qr-final-cta"><div className="qr-final-glow" /><div className="qr-final-content qr-reveal"><p className="qr-eyebrow qr-eyebrow-light"><span /> YOUR NEXT CUSTOMER IS OUT THERE</p><h2>Give your brand<br /><em>a place to grow.</em></h2><p>Create a professional site in minutes, then give customers one clear place to find you.</p><Link href="/signup" className="qr-pill qr-pill-accent">Create a professional site <ArrowRight size={15} /></Link></div></section>

    <footer className="qr-footer"><div className="qr-footer-main"><div className="qr-footer-brand"><Link href="/" aria-label="Qriblo home" className="qr-wordmark"><Image src="/logo.png" alt="Qriblo" width={150} height={50} /></Link><p>Your customers are looking.<br />Qriblo brings them closer.</p></div><div className="qr-footer-col"><b>EXPLORE</b><Link href="/directory">Discover brandes</Link><Link href="/pricing">Pricing</Link><Link href="#platform">Platform</Link></div><div className="qr-footer-col"><b>FOR brand</b><Link href="/signup">Create a professional site</Link><Link href="/tolas-kitchen">Product demo</Link><Link href="/musafix-electricals">Service demo</Link></div><div className="qr-footer-col"><b>COMPANY</b><Link href="/agents">Agent programme</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></div></div><div className="qr-footer-bottom"><span>© {new Date().getFullYear()} Qriblo</span><a href="mailto:qriblovirtual@gmail.com">Support: qriblovirtual@gmail.com</a><span>Made for the brandes bringing us closer.</span><span>LAGOS, NIGERIA</span></div></footer>
    <MasterChatWidget />
  </main>
}

