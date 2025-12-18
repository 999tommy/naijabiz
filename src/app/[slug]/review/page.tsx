import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewForm } from './ReviewForm'

export const dynamic = 'force-dynamic'

interface ReviewPageProps {
    params: Promise<{ slug: string }>
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const { slug } = await params
    const supabase = await createClient()

    const { data: business } = await supabase
        .from('users')
        .select('id, business_name, business_slug, plan')
        .eq('business_slug', slug)
        .single()

    if (!business || !business.business_name) {
        notFound()
    }

    // Only Pro businesses can receive reviews
    if (business.plan !== 'pro') {
        redirect(`/${slug}`)
    }

    return (
        <ReviewForm
            businessId={business.id}
            businessName={business.business_name}
            businessSlug={business.business_slug || slug}
        />
    )
}
