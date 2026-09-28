import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Qriblo agent programme',
  robots: { index: false, follow: true },
}

export default function AgentSignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
