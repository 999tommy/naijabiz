import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'
    const isSignup = searchParams.get('signup') === 'true'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if user has a profile
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .single()

                // If no profile and this is a signup, redirect to complete signup
                if (!profile && isSignup) {
                    return NextResponse.redirect(`${origin}/signup?step=business`)
                }

                // If no profile, create a placeholder and redirect to dashboard
                if (!profile) {
                    await supabase.from('users').insert({
                        id: user.id,
                        email: user.email,
                        plan: 'free',
                    })
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
