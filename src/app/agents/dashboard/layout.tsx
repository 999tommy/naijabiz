import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agent dashboard',
  robots: { index: false, follow: false, noarchive: true },
}

export default function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
