import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simple plans for your professional site',
  description: 'Compare Qriblo Free and Pro plans for business pages, product catalogs, virtual assistant messages, and booking requests.',
  alternates: { canonical: '/pricing' },
  openGraph: { title: 'Qriblo pricing', description: 'Find the right tools for your products, services, and customer conversations.', url: '/pricing' },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
