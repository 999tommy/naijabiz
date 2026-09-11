'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAiSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const ai_enabled = formData.get('ai_enabled') === 'on'
    const wa_whatsapp_enabled = formData.get('wa_whatsapp_enabled') === 'on'
    const ai_instructions = formData.get('ai_instructions') as string
    const ai_welcome_msg = formData.get('ai_welcome_msg') as string
    const ai_persona = (formData.get('ai_persona') as string) || 'friendly'
    const business_type = (formData.get('business_type') as string) || 'products'
    const bank_name = formData.get('bank_name') as string
    const account_number = formData.get('account_number') as string

    const { error } = await supabase
        .from('users')
        .update({
            ai_enabled,
            wa_whatsapp_enabled,
            ai_instructions,
            ai_welcome_msg,
            ai_persona,
            business_type,
            bank_name,
            account_number,
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/ai')
    return { success: true }
}
