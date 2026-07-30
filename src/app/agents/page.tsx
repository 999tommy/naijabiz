import Image from 'next/image'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, BadgePercent, Banknote, CheckCircle2, ClipboardList, Copy, MessageCircle, Repeat, Share2, ShieldCheck, Target, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
    {
        icon: Users,
        title: 'Register',
        text: 'Create your NaijaBiz account and activate your agent profile with your payout details.',
    },
    {
        icon: Share2,
        title: 'Refer',
        text: 'Share your agent link with vendors, creators, salons, food brands, and service businesses.',
    },
    {
        icon: Banknote,
        title: 'Earn',
        text: 'Earn 15% of the first month when your referral upgrades, plus retention bonuses as clients stay active.',
    },
]

const fitList = [
    'Business consultants and social media managers',
    'Community builders and campus ambassadors',
    'POS agents, print shops, photographers, and creators',
    'Anyone already helping Nigerian businesses get customers online',
]

const toolkit = [
    {
        icon: Copy,
        title: 'Personal referral link',
        text: 'Your own tracked signup link for WhatsApp status, Instagram bio, TikTok captions, flyers, and direct messages.',
    },
    {
        icon: ClipboardList,
        title: 'Simple sales script',
        text: 'A clear pitch: free business link, Pro verified trust badge, service bookings, catalog, and Virtual Assistant.',
    },
    {
        icon: Target,
        title: 'Client tracking',
        text: 'See referred businesses, active Pro clients, retention bonus progress, and paid payout rounds in one place.',
    },
]

const faqs = [
    ['Who can become an agent?', 'Anyone with access to business owners can join: creators, consultants, campus reps, print shops, social media managers, POS agents, and community builders.'],
    ['How do agents earn?', 'Agents earn 15% of the first month when a referred business upgrades to Pro, plus retention bonuses tied to active referred clients.'],
    ['Do referred businesses pay extra?', 'No. Businesses use the same NaijaBiz plans. The agent reward comes from NaijaBiz, not an extra customer charge.'],
    ['What kind of businesses should I refer?', 'Vendors, restaurants, salons, repair artisans, photographers, coaches, clinics, and hybrid businesses that need one trusted link for orders or bookings.'],
]

const payoutRules = [
    'Commission applies only when a referred business upgrades through your tracked link.',
    'First-month commission is 15% of the referred client\'s first Pro payment.',
    'Retention bonuses are based on active referred Pro clients and visible in your dashboard.',
    'Payouts require valid bank details and may be reviewed for duplicate or suspicious signups.',
]

const retentionLadder = [
    ['Month 2-3', '₦200', 'per active Pro client monthly'],
    ['Month 4-6', '₦300', 'per active Pro client monthly'],
    ['Month 7-12', '₦500', 'per active Pro client monthly'],
    ['Month 13+', '₦750', 'per active Pro client monthly'],
]

const milestoneBonuses = [
    ['₦15,000', '10 active Pro clients still subscribed at Month 3'],
    ['₦40,000', '25 active Pro clients still subscribed at Month 3'],
    ['₦100,000', '50 active Pro clients still subscribed at Month 6'],
]

const expectations = [
    'Represent NaijaBiz honestly and never promise features we do not offer.',
    'Refer businesses that genuinely need a storefront, booking page, or AI sales assistant.',
    'Never create a business account for someone without their knowledge and consent.',
    'Help prospects understand the product, then let the tracked link handle signup and attribution.',
]

const trustItems: Array<[LucideIcon, string, string]> = [
    [ShieldCheck, 'Tracked by signup link', 'The referred business is connected to your account when they sign up with your link.'],
    [Banknote, 'Payout details saved once', 'Add bank details from the agent dashboard and update them when needed.'],
    [MessageCircle, 'Easy to explain on WhatsApp', 'The product is simple enough to pitch in one message and demonstrate with live example links.'],
]

const referralTargets = [
    'Restaurants, food vendors, bakers, and caterers',
    'Salons, makeup artists, barbers, spas, and nail techs',
    'Electricians, plumbers, tailors, mechanics, and repair artisans',
    'Fashion, beauty, gadget, book, and handmade product vendors',
    'Photographers, event planners, coaches, consultants, and tutors',
    'Hybrid brands that sell products and take appointments',
]

