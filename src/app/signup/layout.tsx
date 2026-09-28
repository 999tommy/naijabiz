import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a professional site',
  description: 'Create a Qriblo page for your business, products, services, and bookings.',
  robots: { index: false, follow: true },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
