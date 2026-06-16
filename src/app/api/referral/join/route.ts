import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => request.cookies.getAll(),
                    setAll: () => {},
                },
            }
        )

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { bankName, accountNumber, accountName } = body

        if (!bankName || !accountNumber || !accountName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { error } = await supabase
            .from('users')
            .update({
                has_joined_referral: true,
                referral_payment_details: {
                    bankName,
                    accountNumber,
                    accountName
                }
            })
            .eq('id', user.id)

        if (error) {
            console.error('Failed to update referral details:', error)
            return NextResponse.json({ error: 'Failed to join referral program' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Referral join error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
