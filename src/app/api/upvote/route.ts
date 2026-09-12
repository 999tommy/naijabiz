import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    const { error } = await supabase.rpc('increment_upvotes', { row_id: userId })

    if (error) {
      console.error('Failed to increment upvotes', error)
      return NextResponse.json({ error: 'Failed to record upvote' }, { status: 500 })
    }

    const { data: business } = await supabase
      .from('users')
      .select('upvotes')
      .eq('id', userId)
      .single()

    return NextResponse.json({ success: true, upvotes: business?.upvotes })
  } catch (err) {
    console.error('Unexpected upvote error', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
