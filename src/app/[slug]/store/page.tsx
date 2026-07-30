import { permanentRedirect } from 'next/navigation'

export default async function LegacyStorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    permanentRedirect(`/${slug}`)
}
