"use client"

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Banknote, BarChart3, Bot, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, Clock3, ExternalLink, MessageSquareText, Package, Search, ShieldCheck, ShoppingBag, Store, Users, X } from 'lucide-react'

type Data = {
    adminEmail: string; databaseHasErrors:boolean; recentAdminActions:any[]
    metrics: { businesses:number; proBusinesses:number; newBusinesses7d:number; activeProducts:number; views7d:number; viewsPrior7d:number; views30d:number; pendingOrders:number; bookings7d:number; pendingVerifications:number; pendingFeedback:number; assistantEvents30d:number; paidCount:number; revenueNaira:number; failedPayments:number; marketingTrend:{label:string;count:number}[]; marketingSources:{source:string;count:number}[]; maxSource:number }
    recentMerchants: any[]; recentFeedback: any[]; pendingOrders: any[]; pendingVerifications: any[]; upcomingBookings:any[]
    referralSummary:{members:number;referredBusinesses:number;proBusinesses:number;paidNaira:number;eligiblePayoutRounds:number}
    referralParticipants:any[]; referralPayouts:any[]; paystackTransactions:any[]
}
const money = (n:number) => `₦${Math.round(n).toLocaleString('en-NG')}`
function wa(value?:string|null){if(!value)return undefined;let digits=value.replace(/\D/g,'');if(digits.startsWith('0'))digits=`234${digits.slice(1)}`;else if(digits.length===10)digits=`234${digits}`;return digits.length>=11?`https://wa.me/${digits}`:undefined}
const date = (v:string) => new Date(v).toLocaleDateString('en-NG',{day:'numeric',month:'short'})
const sections = [['Overview','overview'],['Businesses','businesses'],['Catalog','catalog'],['Orders & bookings','operations'],['Referrals','referrals'],['Payments','payments'],['Business health','growth'],['Marketing','marketing'],['Support','support']] as const

