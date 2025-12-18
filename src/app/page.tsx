import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SearchDirectory } from '@/components/SearchDirectory'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Lock,
  Search,
  MapPin,
  Smartphone
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const { count: verifiedCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-green-100 selection:text-green-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight text-gray-900">NaijaBiz</span>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold tracking-wide uppercase">
              BETA
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
              Log in
            </Link>
            <Link href="/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6">
                Create free page
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-[1.1]">
          Your business needs a <span className="text-green-600">simple online page</span> that brings customers
        </h1>

        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create a free business page you can share on WhatsApp and Instagram — so customers can message you, find you, and place orders easily.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl shadow-green-200 hover:shadow-2xl hover:shadow-green-300 transition-all transform hover:-translate-y-1">
              Create my free business page
            </Button>
          </Link>
          <Link href="/directory" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600">
              See example pages
            </Button>
          </Link>
        </div>

        <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> No website needed</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-green-500" /> Works on WhatsApp</span>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span>Takes 2 minutes</span>
        </p>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>

          <div className="grid md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-4 border-white shadow-lg">1</div>
              <h3 className="text-xl font-bold mb-3">Create your page</h3>
              <p className="text-gray-600">Enter your business name, location, photos, and what you sell. It's simple.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-4 border-white shadow-lg">2</div>
              <h3 className="text-xl font-bold mb-3">Share your link</h3>
              <p className="text-gray-600">Put your NaijaBiz link on WhatsApp status, Instagram bio, or send it to customers.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 border-4 border-white shadow-lg">3</div>
              <h3 className="text-xl font-bold mb-3">Get messages & orders</h3>
              <p className="text-gray-600">Customers click your link, see what you sell, and message you on WhatsApp to pay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Life Example */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden relative">
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="text-white">
                <div className="inline-block bg-white/10 backdrop-blur-md rounded-full px-4 py-1 text-sm font-medium text-green-300 mb-6 border border-white/10">
                  REAL LIFE EXAMPLE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Madam Tola sells food in Surulere.
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Before, she had to send food pictures one by one. Now, she just shares her <span className="text-green-400 font-bold">NaijaBiz link</span> on WhatsApp status.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Customers see her menu</h4>
                      <p className="text-sm text-gray-400">They browse her page without asking "what do you have?"</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">They message her on WhatsApp</h4>
                      <p className="text-sm text-gray-400">"Madam Tola, I want 2 plates of Jollof." - Sent from NaijaBiz.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <ArrowRight className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Result: More orders, less stress.</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                {/* Simulated Phone UI or Card */}
                <div className="bg-white rounded-3xl p-6 rotate-3 shadow-2xl max-w-sm mx-auto border-4 border-gray-800">
                  <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">T</div>
                    <div>
                      <h3 className="font-bold text-gray-900">Tola's Kitchen</h3>
                      <p className="text-xs text-gray-500">Surulere, Lagos</p>
                    </div>
                    <VerifiedBadge size="sm" showText={false} />
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div>
                        <div className="h-3 w-24 bg-gray-100 rounded mb-2"></div>
                        <div className="h-2 w-16 bg-gray-50 rounded"></div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0"></div>
                      <div>
                        <div className="h-3 w-28 bg-gray-100 rounded mb-2"></div>
                        <div className="h-2 w-20 bg-gray-50 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Order on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you get for free</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">A beautiful business page</h3>
                <p className="text-gray-500 text-sm">With your business name, photos, location, and logo.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">WhatsApp "Message Me" button</h3>
                <p className="text-gray-500 text-sm">Customers can chat with you in one click.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">A unique link (naijabiz.org/you)</h3>
                <p className="text-gray-500 text-sm">Easy to share anywhere on the internet.</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900">Appear in NaijaBiz search</h3>
                <p className="text-gray-500 text-sm">New customers can find you when searching your category.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-white" id="pricing">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl border border-gray-200 bg-white">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free Plan</h3>
              <p className="text-gray-500 mb-6">Forever.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  Your own business page
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  WhatsApp contact button
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  Shareable link
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  Appear in search
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-full h-12">
                  Create free page
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl border-2 border-green-600 bg-green-50/30 relative overflow-hidden">
              <div className="absolute top-5 right-5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Recommended
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-gray-900">₦1,400</span>
                <span className="text-gray-500">/month</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 font-medium text-gray-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Everything in Free
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Green Verified Badge
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Appear higher in search
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Customer reviews
                </li>
                <li className="flex items-center gap-3 font-medium text-gray-900">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Page visit statistics
                </li>
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-green-600 text-white hover:bg-green-700 rounded-full h-12 shadow-lg shadow-green-100">
                  Upgrade anytime
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            NaijaBiz is built for Nigerian small businesses — barbers, salons, food vendors, repairers, and more.
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join {verifiedCount || '500'}+ businesses putting their business online the simple way.
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale">
            {/* Placeholders for logos if needed */}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-green-50 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to get more customers?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Create your free business page in 2 minutes.
          </p>
          <Link href="/signup">
            <Button size="lg" className="h-14 px-10 text-lg font-bold bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl shadow-green-200">
              Create my free business page
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} NaijaBiz. Made with ❤️ in Lagos.
        </p>
        <div className="flex justify-center gap-6 mt-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-gray-900">Terms</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          <Link href="/directory" className="hover:text-gray-900">Directory</Link>
        </div>
      </footer>
    </div>
  )
}