export default function AgentsPage() {
    return (
        <div className="min-h-screen bg-[#fffaf5] text-[#2a1d1a]">
            <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-[#eadfd8]">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-black">
                        <Image src="/logo.png" alt="NaijaBiz" width={32} height={32} />
                        NaijaBiz
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/agents/dashboard">
                            <Button variant="outline" size="sm" className="border-[#eadfd8] text-[#725e57] hover:bg-[#f9f0ee]">
                                Agent Dashboard
                            </Button>
                        </Link>
                        <Link href="/agents/signup">
                            <Button size="sm" className="bg-[#a84b35] hover:bg-[#8f3e2b] text-white">
                                Become an Agent
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-4">NaijaBiz Agents</p>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-5">
                            Refer businesses. Earn recurring rewards.
                        </h1>
                        <p className="text-lg text-[#725e57] leading-relaxed max-w-xl mb-8">
                            Help Nigerian businesses launch verified pages, collect orders, book appointments, and activate their Virtual Assistant. You earn when your referrals upgrade and keep growing.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link href="/agents/signup">
                                <Button size="lg" className="h-12 px-7 bg-[#a84b35] hover:bg-[#8f3e2b] text-white font-bold">
                                    Become an Agent <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                            <Link href="/agents/dashboard">
                                <Button size="lg" variant="outline" className="h-12 px-7 border-[#eadfd8] text-[#2a1d1a] hover:bg-[#f9f0ee] font-bold">
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white border border-[#eadfd8] rounded-3xl p-6 shadow-[0_24px_70px_rgba(70,35,25,.10)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-[#725e57]">Agent earnings model</p>
                                <h2 className="text-2xl font-black">Earn upfront, then monthly</h2>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-[#f9f0ee] flex items-center justify-center">
                                <BadgePercent className="w-6 h-6 text-[#a84b35]" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                ['First Pro payment', '15% commission', 'Paid when the referral upgrades'],
                                ['Longer billing cycles', 'Quarterly, biannual, yearly', 'Stronger upfront value'],
                                ['Retention bonuses', 'Active referred Pro clients', 'Monthly recurring rewards'],
                            ].map(([title, meta, value]) => (
                                <div key={title} className="flex items-center justify-between gap-4 border border-[#f1e5de] rounded-2xl p-4">
                                    <div>
                                        <p className="font-bold text-gray-900">{title}</p>
                                        <p className="text-sm text-[#806b63]">{meta}</p>
                                    </div>
                                    <p className="text-sm font-black text-[#a84b35] text-right">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Recurring earnings</p>
                            <h2 className="text-3xl font-black mb-4">Earn the first month, then keep earning while clients stay active.</h2>
                            <p className="text-[#725e57] leading-relaxed">
                                The stronger version of this program rewards agents for retained businesses, not just signups. These rates are a working draft until the final NaijaBiz payout policy is confirmed.
                            </p>
                        </div>
                        <div className="bg-white border border-[#eadfd8] rounded-3xl p-5 shadow-sm">
                            <div className="grid sm:grid-cols-2 gap-3">
                                {retentionLadder.map(([period, amount, detail]) => (
                                    <div key={period} className="rounded-2xl border border-[#f1e5de] bg-[#fffaf5] p-4">
                                        <p className="text-xs font-black uppercase tracking-[.14em] text-[#a84b35]">{period}</p>
                                        <p className="text-3xl font-black mt-2">{amount}</p>
                                        <p className="text-sm text-[#725e57] mt-1">{detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white border-y border-[#eadfd8]">
                    <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Milestone bonuses</p>
                            <h2 className="text-3xl font-black mb-4">Build a retained base and unlock lump sums.</h2>
                            <p className="text-[#725e57] leading-relaxed">
                                Milestones help serious agents turn trust into a real book of business. We should finalize whether these bonuses are paid monthly, per cohort, or once per agent tier.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {milestoneBonuses.map(([amount, target]) => (
                                <div key={amount} className="flex items-center justify-between gap-5 rounded-2xl border border-[#eadfd8] bg-[#fffaf5] p-5">
                                    <p className="text-3xl font-black text-[#a84b35]">{amount}</p>
                                    <p className="text-sm font-bold text-[#2a1d1a] text-right">{target}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white border-y border-[#eadfd8]">
                    <div className="max-w-6xl mx-auto px-4 py-14">
                        <div className="grid md:grid-cols-3 gap-5">
                            {steps.map(({ icon: Icon, title, text }) => (
                                <div key={title} className="border border-[#eadfd8] rounded-2xl p-6">
                                    <div className="w-11 h-11 rounded-xl bg-[#f9f0ee] flex items-center justify-center mb-5">
                                        <Icon className="w-5 h-5 text-[#a84b35]" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">{title}</h3>
                                    <p className="text-sm text-[#725e57] leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Agent playbook</p>
                            <h2 className="text-3xl font-black mb-4">A practical program for people who can move local businesses online.</h2>
                            <p className="text-[#725e57] leading-relaxed">
                                NaijaBiz agents do not need to build websites or provide technical support. Your job is to identify businesses that need a credible link, help them understand the value, and share your tracked signup link.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {toolkit.map(({ icon: Icon, title, text }) => (
                                <div key={title} className="bg-white border border-[#eadfd8] rounded-2xl p-5">
                                    <div className="w-10 h-10 rounded-xl bg-[#f9f0ee] flex items-center justify-center mb-4">
                                        <Icon className="w-5 h-5 text-[#a84b35]" />
                                    </div>
                                    <h3 className="font-black mb-2">{title}</h3>
                                    <p className="text-sm text-[#725e57] leading-relaxed">{text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[#f9f0ee] border-y border-[#eadfd8]">
                    <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">What you sell</p>
                            <h2 className="text-3xl font-black mb-4">One offer works across product, service, and hybrid businesses.</h2>
                            <p className="text-[#725e57] leading-relaxed mb-6">
                                Full business software can feel heavy for small merchants. NaijaBiz gives agents a simpler entry pitch: claim a link, show your catalog or services, collect WhatsApp orders or bookings, and upgrade when trust and automation matter.
                            </p>
                            <Link href="/agents/dashboard">
                                <Button className="bg-[#2a1d1a] hover:bg-[#3a2925] text-white font-bold h-12 px-6">
                                    Open agent dashboard <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="bg-white border border-[#eadfd8] rounded-3xl p-5 shadow-sm">
                            {[
                                ['Product vendors', 'Food, fashion, beauty, gadgets, books, handmade goods', 'Catalog + WhatsApp order link'],
                                ['Service artisans', 'Electricians, tailors, makeup artists, photographers, repairers', 'Services + booking enquiries'],
                                ['Hybrid brands', 'Salons selling products, gyms selling plans, creators selling services', 'Products and services together'],
                            ].map(([title, examples, outcome]) => (
                                <div key={title} className="flex gap-4 border-b border-[#f1e5de] last:border-b-0 py-4 first:pt-0 last:pb-0">
                                    <CheckCircle2 className="w-5 h-5 text-[#2e7d52] shrink-0 mt-1" />
                                    <div>
                                        <p className="font-black text-gray-900">{title}</p>
                                        <p className="text-sm text-[#725e57]">{examples}</p>
                                        <p className="text-xs font-bold text-[#a84b35] mt-1">{outcome}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-start">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Who it is for</p>
                        <h2 className="text-3xl font-black mb-4">Built for people who already know business owners.</h2>
                        <p className="text-[#725e57] leading-relaxed">
                            If your network includes vendors, service brands, or creators who need a real business link, NaijaBiz gives you a simple offer to share and a dashboard to track what happens next.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {fitList.map(item => (
                            <div key={item} className="flex gap-3 bg-white border border-[#eadfd8] rounded-2xl p-4">
                                <CheckCircle2 className="w-5 h-5 text-[#2e7d52] shrink-0 mt-0.5" />
                                <p className="text-sm font-semibold text-gray-800">{item}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">What we expect</p>
                            <h2 className="text-3xl font-black mb-4">Generous rewards for honest agents.</h2>
                            <p className="text-[#725e57] leading-relaxed">
                                The program should feel easy to sell because the product is useful, not because agents overpromise.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {expectations.map(item => (
                                <div key={item} className="flex gap-3 bg-white border border-[#eadfd8] rounded-2xl p-4">
                                    <ShieldCheck className="w-5 h-5 text-[#a84b35] shrink-0 mt-0.5" />
                                    <p className="text-sm font-semibold text-[#725e57] leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 pb-16">
                    <div className="bg-[#2a1d1a] text-white rounded-3xl p-8 sm:p-10 text-center">
                        <Repeat className="w-9 h-9 text-[#e8b8aa] mx-auto mb-4" />
                        <h2 className="text-3xl font-black mb-3">Your link does the tracking.</h2>
                        <p className="text-white/65 mb-7 max-w-2xl mx-auto">
                            Every agent gets a referral link. Share it anywhere, then use your dashboard to monitor active clients, payout progress, and earnings.
                        </p>
                        <Link href="/agents/signup">
                            <Button className="bg-[#a84b35] hover:bg-[#8f3e2b] text-white font-bold h-12 px-8">
                                Become an Agent <Copy className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Trust and payouts</p>
                            <h2 className="text-3xl font-black mb-4">Built to be simple, trackable, and honest.</h2>
                            <div className="space-y-3">
                                {trustItems.map(([Icon, title, text]) => (
                                    <div key={title} className="flex gap-3 bg-white border border-[#eadfd8] rounded-2xl p-4">
                                        <Icon className="w-5 h-5 text-[#a84b35] shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black">{title}</p>
                                            <p className="text-sm text-[#725e57]">{text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#2a1d1a] text-white rounded-3xl p-6 shadow-xl">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#e8b8aa] mb-2">Dashboard preview</p>
                                    <h2 className="text-2xl font-black">Know what is working.</h2>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-[#e8b8aa]" />
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-3 mb-5">
                                {[
                                    ['Referrals', '24'],
                                    ['Active Pro', '9'],
                                    ['Paid', '₦18,000'],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl bg-white/10 border border-white/10 p-4">
                                        <p className="text-xs text-white/45">{label}</p>
                                        <p className="text-2xl font-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                {[
                                    ['Queen Chic Beauty', 'Active Pro'],
                                    ['MusaFix Electricals', 'Active Pro'],
                                    ['Temi Cakes', 'Free lead'],
                                ].map(([name, status]) => (
                                    <div key={name} className="flex items-center justify-between rounded-2xl bg-white/10 border border-white/10 p-3">
                                        <p className="text-sm font-bold">{name}</p>
                                        <span className="text-[11px] font-black rounded-full bg-white/10 px-2.5 py-1 text-[#e8b8aa]">{status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-[#eadfd8] rounded-3xl p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Payout rules</p>
                            <h2 className="text-2xl font-black mb-5">Clear rules before you start.</h2>
                            <div className="space-y-3">
                                {payoutRules.map(rule => (
                                    <div key={rule} className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#2e7d52] shrink-0 mt-0.5" />
                                        <p className="text-sm text-[#725e57] leading-relaxed">{rule}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 rounded-2xl bg-[#fffaf5] border border-[#eadfd8] p-4">
                                <p className="text-sm font-black text-gray-900 mb-1">Program terms</p>
                                <p className="text-sm text-[#725e57] leading-relaxed">
                                    Agent rewards are promotional and can be withheld for self-referrals, fake accounts, duplicate businesses, chargebacks, or abuse. NaijaBiz may update rates and eligibility rules with notice.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-[#eadfd8] rounded-3xl p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Who to refer</p>
                            <h2 className="text-2xl font-black mb-5">Look for businesses with customer intent.</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {referralTargets.map(target => (
                                    <div key={target} className="rounded-2xl border border-[#f1e5de] p-4">
                                        <p className="text-sm font-bold text-gray-900">{target}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 pb-16">
                    <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8">
                        <div className="bg-white border border-[#eadfd8] rounded-3xl p-6">
                            <h2 className="text-2xl font-black mb-5">Agent FAQ</h2>
                            <div className="space-y-4">
                                {faqs.map(([q, a]) => (
                                    <div key={q} className="border-b border-[#f1e5de] last:border-b-0 pb-4 last:pb-0">
                                        <p className="font-black text-gray-900">{q}</p>
                                        <p className="text-sm text-[#725e57] leading-relaxed mt-1">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-3xl bg-[#f9f0ee] border border-[#eadfd8] p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#a84b35] mb-3">Field checklist</p>
                            <h2 className="text-2xl font-black mb-5">A quick pitch agents can use.</h2>
                            <div className="space-y-3">
                                {[
                                    'Ask if the business has one link that shows what they sell or offer.',
                                    'Show the Tola\'s Kitchen or MusaFix demo depending on their business type.',
                                    'Explain that free pages list up to 5 products or services.',
                                    'Explain that Pro adds verification, reviews, AI assistant, analytics, and priority display.',
                                    'Send your referral link and follow up after they create their page.',
                                ].map(item => (
                                    <div key={item} className="flex gap-3 rounded-2xl bg-white border border-[#eadfd8] p-4">
                                        <ClipboardList className="w-5 h-5 text-[#a84b35] shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium text-[#725e57]">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