export function NimdaDashboard({data}:{data:Data}) {
    const [active,setActive]=useState('overview')
    const [query,setQuery]=useState('')
    const [referralQuery,setReferralQuery]=useState('')
    const [mobileNav,setMobileNav]=useState(false)
    const [logout,setLogout]=useState(false)
    const [actionError,setActionError]=useState('')
    const [savingId,setSavingId]=useState('')
    const filtered=useMemo(()=>data.recentMerchants.filter(m=>`${m.business_name||''} ${m.email||''} ${m.business_slug||''}`.toLowerCase().includes(query.toLowerCase())),[query,data.recentMerchants])
    const filteredReferrals=useMemo(()=>data.referralParticipants.filter(p=>(String(p.business_name||'')+' '+String(p.email||'')+' '+String(p.whatsapp_number||'')).toLowerCase().includes(referralQuery.toLowerCase())),[referralQuery,data.referralParticipants])
    const m=data.metrics
    const trafficMax=Math.max(1,...m.marketingTrend.map(day=>day.count))
    const trafficPoints=m.marketingTrend.map((day,index)=>({x:m.marketingTrend.length>1?index/(m.marketingTrend.length-1)*700:350,y:168-day.count/trafficMax*136,count:day.count,label:day.label}))
    const trafficLine=trafficPoints.map((point,index)=>(index?'L ':'M ')+point.x.toFixed(1)+' '+point.y.toFixed(1)).join(' ')
    const trafficArea=trafficLine?'M 0 180 '+trafficLine.slice(2)+' L 700 180 Z':''
    const trafficLabels=trafficPoints.filter((_,index)=>index===0||index===trafficPoints.length-1||index%3===0)
    const attention=[
        {label:'Orders to review',value:m.pendingOrders,icon:ShoppingBag,href:'#operations',tone:'orange'},
        {label:'Bookings this week',value:m.bookings7d,icon:CalendarDays,href:'#operations',tone:'blue'},
        {label:'Businesses to verify',value:m.pendingVerifications,icon:ShieldCheck,href:'#businesses',tone:'violet'},
        {label:'Messages to answer',value:m.pendingFeedback,icon:MessageSquareText,href:'#support',tone:'rose'},
    ]
    async function updateItem(kind:'verification'|'feedback',id:string,status:string){setSavingId(id);setActionError('');try{const response=await fetch('/nimda/api/operations',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id,status})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save the change.');window.location.reload()}catch(error){setActionError(error instanceof Error?error.message:'Could not save the change.')}finally{setSavingId('')}}
    async function recordReferralPayout(id:string){
        setSavingId(id);setActionError('')
        try{
            const response=await fetch('/nimda/api/operations',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'referral_payout',id})})
            const result=await response.json()
            if(!response.ok)throw new Error(result.error||'Could not record this payout.')
            window.location.reload()
        }catch(error){setActionError(error instanceof Error?error.message:'Could not record this payout.')}
        finally{setSavingId('')}
    }
    async function signOut(){setLogout(true); await fetch('/nimda/api/logout',{method:'POST'});window.location.assign('/')}
    return <div className="nimda-shell">
        <aside className={`nimda-sidebar ${mobileNav?'is-open':''}`}>
            <a href="#overview" className="nimda-brand"><Image src="/smal-logo.png" alt="Qriblo" width={42} height={42} priority/><b>Qriblo</b><small>ADMIN</small></a>
            <p className="nimda-side-label">YOUR CONTROL ROOM</p>
            <nav>{sections.map(([label,id],i)=><button key={id} onClick={()=>{setActive(id);setMobileNav(false);document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}} className={active===id?'active':''}><span>{id==='overview'?<Activity/>:id==='businesses'?<Store/>:id==='catalog'?<Package/>:id==='operations'?<ShoppingBag/>:id==='referrals'?<Users/>:id==='payments'?<Banknote/>:id==='marketing'?<BarChart3/>:<MessageSquareText/>}</span>{label}{id==='support'&&m.pendingFeedback>0?<i>{m.pendingFeedback}</i>:null}</button>)}</nav>
            <div className="nimda-sidebar-bottom"><div><span className="nimda-online"/>Admin access on</div><small>{data.adminEmail}</small><button onClick={signOut} disabled={logout}>Sign out</button><a href="/" target="_blank" rel="noreferrer">View public site <ExternalLink size={13}/></a></div>
        </aside>
        {mobileNav&&<button className="nimda-backdrop" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}
        <main className="nimda-main">
            <header className="nimda-topbar"><button className="nimda-mobile-menu" onClick={()=>setMobileNav(!mobileNav)} aria-label="Menu">☰</button><div className="nimda-breadcrumb">Qriblo <ChevronRight size={14}/><b>{sections.find(x=>x[1]===active)?.[0]}</b></div><div className="nimda-top-actions"><span className="nimda-today">{new Date().toLocaleDateString('en-NG',{weekday:'long',day:'numeric',month:'long'})}</span><span className="nimda-avatar">{data.adminEmail.slice(0,1).toUpperCase()}</span></div></header>
            <div className="nimda-content">
                {data.databaseHasErrors&&<div className="nimda-db-warning" role="alert"><CircleAlert/><span><b>Some dashboard data could not be loaded.</b> Numbers may be incomplete. Refresh or check the Supabase connection and access.</span></div>}
                <section id="overview" className="nimda-section nimda-welcome"><div><p className="nimda-eyebrow"><span/> THE DAILY PICTURE</p><h1>Good morning, team.</h1><p>Here’s what needs attention and how Qriblo is growing today.</p></div><div className="nimda-welcome-chip"><span>LIVE FROM YOUR DATABASE</span><b>{m.businesses.toLocaleString()} businesses</b><small>Updated just now</small></div></section>
                <section className="nimda-attention"><div className="nimda-section-heading"><div><p className="nimda-eyebrow">START HERE</p><h2>Needs attention</h2></div><span>Act on these first</span></div><div className="nimda-attention-grid">{attention.map(item=><a key={item.label} href={item.href} className={`nimda-attention-card ${item.tone}`}><item.icon/><div><b>{item.value}</b><span>{item.label}</span></div><ArrowRight/></a>)}</div></section>
                <section className="nimda-section" id="growth"><div className="nimda-section-heading"><div><p className="nimda-eyebrow">BUSINESS HEALTH</p><h2>At a glance</h2></div><span>Compared with the previous 7 days</span></div><div className="nimda-kpi-grid">
                    <article><span className="nimda-kpi-icon wine"><Store/></span><small>All businesses</small><b>{m.businesses.toLocaleString()}</b><em>{m.newBusinesses7d} joined in 7 days</em></article>
                    <article><span className="nimda-kpi-icon green"><BadgeCheck/></span><small>Pro businesses</small><b>{m.proBusinesses.toLocaleString()}</b><em>{m.businesses?Math.round(m.proBusinesses/m.businesses*100):0}% of all businesses</em></article>
                    <article><span className="nimda-kpi-icon orange"><EyeIcon/></span><small>Page visits · 7 days</small><b>{m.views7d.toLocaleString()}</b><em className={m.views7d>=m.viewsPrior7d?'positive':'negative'}>{m.views7d>=m.viewsPrior7d?<ArrowUpRight/>:<ArrowDownRight/>}{m.viewsPrior7d?`${Math.round((m.views7d-m.viewsPrior7d)/m.viewsPrior7d*100)}%`:'No prior week data'} vs last week</em></article>
                    <article><span className="nimda-kpi-icon violet"><Package/></span><small>Active products & services</small><b>{m.activeProducts.toLocaleString()}</b><em>Stock status set by each seller</em></article>
                </div></section>
                <section id="operations" className="nimda-section nimda-grid-two"><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">SELLER OPERATIONS</p><h2>Open orders</h2></div><span className="nimda-count-pill">Seller follow-up</span></div>{data.pendingOrders.length?data.pendingOrders.map(order=><div className="nimda-list-row" key={order.id}><span className="nimda-list-icon orange"><ShoppingBag/></span><div><b>{order.customer_name||'Customer'}</b><small>{order.users?.business_name||'Seller'} · {money(Number(order.total_amount||0))} · {date(order.created_at)}</small></div>{order.users?.whatsapp_number&&<a href={wa(order.users.whatsapp_number)} target="_blank" rel="noreferrer">Seller <ExternalLink/></a>}<span className="nimda-status">Needs reply</span></div>):<div className="nimda-empty"><CheckCircle2/><b>No orders waiting</b><span>New requests will show here.</span></div>}<p className="nimda-panel-note">Use the seller’s WhatsApp link above to help move a pending request forward.</p></article><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">UPCOMING</p><h2>Bookings this week</h2></div><span className="nimda-count-pill">{m.bookings7d} total</span></div>{data.upcomingBookings.length?data.upcomingBookings.map(item=><div className="nimda-list-row" key={item.id}><span className="nimda-list-icon violet"><CalendarDays/></span><div><b>{item.customer_name} · {item.service_name}</b><small>{item.users?.business_name||'Business'} · {date(item.booking_date)} at {String(item.booking_time).slice(0,5)}</small></div></div>):<div className="nimda-empty"><CheckCircle2/><b>No bookings this week</b></div>}</article></section>
                <section id="catalog" className="nimda-section">
                    <div className="nimda-catalog-alert">
                        <div className="nimda-catalog-icon"><Package/></div>
                        <div><p className="nimda-eyebrow">SELLER-MANAGED STOCK</p><h2>In-stock listings stay available</h2><p>Customers see a listing as in stock until its seller changes the status. Qriblo does not require periodic availability reconfirmation.</p></div>
                    </div>
                    <article className="nimda-panel nimda-stale-list"><p className="nimda-panel-note">{m.activeProducts.toLocaleString()} active products and services are listed across Qriblo. Sellers can update stock status whenever it changes.</p></article>
                </section>
                <section id="referrals" className="nimda-section">
                    <div className="nimda-section-heading"><div><p className="nimda-eyebrow">GROWTH PROGRAM</p><h2>Referral program</h2></div><span>₦3,000 for every 5 Pro referrals</span></div>
                    {actionError&&<p className="nimda-form-error" role="alert">{actionError}</p>}
                    <div className="nimda-referral-stats">
                        <article><span>Members</span><b>{data.referralSummary.members.toLocaleString()}</b><small>Businesses that joined</small></article>
                        <article><span>Referred businesses</span><b>{data.referralSummary.referredBusinesses.toLocaleString()}</b><small>Signup links attributed</small></article>
                        <article><span>Now on Pro</span><b>{data.referralSummary.proBusinesses.toLocaleString()}</b><small>Paying referred businesses</small></article>
                        <article><span>Paid out</span><b>{money(data.referralSummary.paidNaira)}</b><small>{data.referralPayouts.filter(p=>p.status==='paid').length} recorded payments</small></article>
                    </div>
                    <article className="nimda-panel nimda-referral-panel">
                        <div className="nimda-panel-heading"><div><p className="nimda-eyebrow">PARTICIPANTS & EARNINGS</p><h2>People who joined</h2></div><label className="nimda-search"><Search/><input value={referralQuery} onChange={event=>setReferralQuery(event.target.value)} placeholder="Find a member"/></label></div>
                        <p className="nimda-panel-note">After transferring ₦3,000 to the saved account, record one payout for each eligible group of 5 active Pro referrals.</p>
                        {filteredReferrals.length?filteredReferrals.map(person=>{
                            const bank=person.referral_payment_details||{}
                            const canPay=person.pendingEligible>0&&Boolean(bank.accountNumber)
                            return <div className="nimda-referral-row" key={person.id}>
                                <div className="nimda-referral-person"><span className="nimda-referral-avatar">{(person.business_name||person.email||'R').slice(0,1).toUpperCase()}</span><div><b>{person.business_name||'Unnamed business'}</b><small>{person.email||'No email'}{person.whatsapp_number?' · '+person.whatsapp_number:''}</small></div></div>
                                <div className="nimda-referral-numbers"><span><b>{person.referralTotal}</b>Joined</span><span><b>{person.payingReferrals}</b>Pro</span><span><b>{person.paidPayoutCount}</b>Paid rounds</span><span><b>{money(person.paidNaira)}</b>Paid out</span></div>
                                <details className="nimda-bank-details"><summary>{bank.accountNumber?'Payout account':'Add payout account'}</summary>{bank.accountNumber?<div><b>{bank.bankName||'Bank'}</b><span>{bank.accountName||'Account name'}</span><code>{bank.accountNumber}</code></div>:<span>Member has not added bank details.</span>}</details>
                                <div className="nimda-referral-action">{person.pendingEligible>0?<><b>{person.pendingEligible} eligible · {money(person.pendingEligible*3000)}</b><button disabled={!canPay||savingId===person.id} onClick={()=>recordReferralPayout(person.id)}>{savingId===person.id?'Saving…':bank.accountNumber?'Record ₦3,000 paid':'Bank details needed'}</button></>:<small>{person.payingReferrals%5} of 5 toward next payout</small>}</div>
                            </div>
                        }):<div className="nimda-empty"><Users/><b>{data.referralParticipants.length?'No members match that search':'No referral members yet'}</b></div>}
                        <div className="nimda-payout-history"><h3>Recent payout records</h3>{data.referralPayouts.slice(0,8).map(payout=>{const person=data.referralParticipants.find(item=>item.id===payout.user_id);return <div key={payout.id}><span>{person?.business_name||person?.email||'Referral member'} · {date(payout.created_at)}</span><b className={payout.status==='paid'?'nimda-good':'nimda-pending'}>{money(Number(payout.amount||0))} · {payout.status}</b></div>})}{!data.referralPayouts.length&&<p className="nimda-panel-note">No payouts recorded yet.</p>}</div>
                    </article>
                </section>
                <section id="businesses" className="nimda-section nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">MERCHANTS</p><h2>Latest businesses</h2></div><label className="nimda-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a business or email"/></label></div><div className="nimda-table-wrap"><table className="nimda-table"><thead><tr><th>Business</th><th>Plan</th><th>Joined</th><th>Verification</th><th>Open</th></tr></thead><tbody>{filtered.map(b=><tr key={b.id}><td><b>{b.business_name||'Business name missing'}</b><small>{b.email} · qriblo.com/{b.business_slug||'no-link-yet'}</small></td><td><span className={`nimda-plan ${b.plan==='pro'?'pro':''}`}>{b.plan==='pro'?'PRO':'FREE'}</span></td><td>{date(b.created_at)}</td><td>{b.verification_status==='approved'?<span className="nimda-good">Verified</span>:b.verification_status==='pending'?<span className="nimda-pending">Needs review</span>:<span className="nimda-muted">Not verified</span>}</td><td><a href={b.business_slug?`/${b.business_slug}`:'/dashboard'} target="_blank" rel="noreferrer">View <ExternalLink/></a></td></tr>)}</tbody></table>{!filtered.length&&<div className="nimda-empty">No businesses match that search.</div>}</div><p className="nimda-panel-note">Referral participation and payout progress are tracked in the <a href="#referrals">Referral program</a> section.</p></section>
                <section className="nimda-section nimda-grid-two"><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">VERIFY SELLERS</p><h2>Businesses to review</h2></div><span className="nimda-count-pill">{m.pendingVerifications}</span></div>{data.pendingVerifications.length?data.pendingVerifications.map(item=><div className="nimda-list-row" key={item.id}><span className="nimda-list-icon violet"><ShieldCheck/></span><div><b>{item.business_name||'Business name missing'}</b><small>{item.email} · joined {date(item.created_at)}</small></div>{item.verification_document_url&&<a href={item.verification_document_url} target="_blank" rel="noreferrer">View ID <ExternalLink/></a>}<button disabled={savingId===item.id} onClick={()=>updateItem('verification',item.id,'approved')}>Approve</button><button disabled={savingId===item.id} onClick={()=>updateItem('verification',item.id,'rejected')}>Reject</button></div>):<div className="nimda-empty"><CheckCircle2/><b>No businesses waiting for verification</b></div>}</article><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">CUSTOMER SUPPORT</p><h2>Feedback to review</h2></div><span className="nimda-count-pill">{m.pendingFeedback}</span></div>{actionError&&<p className="nimda-form-error" role="alert">{actionError}</p>}{data.recentFeedback.length?data.recentFeedback.map(item=><div className="nimda-feedback" key={item.id}><div><span className="nimda-feedback-type">{item.type}</span><small>{date(item.created_at)}</small></div><p>{item.message}</p><div className="nimda-feedback-actions"><button disabled={savingId===item.id} onClick={()=>updateItem('feedback',item.id,'reviewed')}>Mark reviewed</button><button disabled={savingId===item.id} onClick={()=>updateItem('feedback',item.id,'resolved')}>Resolve</button></div></div>):<div className="nimda-empty"><CheckCircle2/><b>Inbox is clear</b></div>}<a className="nimda-panel-footer" href="mailto:qriblovirtual@gmail.com">Contact support inbox <ArrowRight/></a></article></section>
                <section id="marketing" className="nimda-section">
                    <div className="nimda-section-heading"><div><p className="nimda-eyebrow">MARKETING · LAST 14 DAYS</p><h2>Where customers come from</h2></div><span>{m.views30d.toLocaleString()} page visits in 30 days</span></div>
                    <div className="nimda-growth-layout">
                        <article className="nimda-panel nimda-traffic-panel">
                            <div className="nimda-panel-heading"><div><p className="nimda-eyebrow">DAILY VISITS</p><h2>{m.views7d.toLocaleString()} this week</h2></div><span className={m.views7d>=m.viewsPrior7d?'nimda-positive-pill':'nimda-neutral-pill'}>{m.viewsPrior7d?(m.views7d>=m.viewsPrior7d?'+':'')+Math.round((m.views7d-m.viewsPrior7d)/m.viewsPrior7d*100)+'% vs prior week':'No prior-week data'}</span></div>
                            <div className="nimda-traffic-chart">
                                <svg viewBox="0 0 700 190" preserveAspectRatio="none" role="img" aria-label="Daily page visits over the last 14 days">
                                    <defs><linearGradient id="nimda-traffic-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c65a24" stopOpacity=".25"/><stop offset="100%" stopColor="#c65a24" stopOpacity=".015"/></linearGradient></defs>
                                    {[32,78,124,170].map(y=><line key={y} x1="0" x2="700" y1={y} y2={y} className="nimda-chart-gridline"/>)}
                                    {trafficArea&&<path d={trafficArea} fill="url(#nimda-traffic-fill)"/>}
                                    {trafficLine&&<path d={trafficLine} className="nimda-chart-line"/>}
                                    {trafficPoints.map((point,index)=><circle key={index} cx={point.x} cy={point.y} r={index===trafficPoints.length-1?4:2.5} className="nimda-chart-dot"><title>{point.label}: {point.count} visits</title></circle>)}
                                </svg>
                            </div>
                            <div className="nimda-chart-labels">{trafficLabels.map((point,index)=><span key={point.label+'-'+index}>{point.label}</span>)}</div>
                        </article>
                        <article className="nimda-panel nimda-sources-panel">
                            <div className="nimda-panel-heading"><div><p className="nimda-eyebrow">DISCOVERY SOURCES</p><h2>Visit origins</h2></div><span>30 days</span></div>
                            {m.marketingSources.length?m.marketingSources.map(source=><div className="nimda-source-row" key={source.source}><div><span title={source.source}>{source.source}</span><b>{source.count.toLocaleString()}</b></div><div className="nimda-source-track"><i style={{width:Math.max(3,source.count/m.maxSource*100)+'%'}}/></div></div>):<div className="nimda-empty"><Activity/><b>No sources recorded yet</b><span>Visits will appear as customers open business pages.</span></div>}
                        </article>
                    </div>
                </section>
                <section className="nimda-section nimda-grid-two"><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">REVENUE · 30 DAYS</p><h2>{money(m.revenueNaira)}</h2><small>From {m.paidCount} successful Paystack payments</small></div><span className="nimda-kpi-icon green"><Banknote/></span></div><div className="nimda-revenue-foot"><span><CheckCircle2/>{m.paidCount} successful</span><span className={m.failedPayments?'warning':''}><CircleAlert/>{m.failedPayments} failed</span></div></article><article className="nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">VIRTUAL ASSISTANT · 30 DAYS</p><h2>{m.assistantEvents30d.toLocaleString()} tracked actions</h2></div><span className="nimda-kpi-icon orange"><Bot/></span></div><p className="nimda-panel-note">{m.assistantEvents30d ? 'Inquiry and follow-up actions recorded in the last 30 days.' : 'No assistant actions were recorded in the last 30 days.'}</p><div className="nimda-assistant-stat">{m.views30d.toLocaleString()} page visits in the same period</div></article></section>
                <section id="payments" className="nimda-section nimda-panel nimda-payments">
                    <div className="nimda-panel-heading"><div><p className="nimda-eyebrow">PAYSTACK · LAST 30 DAYS</p><h2>Payments and subscription events</h2></div><span>{data.paystackTransactions.length} recent records</span></div>
                    <div className="nimda-payment-summary"><div><small>Collected in NGN</small><b>{money(m.revenueNaira)}</b></div><div><small>Successful</small><b>{m.paidCount}</b></div><div><small>Failed</small><b>{m.failedPayments}</b></div></div>
                    <div className="nimda-payment-list">{data.paystackTransactions.slice(0,30).map(tx=><article key={tx.id}>
                        <div className="nimda-payment-main"><span className={'nimda-payment-status '+(tx.status==='success'?'success':tx.status==='failed'?'failed':'other')}>{String(tx.status).replaceAll('_',' ')}</span><b>{tx.currency==='NGN'?money(tx.amountMajor):tx.amountMajor?new Intl.NumberFormat('en-NG',{style:'currency',currency:tx.currency}).format(tx.amountMajor):'—'}</b></div>
                        <div className="nimda-payment-details"><span>{tx.businessName||tx.email}</span><small>{tx.businessName?tx.email+' · ':''}{tx.event}{tx.planCode?' · '+tx.planCode:''}</small></div>
                        <div className="nimda-payment-reference"><code title={tx.reference}>{tx.reference||'No reference'}</code><time>{new Date(tx.createdAt).toLocaleString('en-NG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</time></div>
                    </article>)}
                    {!data.paystackTransactions.length&&<div className="nimda-empty"><Banknote/><b>No Paystack records in the last 30 days</b><span>Successful, failed, and subscription events will appear here.</span></div>}</div>
                </section>
                <section className="nimda-section nimda-panel"><div className="nimda-panel-heading"><div><p className="nimda-eyebrow">TEAM AUDIT</p><h2>Recent admin changes</h2></div><span>Last 8 actions</span></div>{data.recentAdminActions.length?data.recentAdminActions.map(item=><div className="nimda-list-row" key={item.id}><span className="nimda-list-icon violet"><ShieldCheck/></span><div><b>{item.action.replaceAll('_',' ')}</b><small>{item.admin_email} · {date(item.created_at)}</small></div></div>):<div className="nimda-empty"><Activity/><b>No admin changes yet</b></div>}</section>
                <section id="support" className="nimda-section nimda-bottom-note"><Clock3/><span><b>Daily team rhythm:</b> review orders and bookings, verify sellers, follow up on support, then review catalog quality and weekly growth.</span></section>
                <footer className="nimda-footer">Qriblo Admin <span/> Clear view. Better decisions. <a href="mailto:qriblovirtual@gmail.com">Get help</a></footer>
            </div>
        </main>
    </div>
}
function EyeIcon(){return <Activity/>}
