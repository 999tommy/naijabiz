import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Private waitlist dashboard',
  robots: { index: false, follow: false, noarchive: true },
}

export default function PrivateWaitlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
